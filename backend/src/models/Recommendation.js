const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  masteryScore: Number,
  explanation: String,
  commonError: String,
  suggestedAction: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
