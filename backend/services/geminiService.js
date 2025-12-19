const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
        const prompt = `You are helping a Kirana (grocery) store owner in India parse voice sales.

Voice input (may be in Hindi, English, or Hinglish): "${voiceText}"

Available inventory products:
${JSON.stringify(inventoryList, null, 2)}

Task: Extract which products were mentioned and their quantities.

Rules:
1. Match spoken items to inventory products (fuzzy matching OK)
2. Extract quantity (support Hindi numbers: ek=1, do=2, teen=3, etc.)
3. Handle Hindi/Hinglish: मैगी/maggi → Maggi, चीनी/cheeni → Sugar
4. Return confidence score (0.0-1.0) for each match

Respond ONLY with valid JSON (no markdown):
{
  "items": [
    {
      "productId": "actual product _id from inventory",
      "productName": "exact name from inventory",
      "spokenName": "what user said",
      "quantity": number,
      "unit": "kg/piece/etc",
      "confidence": 0.95,
      "reasoning": "brief explanation"
    }
  ]
}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
