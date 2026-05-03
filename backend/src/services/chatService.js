const axios = require('axios');

const generateAIResponse = async (userMessage, conversationHistory = [], contextData = '') => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ OpenRouter API Key not provided");
        return "عذراً، مفتاح API غير متوفر";
    }

    try {
        let systemContent = `أنت مساعد دراسي ذكي متخصص يعمل ضمن نظام "Smart Study Assistant".

## قواعدك الأساسية:
1. **استخدم فقط بيانات المحاضرات المرفقة أدناه** كمصدر رئيسي لإجاباتك. لا تختلق معلومات من خارج هذه البيانات.
2. إذا سألك الطالب سؤالاً موجوداً في بيانات المحاضرات، أجب بدقة من الملخصات والأسئلة المتاحة.
3. إذا سألك عن شيء غير موجود في المحاضرات، أخبره بذلك بوضوح واقترح عليه رفع محاضرة تغطي الموضوع.
4. يمكنك شرح المفاهيم الموجودة في الملخصات بتفصيل أكبر لمساعدة الطالب على الفهم.
5. إذا طلب الطالب أسئلة تدريبية، استخدم الأسئلة الموجودة في بيانات الاختبارات أو أنشئ أسئلة مشابهة من نفس المحتوى.
6. أجب دائماً بالعربية إلا إذا كان السؤال بالإنجليزية أو المحتوى تقني بالإنجليزية.
7. كن ودوداً ومشجعاً للطالب.

`;

        if (contextData && contextData.trim().length > 0) {
            systemContent += `## بيانات المحاضرات المتاحة:\n${contextData}\n`;
        } else {
            systemContent += `## ملاحظة: لا توجد محاضرات مرفوعة حالياً. اطلب من الطالب رفع محاضرات أولاً من صفحة "رفع محاضرة".\n`;
        }

        // Format conversation messages
        const messages = [
            {
                role: 'system',
                content: systemContent
            },
            ...conversationHistory.slice(-10), // Keep last 10 messages for context window
            {
                role: 'user',
                content: userMessage
            }
        ];

        console.log(`🔄 Sending chat message to AI... (system prompt: ${systemContent.length} chars)`);

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openai/gpt-oss-20b:free',
                messages: messages,
                temperature: 0.5,
                max_tokens: 1500,
                top_p: 0.9
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'http://localhost:5000',
                    'X-Title': 'Smart Study Assistant Chat'
                },
                timeout: 60000
            }
        );

        const aiMessage = response.data.choices[0].message.content;
        console.log("✅ AI Response received");
        return aiMessage;

    } catch (error) {
        console.error("❌ OpenRouter Chat Error:", error.response?.data?.error || error.message);

        // Fallback response
        return "أعتذر عن عدم القدرة على الرد الآن. يرجى المحاولة مرة أخرى بعد قليل.";
    }
};

module.exports = { generateAIResponse };
