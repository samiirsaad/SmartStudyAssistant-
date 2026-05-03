const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { processLecture, getLectures, deleteLectureById } = require('../controllers/studyController');

// تأكد أن كلمة 'pdf' هنا هي نفس الكلمة اللي هتستخدمها في الـ Frontend عند رفع الملف
router.post('/upload', upload.single('pdf'), processLecture);

// Get all lectures
router.get('/lectures', getLectures);

// Delete a lecture by ID
router.delete('/lectures/:id', deleteLectureById);

module.exports = router;