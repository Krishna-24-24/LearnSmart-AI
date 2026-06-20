const mongoose = require('mongoose');

const masterySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  masteryScore: { type: Number, default: 0.3, min: 0, max: 1 },
  updatedAt: { type: Date, default: Date.now },
});

masterySchema.index({ userId: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model('Mastery', masterySchema);
