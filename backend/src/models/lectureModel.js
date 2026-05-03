const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fileName: String,
    filePath: String,
    summary: String, // التلخيص اللي هيطلعه Gemini
    quizData: Array,  // الأسئلة اللي هيطلعها Gemini
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lecture', lectureSchema);