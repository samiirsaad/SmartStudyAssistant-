const express = require('express');
const router = express.Router();
const {
    getUserStats,
    getStudyData,
    getQuizData,
    saveQuizResult
} = require('../controllers/statsController');

// إحصائيات المستخدم: عدد المحاضرات، الـ Streak، الـ Mastery
router.get('/user-stats', getUserStats);

// بيانات الموضوعات للدراسة
router.get('/study-data', getStudyData);

// بيانات الاختبار لمحاضرة معينة
router.get('/quiz-data', getQuizData);

// حفظ نتيجة اختبار
router.post('/quiz-result', saveQuizResult);

module.exports = router;
