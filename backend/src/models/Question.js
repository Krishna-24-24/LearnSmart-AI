const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: Number, required: true },
  explanation: String,
});

module.exports = mongoose.model('Question', questionSchema);
