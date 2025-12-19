const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
    console.log('🧪 Testing Gemini API...\n');

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key loaded:', !!apiKey);
    console.log('API Key preview:', apiKey?.substring(0, 10) + '...\n');

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        console.log('📝 Sending test prompt: "Say hello in Hindi"\n');

        const result = await model.generateContent('Say hello in Hindi');
        const response = result.response;
        const text = response.text();

        console.log('✅ Gemini Response:', text);
        console.log('\n🎉 SUCCESS! Gemini is working correctly.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nFull error:', error);
    }
}

testGemini().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
