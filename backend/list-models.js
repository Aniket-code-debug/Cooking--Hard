const fetch = require('node-fetch');
require('dotenv').config();

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        console.log('✅ Available Gemini models for your API key:\n');

        if (data.models) {
            data.models.forEach(model => {
                console.log(`📦 ${model.name}`);
                console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ') || 'none'}`);
                console.log('');
            });
        } else {
            console.log('Response:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listModels();
