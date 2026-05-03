import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// دالة رفع الملف
export const uploadPDF = (formData) => API.post('/study/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// دالة جلب إحصائيات المستخدم
export const getUserStats = (userId = 'anonymous') =>
    API.get(`/stats/user-stats?userId=${userId}`);

// دالة جلب بيانات الدراسة
export const getStudyData = (userId = 'anonymous') =>
    API.get(`/stats/study-data?userId=${userId}`);

// دالة جلب بيانات الاختبار
export const getQuizData = (userId = 'anonymous', lectureId = null) => {
    const params = new URLSearchParams({ userId });
    if (lectureId) params.append('lectureId', lectureId);
    return API.get(`/stats/quiz-data?${params}`);
};

// دالة الدردشة
export const sendMessage = (message, conversationHistory = [], subjectId = null, userId = 'anonymous') =>
    API.post('/chat/message', {
        message,
        conversationHistory,
        subjectId,
        userId
    });

// ===== SUBJECT API ENDPOINTS =====

// Create a new subject
export const createSubject = (userId, name, description, color) =>
    API.post('/subjects', {
        userId,
        name,
        description,
        color
    });

// Get all subjects for a user
export const getUserSubjects = (userId) =>
    API.get(`/subjects/user/${userId}`);

// Get subject details with lectures
export const getSubjectDetails = (subjectId) =>
    API.get(`/subjects/${subjectId}`);

// Update subject
export const updateSubject = (subjectId, updates) =>
    API.put(`/subjects/${subjectId}`, updates);

// Delete subject
export const deleteSubject = (subjectId) =>
    API.delete(`/subjects/${subjectId}`);

// ===== QUIZ RESULTS =====

// Save quiz result
export const saveQuizResult = (data) =>
    API.post('/stats/quiz-result', data);