const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const testUpload = async () => {
    const filePath = path.join(__dirname, 'uploads', '1775876226034.pdf');

    console.log('📤 Testing PDF upload...');
    console.log(`📁 File: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error('❌ File not found!');
        return;
    }

    try {
        const fileStream = fs.createReadStream(filePath);
        const form = new FormData();
        form.append('pdf', fileStream, path.basename(filePath));

        console.log('🔄 Uploading to http://localhost:5000/api/study/upload...');

        const response = await axios.post(
            'http://localhost:5000/api/study/upload',
            form,
            {
                headers: form.getHeaders(),
                timeout: 120000
            }
        );

        console.log('✅ Upload successful!');
        console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Upload failed!');
        console.error('Error:', error.response?.data || error.message);
        if (error.response?.data?.error) {
            console.error('Details:', JSON.stringify(error.response.data.error, null, 2));
        }
    }
};

testUpload();
