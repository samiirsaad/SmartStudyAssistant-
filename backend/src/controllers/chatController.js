const { generateAIResponse } = require('../services/chatService');
const { getSubjectById, getLecturesBySubjectId, getAllLectures } = require('../services/csvService');

const chat = async (req, res) => {
    try {
        const { message, conversationHistory = [], subjectId, userId = 'anonymous' } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'رسالة مطلوبة' });
        }

        let contextData = '';

        if (subjectId) {
            // Load specific subject lectures with FULL content
            const subject = getSubjectById(subjectId);
            const lectures = getLecturesBySubjectId(subjectId);
            if (subject) {
                contextData += `المادة: ${subject.name}\nوصف المادة: ${subject.description || 'بدون وصف'}\n\n`;
                if (lectures && lectures.length > 0) {
                    contextData += `=== محاضرات هذه المادة (${lectures.length} محاضرة) ===\n\n`;
                    lectures.forEach((l, index) => {
                        // Parse quiz data
                        let quizArray = [];
                        try {
                            quizArray = typeof l.quizData === 'string' ? JSON.parse(l.quizData || '[]') : (l.quizData || []);
                        } catch (e) { quizArray = []; }

                        contextData += `--- محاضرة ${index + 1}: ${l.title || l.fileName || 'بدون عنوان'} ---\n`;
                        contextData += `الملخص الكامل:\n${l.summary || 'لا يوجد ملخص'}\n\n`;
                        
                        if (Array.isArray(quizArray) && quizArray.length > 0) {
                            contextData += `أسئلة الاختبار (${quizArray.length} سؤال):\n`;
                            quizArray.forEach((q, qi) => {
                                contextData += `  س${qi + 1}: ${q.question || ''}\n`;
                                if (q.options) {
                                    q.options.forEach(opt => {
                                        contextData += `    - ${opt}\n`;
                                    });
                                }
                                contextData += `    الإجابة الصحيحة: ${q.answer || q.correctAnswer || ''}\n\n`;
                            });
                        }
                        contextData += '\n';
                    });
                } else {
                    contextData += `لا يوجد محاضرات مضافة لهذه المادة حتى الآن.\n\n`;
                }
            }
        } else {
            // Load ALL lectures with FULL content (not truncated)
            const allLectures = getAllLectures();
            if (allLectures && allLectures.length > 0) {
                contextData += `=== جميع محاضرات الطالب (${allLectures.length} محاضرة) ===\n\n`;
                allLectures.forEach((l, index) => {
                    let quizArray = [];
                    try {
                        quizArray = Array.isArray(l.quizData) ? l.quizData : [];
                    } catch (e) { quizArray = []; }

                    contextData += `--- محاضرة ${index + 1}: ${l.title || l.fileName || 'بدون عنوان'} ---\n`;
                    contextData += `الملخص الكامل:\n${l.summary || 'لا يوجد ملخص'}\n\n`;
                    
                    if (Array.isArray(quizArray) && quizArray.length > 0) {
                        contextData += `أسئلة الاختبار (${quizArray.length} سؤال):\n`;
                        quizArray.forEach((q, qi) => {
                            contextData += `  س${qi + 1}: ${q.question || ''}\n`;
                            if (q.options) {
                                q.options.forEach(opt => {
                                    contextData += `    - ${opt}\n`;
                                });
                            }
                            contextData += `    الإجابة الصحيحة: ${q.answer || q.correctAnswer || ''}\n\n`;
                        });
                    }
                    contextData += '\n';
                });
            } else {
                contextData += 'لا توجد أي محاضرات مرفوعة حتى الآن.\n';
            }
        }

        console.log(`📚 Chat context loaded: ${contextData.length} characters of lecture data`);

        // Generate AI response with full context
        const aiResponse = await generateAIResponse(message, conversationHistory, contextData);

        res.json({
            success: true,
            userMessage: message,
            message: aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في معالجة الرسالة',
            message: error.message
        });
    }
};

module.exports = { chat };
