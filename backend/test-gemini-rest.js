const fetch = require('node-fetch');
require('dotenv').config();

async function testGemini() {
    console.log('🧪 Testing Gemini v1 REST API...\n');

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key loaded:', !!apiKey);
    console.log('API Key preview:', apiKey?.substring(0, 10) + '...\n');

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const body = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: 'Say hello in Hindi' }]
                }
            ]
        };

        console.log('📝 Sending test prompt: "Say hello in Hindi"\n');

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Error:', JSON.stringify(data, null, 2));
            throw new Error('API call failed');
        }

        const text = data.candidates[0].content.parts[0].text;

        console.log('✅ Gemini Response:', text);
        console.log('\n🎉 SUCCESS! Gemini v1 REST API is working correctly.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testGemini().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
