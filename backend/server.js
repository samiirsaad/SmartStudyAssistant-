const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./src/config/db');

// استدعاء المسارات (Routes)
const authRoutes = require('./src/routes/authRoutes');
const studyRoutes = require('./src/routes/studyRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const subjectsRoutes = require('./src/routes/subjectsRoutes');

// تحميل متغيرات البيئة من ملف .env (with explicit path)
dotenv.config({ path: path.join(__dirname, '.env') });
console.log(`📦 Loading .env from: ${path.join(__dirname, '.env')}`);
console.log(`🔑 OPENROUTER_API_KEY loaded: ${process.env.OPENROUTER_API_KEY ? '✅ Yes' : '❌ No'}`);

// الاتصال بقاعدة بيانات MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors()); // للسماح للـ Frontend بالاتصال بالـ Backend
app.use(express.json()); // لاستقبال البيانات بصيغة JSON
app.use(express.urlencoded({ extended: true })); // لمعالجة البيانات القادمة من الفورم

// توجيه المسارات
app.use('/api/auth', authRoutes);   // مسارات تسجيل الدخول والاشتراك
app.use('/api/study', studyRoutes); // مسارات رفع الملفات والتعامل مع Gemini
app.use('/api/chat', chatRoutes);   // مسارات الـ Chatbot
app.use('/api/stats', statsRoutes); // مسارات الإحصائيات والبيانات
app.use('/api/subjects', subjectsRoutes); // مسارات إدارة المواضيع

// مسار افتراضي للتأكد من عمل السيرفر
app.get('/', (req, res) => {
    res.send('🚀 Smart Study Assistant API is running...');
});

// معالجة الأخطاء العامة (اختياري لكن مفيد)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('حدث خطأ ما في السيرفر!');
});

// تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🔗 Local link: http://localhost:${PORT}`);
});