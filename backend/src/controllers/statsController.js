const { getAllLectures, getLecturesBySubjectId } = require('../services/csvService');
const fs = require('fs');
const path = require('path');

const QUIZ_RESULTS_FILE = path.join(__dirname, '../../data/quiz_results.csv');

// Ensure quiz results file exists
const initQuizResults = () => {
    if (!fs.existsSync(QUIZ_RESULTS_FILE)) {
        fs.writeFileSync(QUIZ_RESULTS_FILE, 'id,subjectId,lectureId,userId,score,totalQuestions,correctAnswers,completedAt\n');
    }
};

// الحصول على إحصائيات المستخدم
const getUserStats = async (req, res) => {
    try {
        const userId = req.query.userId || 'anonymous';

        // Use the proper CSV parser
        const allLectures = getAllLectures();
        
        // Get all lectures (not filtered by userId since most are 'anonymous')
        const lectures = allLectures;

        // حساب الإحصائيات
        const totalLectures = lectures.length;
        const totalQuestions = lectures.reduce((sum, lec) => {
            const q = Array.isArray(lec.quizData) ? lec.quizData : [];
            return sum + q.length;
        }, 0);

        // حساب الـ Streak (أيام متتالية)
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);

        for (let i = 0; i < 365; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const hasActivityToday = lectures.some(lec => {
                try {
                    const lectureDate = new Date(lec.uploadedAt).toISOString().split('T')[0];
                    return lectureDate === dateStr;
                } catch { return false; }
            });

            if (hasActivityToday) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (i === 0) {
                // Today might not have activity yet, check yesterday
                currentDate.setDate(currentDate.getDate() - 1);
                continue;
            } else {
                break;
            }
        }

        // حساب Mastery Level
        const masteryLevel = totalLectures > 0 ? Math.min(100, (totalLectures * 15)) : 0;

        // إنشاء بيانات الأسبوع (آخر 7 أيام)
        const weekData = Array(7).fill(0);
        const today_date = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today_date);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const count = lectures.filter(lec => {
                try {
                    const lectureDate = new Date(lec.uploadedAt).toISOString().split('T')[0];
                    return lectureDate === dateStr;
                } catch { return false; }
            }).length;

            weekData[6 - i] = count;
        }

        res.json({
            success: true,
            data: {
                totalLectures,
                totalQuestions,
                streak,
                masteryLevel,
                weekData,
                recentLectures: lectures.slice(-5).reverse()
            }
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الإحصائيات',
            error: error.message
        });
    }
};

// الحصول على البيانات للدراسة
const getStudyData = async (req, res) => {
    try {
        const allLectures = getAllLectures();

        // تقسيم الموضوعات (محاضرات) إلى حالات
        const topics = allLectures.map((lec, index) => {
            const quizCount = Array.isArray(lec.quizData) ? lec.quizData.length : 0;
            const hasQuiz = quizCount > 0;
            const hasSummary = lec.summary && lec.summary.length > 10;
            
            let status = 'locked';
            let progress = 0;
            
            if (hasQuiz && hasSummary) {
                status = 'done';
                progress = 100;
            } else if (hasSummary) {
                status = 'in-progress';
                progress = 50;
            }

            return {
                id: lec.id,
                name: (lec.title || lec.fileName || '').replace('.pdf', '').substring(0, 30),
                status,
                progress,
                questionsCount: quizCount,
                uploadedAt: lec.uploadedAt
            };
        });

        res.json({
            success: true,
            data: {
                topics,
                totalTopics: topics.length,
                completedTopics: topics.filter(t => t.status === 'done').length
            }
        });
    } catch (error) {
        console.error('Study Data Error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب بيانات الدراسة',
            error: error.message
        });
    }
};

// الحصول على بيانات الاختبار
const getQuizData = async (req, res) => {
    try {
        const lectureId = req.query.lectureId;
        const allLectures = getAllLectures();

        const lecture = lectureId
            ? allLectures.find(l => String(l.id) === String(lectureId))
            : allLectures[0];

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على محاضرة'
            });
        }

        const quizArray = Array.isArray(lecture.quizData) ? lecture.quizData : [];

        const quizQuestions = quizArray.map((q, index) => ({
            id: index + 1,
            question: q.question || `السؤال ${index + 1}`,
            options: q.options || ['الخيار أ', 'الخيار ب', 'الخيار ج', 'الخيار د'],
            correctAnswer: q.answer || q.correctAnswer || 0,
            explanation: q.explanation || 'شرح الإجابة'
        }));

        res.json({
            success: true,
            data: {
                lectureId: lecture.id,
                lectureName: lecture.title || lecture.fileName,
                questions: quizQuestions,
                totalQuestions: quizQuestions.length
            }
        });
    } catch (error) {
        console.error('Quiz Data Error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب بيانات الاختبار',
            error: error.message
        });
    }
};

// Save quiz result
const saveQuizResult = async (req, res) => {
    try {
        const { subjectId, lectureId, userId, score, totalQuestions, correctAnswers } = req.body;

        if (!lectureId || score === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        initQuizResults();

        const id = Date.now().toString();
        const completedAt = new Date().toISOString();
        const line = `${id},${subjectId || ''},${lectureId},${userId || 'anonymous'},${score},${totalQuestions},${correctAnswers},${completedAt}\n`;

        fs.appendFileSync(QUIZ_RESULTS_FILE, line);

        console.log(`✅ Quiz result saved: ${correctAnswers}/${totalQuestions} (${score}%) for lecture ${lectureId}`);

        res.json({
            success: true,
            message: 'تم حفظ نتيجة الاختبار بنجاح',
            result: { id, subjectId, lectureId, score, totalQuestions, correctAnswers, completedAt }
        });
    } catch (error) {
        console.error('Error saving quiz result:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getUserStats,
    getStudyData,
    getQuizData,
    saveQuizResult
};
