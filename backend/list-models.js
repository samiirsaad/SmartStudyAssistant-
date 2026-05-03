require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log("🔍 Listing Available Gemini Models...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const models = await genAI.listModels();
        console.log("✅ Available Models:");
        models.models.forEach(model => {
            console.log(`  - ${model.name}`);
        });
        process.exit(0);
    } catch (error) {
        console.error("❌ Error listing models:", error.message);
        console.log("\n💡 Trying fallback models...");
        
        // Try common model names
        const commonModels = [
            "gemini-pro",
            "gemini-pro-vision",
            "text-bison-001",
            "chat-bison-001"
        ];
        
        for (const modelName of commonModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("test");
                console.log(`✓ Model ${modelName} works!`);
            } catch (e) {
                console.log(`✗ Model ${modelName} failed`);
            }
        }
        
        process.exit(1);
    }
}

listModels();
