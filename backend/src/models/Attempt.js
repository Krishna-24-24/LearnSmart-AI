const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  skill: { type: String, required: true },
  selectedOption: { type: Number, required: true },
  correctness: { type: Boolean, required: true },
  quizType: { type: String, enum: ['diagnostic', 'adaptive'], default: 'adaptive' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Attempt', attemptSchema);
