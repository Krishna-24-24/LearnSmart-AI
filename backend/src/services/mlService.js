const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 5000,
});

async function updateMastery(skill, correct, currentMastery = 0.3) {
  const { data } = await client.post('/bkt/update', {
    skill,
    correct,
    currentMastery,
  });
  return data;
}

async function batchUpdateMastery(responses) {
  const { data } = await client.post('/bkt/batch-update', { responses });
  return data;
}

async function selectDifficulty(skill, mastery, availableDifficulties) {
  const { data } = await client.post('/irt/select-difficulty', {
    skill,
    mastery,
    availableDifficulties,
  });
  return data;
}

async function getAnalytics(masteryMap) {
  const { data } = await client.post('/analytics', { masteryMap });
  return data;
}

async function getRecommendation(masteryMap, skill = null) {
  const { data } = await client.post('/recommendations', { masteryMap, skill });
  return data;
}

async function getBatchRecommendations(masteryMap) {
  const { data } = await client.post('/recommendations/batch', { masteryMap });
  return data;
}

module.exports = {
  updateMastery,
  batchUpdateMastery,
  selectDifficulty,
  getAnalytics,
  getRecommendation,
  getBatchRecommendations,
};
