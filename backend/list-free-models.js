require('dotenv').config();
const axios = require('axios');

const testModels = async () => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    console.log('🔍 Fetching available models from OpenRouter...');

    try {
        const response = await axios.get(
            'https://openrouter.ai/api/v1/models',
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        // Filter for free and popular models
        const freeModels = response.data.data
            .filter(m => m.pricing.prompt === '0' || m.id.includes('free'))
            .slice(0, 20);

        console.log('\n✅ Available FREE models:');
        freeModels.forEach(m => {
            console.log(`  - ${m.id}`);
        });
    } catch (error) {
        console.error('❌ Error fetching models:', error.message);
    }
};

testModels();
