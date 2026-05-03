require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log("🔍 Testing Gemini API Connection...");
console.log("API Key:", process.env.GEMINI_API_KEY ? "✓ Present" : "✗ Missing");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello, test this connection");
        const response = await result.response;
        const text = response.text();
        
        console.log("✅ Gemini API Connection SUCCESSFUL!");
        console.log("Response sample:", text.substring(0, 50) + "...");
        process.exit(0);
    } catch (error) {
        console.error("❌ Gemini API Connection FAILED!");
        console.error("Error:", error.message);
        process.exit(1);
    }
}

testGemini();
