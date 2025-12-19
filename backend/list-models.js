const fetch = require('node-fetch');

async function listModels() {
    try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDcYPTr1j2y9pseoZC8dKQNwnRl8Aw5zPI';

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
