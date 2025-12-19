/**
 * Gemini AI Service using direct REST API (v1beta)
 * Using v1beta because it supports gemini-2.5-flash model
 */

const fetch = require('node-fetch');

/**
 * Call Gemini API directly using REST (v1beta endpoint)
 */
async function callGeminiAPI(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const body = {
        contents: [
            {
                role: 'user',
                parts: [{ text: prompt }]
            }
        ]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('❌ Gemini API Error:', JSON.stringify(data, null, 2));
        throw new Error(`Gemini request failed: ${data.error?.message || 'Unknown error'}`);
    }

    return data.candidates[0].content.parts[0].text;
}

/**
 * Parse voice sale using Gemini AI
 * @param {string} voiceText - Transcribed voice text
 * @param {Array} inventory - Available inventory products
 * @returns {Object} Matched items with confidence scores
 */
async function parseVoiceSaleWithAI(voiceText, inventory) {
    console.log('🔍 parseVoiceSaleWithAI called');
    console.log('📝 Voice text:', voiceText);
    console.log('📦 Inventory count:', inventory.length);
    console.log('🔑 API key exists:', !!process.env.GEMINI_API_KEY);
    console.log('🔑 API key first 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10));

    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY not configured, falling back to basic matching');
            return fallbackMatching(voiceText, inventory);
        }

        // Prepare inventory list for AI
        const inventoryList = inventory.map(p => ({
            id: p._id.toString(),
            name: p.name,
            unit: p.unit || 'piece'
        }));

        // Create prompt for Gemini
        const prompt = `You are helping a Kirana (grocery) store owner in India parse voice sales in Hindi/Hinglish.

Voice input: "${voiceText}"

Available inventory (in English):
${JSON.stringify(inventoryList, null, 2)}

CRITICAL INSTRUCTIONS:
1. **TRANSLATE Hindi words to English first**: 
   - चीनी/cheeni → sugar
   - मैगी/maggi → maggi noodles
   - आटा/atta → flour
   - नमक/namak → salt
   - तेल/tel → oil
   
2. **Match translated words** with inventory product names (fuzzy matching OK)

3. **Extract quantities**: Support both numbers (1, 2, 3) and Hindi words (ek=1, do=2, teen=3)

4. **Return ONLY products that exist in inventory** - use exact product IDs from inventory list

Example:
Voice: "दो किलो चीनी"
Step 1: Translate "चीनी" → "sugar"
Step 2: Match "sugar" with inventory
Step 3: Extract quantity "दो" = 2, unit "किलो" = kg

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "items": [
    {
      "productId": "exact _id from inventory list above",
      "productName": "exact name from inventory",
      "spokenName": "what was said in voice",
      "quantity": number,
      "unit": "kg or piece or liter",
      "confidence": 0.0-1.0,
      "reasoning": "translated X to Y, matched with inventory"
    }
  ]
}`;

        console.log('🤖 Calling Gemini API with v1 REST...');
        const text = await callGeminiAPI(prompt);

        console.log('🤖 Gemini raw response:', text);

        // Parse JSON response (clean up markdown if present)
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonText);

        // Calculate overall confidence
        const overallConfidence = parsed.items.length > 0
            ? parsed.items.reduce((sum, item) => sum + item.confidence, 0) / parsed.items.length
            : 0;

        console.log(`✅ Gemini parsed ${parsed.items.length} items, confidence: ${overallConfidence.toFixed(2)}`);

        return {
            items: parsed.items.map(item => ({
                matchedItemName: item.productName,
                spokenName: item.spokenName,
                quantity: item.quantity,
                unit: item.unit,
                confidence: item.confidence,
                productId: item.productId
            })),
            overallConfidence,
            needsHumanReview: overallConfidence < 0.85
        };

    } catch (error) {
        console.error('❌ Gemini AI error:', error.message);
        console.log('⚙️ Falling back to basic matching');
        return fallbackMatching(voiceText, inventory);
    }
}

/**
 * Fallback to basic matching if AI fails
 */
function fallbackMatching(voiceText, inventory) {
    console.log('⚙️ Using fallback matching');
    const text = voiceText.toLowerCase();
    const items = [];

    // Simple keyword matching
    inventory.forEach(product => {
        const productNameLower = product.name.toLowerCase();
        if (text.includes(productNameLower)) {
            items.push({
                matchedItemName: product.name,
                spokenName: productNameLower,
                quantity: 1,
                unit: product.unit || 'piece',
                confidence: 0.7,
                productId: product._id
            });
        }
    });

    return {
        items,
        overallConfidence: items.length > 0 ? 0.7 : 0,
        needsHumanReview: true
    };
}

