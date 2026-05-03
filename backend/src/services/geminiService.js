const axios = require('axios');

// Support OpenRouter
const aiProvider = process.env.AI_PROVIDER || 'openrouter';

// ==================== Retry Helper ====================
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithOpenRouterWithRetry = async (text, questionCount = 10, retryCount = 0) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        console.error("❌ OpenRouter API Key not provided in .env file");
        throw new Error("Missing OPENROUTER_API_KEY in environment");
    }

    try {
        console.log(`🔄 [Attempt ${retryCount + 1}] Sending to GPT-OSS-20B via OpenRouter...`);
        console.log("📝 Text length:", text.length, "characters");
        
        const requestBody = {
            model: 'openai/gpt-oss-20b:free',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert academic assistant specializing in comprehensive lecture analysis and high-quality educational content generation. Your task is to create concise yet thorough summaries and well-crafted quiz questions in English. 

REQUIREMENTS:
- Summary: 3-4 sentences, academically rigorous, captures key concepts and learning objectives
- Quiz Questions: You MUST generate EXACTLY ${questionCount} high-quality questions. This is a strict requirement. Do not generate more or less.
- Key Terms: 5-7 important terms/concepts from the lecture
- Answer ALL in English only
- Return ONLY valid JSON, no additional text`
                },
                {
                    role: 'user',
                    content: `Analyze this lecture content and provide a comprehensive study guide in English:

"${text.substring(0, 3000)}"

Return ONLY this JSON structure (no other text). You MUST include EXACTLY ${questionCount} items in the "quiz" array:
{
  "summary": "A concise 3-4 sentence academic summary capturing the main concepts and learning objectives. Focus on understanding and application, not just facts.",
  "keyTerms": ["Term1", "Term2", "Term3", "Term4", "Term5"],
  "quiz": [
    {
      "question": "Question 1 testing conceptual understanding",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "answer": "B) Option 2"
    },
    {
      "question": "Question 2 about application",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "answer": "A) Option 1"
    }
    // ... continue generating EXACTLY ${questionCount} questions in total ...
  ]
}`
                }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            top_p: 0.8
        };

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            requestBody,
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

        if (!response.data || !response.data.choices || !response.data.choices[0]) {
            throw new Error("Invalid response structure from OpenRouter API");
        }

        const content = response.data.choices[0].message.content;
        console.log("✅ OpenRouter Response received");
        
        // Clean JSON - remove markdown code blocks
        let cleanJson = content
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/^[\s\n]+|[\s\n]+$/g, '')
            .trim();
        
        // Fix common JSON formatting issues
        cleanJson = cleanJson
            .replace(/[\r\n]+/g, ' ')  // Remove line breaks inside content
            .replace(/,\s*}/g, '}')     // Remove trailing commas before }
            .replace(/,\s*\]/g, ']')    // Remove trailing commas before ]
            .replace(/\\"/g, '\\"')     // Ensure proper quote escaping
            .replace(/(\d+)"([^"]*)"(\d+)/g, '$1"$2"$3'); // Fix malformed quotes in numbers
        
        try {
            const parsed = JSON.parse(cleanJson);
            console.log("✅ JSON parsed successfully");
            console.log("📊 Summary:", parsed.summary ? parsed.summary.substring(0, 80) + "..." : "N/A");
            return parsed;
        } catch (jsonError) {
            console.error("❌ JSON Parse Error at position:", jsonError.message);
            console.error("Content sample:", cleanJson.substring(0, 200) + "...");
            throw new Error(`Failed to parse AI response: ${jsonError.message}`);
        }
        
    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        const errorCode = error.response?.status;
        
        console.error(`❌ OpenRouter Error (Attempt ${retryCount + 1}):`, errorMessage);
        console.error(`📊 Error Code:`, errorCode);
        if (error.response?.data?.error) {
            console.error(`📋 Full Error:`, JSON.stringify(error.response.data.error, null, 2));
        }
        
        // Retry on rate limit (429) or timeout errors
        if ((errorCode === 429 || error.code === 'ECONNABORTED') && retryCount < 2) {
            const waitTime = Math.pow(2, retryCount) * 3000; // 3s, 6s
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await delay(waitTime);
            return generateWithOpenRouterWithRetry(text, retryCount + 1);
        }
        
        throw error;
    }
};

// ==================== Main Function ====================
const generateStudyContent = async (text, questionCount = 10) => {
    console.log(`\n🚀 ===== Processing Lecture with AI =====`);
    console.log(`📡 Provider: OpenRouter + GPT-OSS-20B`);
    
    if (!text || text.trim().length === 0) {
        throw new Error("Cannot process empty text");
    }

    try {
        const result = await generateWithOpenRouterWithRetry(text, questionCount);
        
        if (!result) {
            throw new Error("AI returned empty result");
        }

        console.log("✅ Study content generated successfully!");
        console.log(`🎓 Generated ${result.quiz?.length || 0} questions`);
        console.log(`🔑 Found ${result.keyTerms?.length || 0} key terms`);
        console.log("=========================================\n");
        
        return result;
    } catch (error) {
        console.error("\n❌ ===== AI Processing Failed =====");
        console.error("Error:", error.response?.data?.error?.message || error.message);
        console.error("\nPossible solutions:");
        console.error("1. Check if OPENROUTER_API_KEY in .env is valid");
        console.error("2. Verify you have credits on OpenRouter");
        console.error("3. Try again in a few moments (rate limit?)");
        console.error("4. Visit: https://openrouter.ai to check status");
        console.error("====================================\n");
        
        throw new Error(`AI Service Error: ${error.response?.data?.error?.message || error.message}`);
    }
};

module.exports = { generateStudyContent };