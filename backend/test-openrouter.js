require('dotenv').config();
const axios = require('axios');

const testOpenRouter = async () => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    console.log('🧪 Testing OpenRouter API...');
    console.log('📝 API Key provided:', !!apiKey);

    if (!apiKey) {
        console.error('❌ API Key missing!');
        return;
    }

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openai/gpt-oss-20b:free',
                messages: [
                    {
                        role: 'system',
                        content: 'أنت مساعد ذكي. رد بـ JSON فقط.'
                    },
                    {
                        role: 'user',
                        content: 'قل لي الأرقام من 1 إلى 3 بصيغة JSON: {"numbers": [1, 2, 3]}'
                    }
                ],
                temperature: 0.5,
                max_tokens: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'http://localhost:5000',
                    'X-Title': 'Smart Study Assistant',
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        console.log('✅ API Response received!');
        console.log('Model:', response.data.model);
        console.log('Message:', response.data.choices[0].message.content);
    } catch (error) {
        console.error('❌ API Error:', error.response?.data?.error?.message || error.message);
        if (error.response?.data?.error) {
            console.error('Full error:', JSON.stringify(error.response.data.error, null, 2));
        }
    }
};

testOpenRouter();
