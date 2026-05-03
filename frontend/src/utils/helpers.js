// دالة لتنسيق التاريخ بشكل مقروء
export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
};

// دالة للتأكد من حجم الملف قبل الرفع (مثلاً لا يتخطى 10 ميجا)
export const validateFileSize = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
};