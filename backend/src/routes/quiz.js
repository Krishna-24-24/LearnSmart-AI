const express = require('express');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const Mastery = require('../models/Mastery');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const { authMiddleware } = require('../middleware/auth');
const mlService = require('../services/mlService');

const router = express.Router();

const DIAGNOSTIC_SKILLS = [
  'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues',
  'Trees', 'Graphs', 'Binary Search', 'Dynamic Programming',
  'Arrays', 'Strings', 'Trees', 'Graphs', 'Binary Search', 'Dynamic Programming',
];

async function getMasteryMap(userId) {
  const records = await Mastery.find({ userId });
  return Object.fromEntries(records.map((r) => [r.skill, r.masteryScore]));
}

async function updateSkillMastery(userId, skill, correct) {
  let record = await Mastery.findOne({ userId, skill });
  if (!record) {
    record = await Mastery.create({ userId, skill, masteryScore: 0.3 });
  }

  const result = await mlService.updateMastery(skill, correct, record.masteryScore);
  record.masteryScore = result.updatedMastery;
  record.updatedAt = new Date();
  await record.save();
  return record;
}

router.get('/diagnostic', authMiddleware, async (req, res) => {
  try {
    const questions = [];
    for (const skill of DIAGNOSTIC_SKILLS) {
      const q = await Question.findOne({ skill, difficulty: 'medium' });
      if (q) {
        questions.push({
          id: q._id,
          skill: q.skill,
          difficulty: q.difficulty,
          text: q.text,
          options: q.options,
        });
      }
    }

    if (questions.length < 15) {
      const fallback = await Question.find().limit(15);
      return res.json({
        questions: fallback.map((q) => ({
          id: q._id,
          skill: q.skill,
          difficulty: q.difficulty,
          text: q.text,
          options: q.options,
        })),
      });
    }

    res.json({ questions: questions.slice(0, 15) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/diagnostic/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    const results = [];
    for (const item of answers) {
      const question = await Question.findById(item.questionId);
      if (!question) continue;

      const correct = item.selectedOption === question.answer;
      await Attempt.create({
        userId: req.user.id,
        questionId: question._id,
        skill: question.skill,
        selectedOption: item.selectedOption,
        correctness: correct,
        quizType: 'diagnostic',
      });

      const mastery = await updateSkillMastery(req.user.id, question.skill, correct);
      results.push({
        questionId: question._id,
        skill: question.skill,
        correct,
        updatedMastery: mastery.masteryScore,
      });
    }

    await User.findByIdAndUpdate(req.user.id, { diagnosticCompleted: true });
    const masteryMap = await getMasteryMap(req.user.id);

    res.json({
      results,
      masteryMap,
      message: 'Diagnostic assessment completed',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/adaptive', authMiddleware, async (req, res) => {
  try {
    const masteryRecords = await Mastery.find({ userId: req.user.id }).sort({ masteryScore: 1 });
    const selectedQuestions = [];
    const usedIds = new Set();
    const targetCount = 10;

    for (const record of masteryRecords) {
      if (selectedQuestions.length >= targetCount) break;

      const irtResult = await mlService.selectDifficulty(record.skill, record.masteryScore);
      const difficulty = irtResult.recommendedDifficulty;

      let question = await Question.findOne({
        skill: record.skill,
        difficulty,
        _id: { $nin: [...usedIds] },
      });

      if (!question) {
        question = await Question.findOne({
          skill: record.skill,
          _id: { $nin: [...usedIds] },
        });
      }

      if (question) {
        usedIds.add(question._id.toString());
        selectedQuestions.push({
          id: question._id,
          skill: question.skill,
          difficulty: question.difficulty,
          text: question.text,
          options: question.options,
          targetMastery: record.masteryScore,
          recommendedDifficulty: difficulty,
        });
      }
    }

    while (selectedQuestions.length < targetCount) {
      const q = await Question.findOne({ _id: { $nin: [...usedIds] } });
      if (!q) break;
      usedIds.add(q._id.toString());
      selectedQuestions.push({
        id: q._id,
        skill: q.skill,
        difficulty: q.difficulty,
        text: q.text,
        options: q.options,
      });
    }

    res.json({ questions: selectedQuestions, count: selectedQuestions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/adaptive/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    const results = [];
    let correctCount = 0;

    for (const item of answers) {
      const question = await Question.findById(item.questionId);
      if (!question) continue;

      const correct = item.selectedOption === question.answer;
      if (correct) correctCount++;

      await Attempt.create({
        userId: req.user.id,
        questionId: question._id,
        skill: question.skill,
        selectedOption: item.selectedOption,
        correctness: correct,
        quizType: 'adaptive',
      });

      const mastery = await updateSkillMastery(req.user.id, question.skill, correct);
      results.push({
        questionId: question._id,
        skill: question.skill,
        correct,
        explanation: question.explanation,
        updatedMastery: mastery.masteryScore,
      });
    }

    const masteryMap = await getMasteryMap(req.user.id);
    const analytics = await mlService.getAnalytics(masteryMap);
    const recommendations = await mlService.getBatchRecommendations(masteryMap);

    await Recommendation.deleteMany({ userId: req.user.id });
    for (const rec of recommendations) {
      await Recommendation.create({
        userId: req.user.id,
        skill: rec.skill,
        masteryScore: rec.masteryScore,
        explanation: rec.explanation,
        commonError: rec.commonError,
        suggestedAction: rec.suggestedAction,
      });
    }

    res.json({
      results,
      summary: {
        total: results.length,
        correct: correctCount,
        scorePercent: Math.round((correctCount / results.length) * 100),
      },
      masteryMap,
      analytics,
      recommendations,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/answer', authMiddleware, async (req, res) => {
  try {
    const { questionId, selectedOption, quizType = 'adaptive' } = req.body;
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const correct = selectedOption === question.answer;
    await Attempt.create({
      userId: req.user.id,
      questionId: question._id,
      skill: question.skill,
      selectedOption,
      correctness: correct,
      quizType,
    });

    const mastery = await updateSkillMastery(req.user.id, question.skill, correct);

    res.json({
      correct,
      correctAnswer: question.answer,
      explanation: question.explanation,
      skill: question.skill,
      updatedMastery: mastery.masteryScore,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
