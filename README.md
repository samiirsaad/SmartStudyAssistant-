<<<<<<< HEAD
# SmartStudyAssistant-
=======
# Smart Study Assistant 📚

مساعد دراسة ذكي يحوّل محاضراتك إلى ملخصات واختبارات

## المتطلبات
- Node.js v16+
- npm
- MongoDB Atlas Account
- Google Gemini API Key

## التثبيت

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## تشغيل المشروع

### تشغيل Backend (Terminal 1)
```bash
cd backend
npm run dev
```

### تشغيل Frontend (Terminal 2)
```bash
cd frontend
npm start
```

## المتغيرات البيئية

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## البنية

```
SmartStudyAssistant/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middlewares/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── assets/
│   │   └── utils/
│   └── public/
└── requirements.txt
```

## الميزات

✅ تحميل ملفات PDF
✅ استخراج النصوص من الملفات
✅ توليد ملخصات ذكية باستخدام Gemini AI
✅ إنشاء اختبارات تفاعلية
✅ واجهة مستخدم عربية

---
**تم الإنشاء بـ ❤️**
>>>>>>> bc83603 (Initial commit for Smart Study Assistant)