module.exports = {
    parseVoiceSaleWithAI,
    fallbackMatching
};


/**
 * Parse voice sale using Gemini AI
 * @param {string} voiceText - Transcribed voice text
 * @param {Array} inventory - Available inventory products
 * @returns {Object} Matched items with confidence scores
 */
async function parseVoiceSaleWithAI(voiceText, inventory) {
    console.log('🔍 parseVoiceSaleWithAI called');
    console.log('📝 Voice text:', voiceText);
    console.log('📦 Inventory count:', inventory.length);
    console.log('🔑 API key exists:', !!process.env.GEMINI_API_KEY);
    console.log('🔑 API key first 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10));

    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY not configured, falling back to basic matching');
            return fallbackMatching(voiceText, inventory);
        }

        // Initialize Gemini here (after env is loaded)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Prepare inventory list for AI
        const inventoryList = inventory.map(p => ({
            id: p._id.toString(),
            name: p.name,
            unit: p.unit || 'piece'
        }));

        // Create prompt for Gemini
        const prompt = `You are helping a Kirana (grocery) store owner in India parse voice sales in Hindi/Hinglish.

Voice input: "${voiceText}"

Available inventory (in English):
${JSON.stringify(inventoryList, null, 2)}

CRITICAL INSTRUCTIONS:
1. **TRANSLATE Hindi words to English first**: 
   - चीनी/cheeni → sugar
   - मैगी/maggi → maggi noodles
   - आटा/atta → flour
   - नमक/namak → salt
   - तेल/tel → oil
   
2. **Match translated words** with inventory product names (fuzzy matching OK)

3. **Extract quantities**: Support both numbers (1, 2, 3) and Hindi words (ek=1, do=2, teen=3)

4. **Return ONLY products that exist in inventory** - use exact product IDs from inventory list

Example:
Voice: "दो किलो चीनी"
Step 1: Translate "चीनी" → "sugar"
Step 2: Match "sugar" with inventory
Step 3: Extract quantity "दो" = 2, unit "किलो" = kg

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "items": [
    {
      "productId": "exact _id from inventory list above",
      "productName": "exact name from inventory",
      "spokenName": "what was said in voice",
      "quantity": number,
      "unit": "kg or piece or liter",
      "confidence": 0.0-1.0,
      "reasoning": "translated X to Y, matched with inventory"
    }
  ]
}`;

        const model = genAI.getGenerativeModel({ model: 'models/gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        console.log('🤖 Gemini raw response:', text);

        // Parse JSON response (clean up markdown if present)
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonText);

        // Calculate overall confidence
        const overallConfidence = parsed.items.length > 0
            ? parsed.items.reduce((sum, item) => sum + item.confidence, 0) / parsed.items.length
            : 0;

        console.log(`✅ Gemini parsed ${parsed.items.length} items, confidence: ${overallConfidence.toFixed(2)}`);

        return {
            items: parsed.items.map(item => ({
                matchedItemName: item.productName,
                spokenName: item.spokenName,
                quantity: item.quantity,
                unit: item.unit,
                confidence: item.confidence,
                productId: item.productId
            })),
            overallConfidence,
            needsHumanReview: overallConfidence < 0.85
        };

    } catch (error) {
        console.error('❌ Gemini AI error:', error.message);
        console.log('⚙️ Falling back to basic matching');
        return fallbackMatching(voiceText, inventory);
    }
}

/**
 * Fallback to basic matching if AI fails
 */
function fallbackMatching(voiceText, inventory) {
    console.log('⚙️ Using fallback matching');
    const text = voiceText.toLowerCase();
    const items = [];

    // Simple keyword matching
    inventory.forEach(product => {
        const productNameLower = product.name.toLowerCase();
        if (text.includes(productNameLower)) {
            items.push({
                matchedItemName: product.name,
                spokenName: productNameLower,
                quantity: 1,
                unit: product.unit || 'piece',
                confidence: 0.7,
                productId: product._id
            });
        }
    });

    return {
        items,
        overallConfidence: items.length > 0 ? 0.7 : 0,
        needsHumanReview: true
    };
}

module.exports = {
    parseVoiceSaleWithAI,
    fallbackMatching
};
