#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const PDFDocument = require('pdfkit');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  🧪 API Integration Test - PDF Upload        ║');
console.log('╚════════════════════════════════════════════════╝\n');

const testPDFPath = path.join(__dirname, 'test-lecture.pdf');

// Create a valid PDF
console.log('📄 Creating test PDF...');
const doc = new PDFDocument();
const stream = fs.createWriteStream(testPDFPath);

doc.pipe(stream);
doc.fontSize(20).text('Machine Learning Fundamentals', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('Introduction:', { underline: true });
doc.fontSize(11).text('Machine learning is a subset of artificial intelligence focused on developing systems that can learn and improve from experience without being explicitly programmed.');
doc.moveDown();
doc.text('Key Topics:', { underline: true });
doc.list([
    'Supervised Learning Methods',
    'Unsupervised Learning Techniques', 
    'Neural Networks and Deep Learning',
    'Model Evaluation and Validation'
]);
doc.end();

stream.on('finish', async () => {
    console.log(`✅ PDF created: ${path.basename(testPDFPath)}\n`);
    
    try {
        // 1. Test backend
        console.log('🔗 Testing Backend Connection...');
        const backend = await axios.get('http://localhost:5000');
        console.log(`✅ Backend: ${backend.data}\n`);

        // 2. Upload
        console.log('📤 Uploading to API: POST /api/study/upload');
        const form = new FormData();
        form.append('pdf', fs.createReadStream(testPDFPath), 'lecture.pdf');

        const res = await axios.post(
            'http://localhost:5000/api/study/upload',
            form,
            { headers: form.getHeaders(), timeout: 60000 }
        );

        console.log(`✅ ${res.data.message}\n`);
        
        const d = res.data.data;
        console.log('═══════════════════════════════════════════════');
        console.log('📋 RESPONSE DATA:');
        console.log('═══════════════════════════════════════════════');
        console.log(`ID: ${d.id}`);
        console.log(`Filename: ${d.fileName}`);
        console.log(`Timestamp: ${d.uploadedAt}\n`);
        
        console.log('📝 SUMMARY:');
        console.log('───────────────────────────────────────────────');
        console.log(d.summary);
        
        if (d.quizData && d.quizData.length > 0) {
            console.log('\n📋 QUIZ QUESTIONS:');
            console.log('───────────────────────────────────────────────');
            d.quizData.forEach((q, i) => {
                console.log(`\n[Question ${i+1}] ${q.question}`);
                q.options.forEach(o => console.log(`  ○ ${o}`));
                console.log(`  ✓ Answer: ${q.answer}`);
            });
        }
        
        console.log('\n═══════════════════════════════════════════════');
        console.log('✅ API TEST PASSED - All systems working!\n');

    } catch (error) {
        console.error('\n❌ Error:');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Message: ${error.response.data?.message}`);
            if (error.response.data?.error) {
                console.error(`   Error: ${error.response.data.error}`);
            }
        } else {
            console.error(`   ${error.message}`);
        }
        process.exit(1);
    } finally {
        try { fs.unlinkSync(testPDFPath); } catch (e) {}
    }
});
