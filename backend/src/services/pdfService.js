const pdf = require('pdf-parse');
const fs = require('fs');

const extractText = async (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`PDF file not found: ${filePath}`);
        }

        const fileStats = fs.statSync(filePath);
        console.log(`📄 Processing PDF: ${filePath} (${fileStats.size} bytes)`);

        const dataBuffer = fs.readFileSync(filePath);

        if (dataBuffer.length === 0) {
            throw new Error('PDF file is empty');
        }

        const data = await pdf(dataBuffer);

        if (!data.text || data.text.trim().length === 0) {
            console.warn(`⚠️ PDF contains no extractable text (pages: ${data.numpages})`);
            throw new Error('هذا الملف PDF يحتوي على محتوى غير قابل للاستخراج (قد يكون صورة ممسوحة ضوئياً). يرجى استخدام PDF نصي بدلاً من ذلك.');
        }

        console.log(`✅ PDF extracted successfully (${data.text.length} characters from ${data.numpages} pages)`);
        return data.text;
    } catch (error) {
        console.error(`❌ PDF Extraction Error:`, error.message);
        // If the error message already has Arabic, use it as is
        const errorMsg = error.message.includes('الملف')
            ? error.message
            : `فشل استخراج محتوى الملف: ${error.message}`;
        throw new Error(errorMsg);
    }
};

module.exports = { extractText };