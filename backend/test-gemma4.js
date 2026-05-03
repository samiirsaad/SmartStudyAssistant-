require('dotenv').config();
const axios = require('axios');

console.log("🧪 Testing Gemma-4 from OpenRouter...");
console.log("API Key:", process.env.OPENROUTER_API_KEY ? "✓ Present" : "✗ Missing");

async function testGemma() {
    try {
        console.log("🔄 Sending request to Gemma-4...");
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'google/gemma-4-26b-a4b-it:free',
                messages: [
                    {
                        role: 'user',
                        content: 'رد بـ JSON فقط: {"test": "success"}'
                    }
                ],
                temperature: 0.5,
                max_tokens: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:5000',
                    'X-Title': 'Test'
                },
                timeout: 15000
            }
        );

        const content = response.data.choices[0].message.content;
        console.log("✅ Gemma-4 Response:", content);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        if (error.response?.data?.error) {
            console.error("Full Error:", JSON.stringify(error.response.data.error, null, 2));
        }
        process.exit(1);
    }
}

testGemma();
