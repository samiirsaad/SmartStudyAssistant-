const { extractText } = require('../services/pdfService');
const { generateStudyContent } = require('../services/geminiService');
const { addLecture, getAllLectures, deleteLecture } = require('../services/csvService');

const processLecture = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'الرجاء رفع ملف PDF' });

        const { lectureTitle, weekNumber, subjectId, questionCount } = req.body;
        const qCount = parseInt(questionCount) || 10;

        // 1. استخراج النص من الملف
        const text = await extractText(req.file.path);
        
        // 2. إرسال النص لـ Gemini والحصول على تحليل منظّم
        const aiData = await generateStudyContent(text, qCount);

        // 3. حفظ البيانات في ملف CSV
        const newLecture = addLecture({
            userId: req.query.userId || req.headers['x-user-id'] || 'anonymous',
            subjectId: subjectId || '',
            fileName: req.file.originalname,
            filePath: req.file.path,
            title: lectureTitle || req.file.originalname,
            weekNumber: weekNumber || '1',
            summary: aiData.summary,
            quizData: aiData.quiz
        });

        res.json({
            message: "تمت المعالجة والحفظ بنجاح ✅",
            data: {
                id: newLecture.id,
                fileName: newLecture.fileName,
                summary: newLecture.summary,
                quizData: typeof newLecture.quizData === 'string' ? JSON.parse(newLecture.quizData) : newLecture.quizData,
                uploadedAt: newLecture.uploadedAt
            }
        });
    } catch (error) {
        console.error("❌ Error details:", error.message);
        
        // Determine error type and provide appropriate message
        let errorMessage = 'حدث خطأ أثناء المعالجة';
        let statusCode = 500;
        
        // If error message already contains Arabic, use it directly
        if (error.message.includes('الملف') || error.message.includes('يحتوي')) {
            errorMessage = error.message;
            statusCode = 400;
        } else if (error.message.includes('PDF')) {
            errorMessage = error.message;
            statusCode = 400;
        } else if (error.message.includes('rate')) {
            errorMessage = 'الخادم مشغول حالياً. حاول مرة أخرى بعد قليل.';
            statusCode = 429;
        }
        
        res.status(statusCode).json({ 
            message: errorMessage,
            error: error.message,
            details: error.response?.data?.error?.raw || error.response?.data?.error?.message || null
        });
    }
};

const getLectures = async (req, res) => {
    try {
        console.log('📚 Getting all lectures...');
        const lectures = getAllLectures();
        console.log('✅ Found', lectures.length, 'lectures');
        res.json({
            success: true,
            data: lectures
        });
    } catch (error) {
        console.error('❌ Error getting lectures:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const deleteLectureById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = deleteLecture(id);
        
        if (deleted) {
            res.json({ success: true, message: 'تم حذف المحاضرة بنجاح' });
        } else {
            res.status(404).json({ success: false, message: 'المحاضرة غير موجودة' });
        }
    } catch (error) {
        console.error('❌ Error deleting lecture:', error.message);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء الحذف', error: error.message });
    }
};

module.exports = { processLecture, getLectures, deleteLectureById };