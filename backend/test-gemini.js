const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const testGemini = async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const inventory = [
        { id: "test123", name: "Sugar", unit: "kg" },
        { id: "test456", name: "Maggi Noodles", unit: "piece" }
    ];

    const voiceText = "दो किलो चीनी";

    const prompt = `You are helping a Kirana (grocery) store owner in India parse voice sales in Hindi/Hinglish.

Voice input: "${voiceText}"

Available inventory (in English):
${JSON.stringify(inventory, null, 2)}

CRITICAL INSTRUCTIONS:
1. **TRANSLATE Hindi words to English first**: 
   - चीनी/cheeni → sugar
   - मैगी/maggi → maggi noodles
   
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

    console.log('📝 Testing voice: "' + voiceText + '"');
    console.log('\n' + '='.repeat(50) + '\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('🤖 Gemini Response:', text);
    console.log('\n' + '='.repeat(50) + '\n');

    try {
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonText);
        console.log('✅ Parsed JSON:', JSON.stringify(parsed, null, 2));
    } catch (e) {
        console.error('❌ JSON Parse Error:', e.message);
    }
};

testGemini().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
