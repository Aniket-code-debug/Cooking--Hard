// AI Matching Service for Voice Sales
// Uses fuzzy matching and AI to match spoken items to inventory

/**
 * Parse voice text and match to inventory items
 * @param {string} voiceText - Transcribed voice text
 * @param {Array} inventory - Available inventory products
 * @returns {Object} Matched items with confidence scores
 */
async function matchItemsFromVoice(voiceText, inventory) {
    try {
        // TODO: Integrate with Gemini API or OpenAI
        // For now, using simple fuzzy matching

        const result = await fuzzyMatchProducts(voiceText, inventory);

        return {
            items: result.items,
            overallConfidence: calculateOverallConfidence(result.items),
            needsHumanReview: result.items.some(item => item.confidence < 0.85)
        };
    } catch (error) {
        console.error('AI matching error:', error);
        throw new Error('Failed to match items from voice input');
    }
}

/**
 * Fuzzy match products from spoken text
 * Handles Hindi/Hinglish common names
 */
function fuzzyMatchProducts(voiceText, inventory) {
    const items = [];
    const text = voiceText.toLowerCase();

    // Common Hindi/English mappings for Kirana products
    const translations = {
        // Devanagari script
        'मैगी': 'maggi',
        'नूडल्स': 'noodles',
        'चीनी': 'sugar',
        'आटा': 'flour',
        'चावल': 'rice',
        'दाल': 'dal',
        'नमक': 'salt',
        'तेल': 'oil',
        // Romanized Hindi (Hinglish)
        'cheeni': 'sugar',
        'chawal': 'rice',
        'atta': 'flour',
        'aata': 'flour',
        'tel': 'oil',
        'namak': 'salt',
        'daal': 'dal',
        'dal': 'lentil',
        'maggie': 'maggi',
        'noodles': 'noodles',
        'biscuit': 'biscuit',
        'chai': 'tea',
        'coffee': 'coffee',
        'milk': 'milk',
        'doodh': 'milk',
        'bread': 'bread',
        'pav': 'bread'
    };

    // Extract quantity patterns
    const quantityPatterns = [
        /(\d+)\s*(kilo|kg|किलो)/gi,
        /(\d+)\s*(packet|पैकेट)/gi,
        /(\d+)\s*(piece|पीस)/gi,
        /ek|एक/gi // one in Hindi
    ];

    // Simple parsing logic (placeholder for AI)
    inventory.forEach(product => {
        const productNameLower = product.name.toLowerCase();

        // Check if product name appears in voice text
        if (text.includes(productNameLower)) {
            items.push({
                matchedItemName: product.name,
                spokenName: productNameLower,
                quantity: extractQuantity(text, productNameLower),
                unit: product.unit || 'piece',
                confidence: 0.9,
                productId: product._id
            });
        } else {
            // Check Hindi translations
            for (const [hindi, english] of Object.entries(translations)) {
                if (text.includes(hindi) && productNameLower.includes(english)) {
                    items.push({
                        matchedItemName: product.name,
                        spokenName: hindi,
                        quantity: extractQuantity(text, hindi),
                        unit: product.unit || 'piece',
                        confidence: 0.85,
                        productId: product._id
                    });
                    break;
                }
            }
        }
    });

    return { items };
}

/**
 * Extract quantity from text near product mention
 */
function extractQuantity(text, productName) {
    // Look for numbers in the entire text (more flexible)
    const allNumbers = text.match(/\d+/g);

    if (allNumbers && allNumbers.length > 0) {
        // Try to find number closest to product name
        const productIndex = text.indexOf(productName);
        const beforeProduct = text.substring(0, productIndex);
        const numbersBeforeProduct = beforeProduct.match(/\d+/g);

        if (numbersBeforeProduct && numbersBeforeProduct.length > 0) {
            // Return the last number before the product (most likely the quantity)
            return parseInt(numbersBeforeProduct[numbersBeforeProduct.length - 1]);
        }

        // If no number before, take first number from anywhere
        return parseInt(allNumbers[0]);
    }

    // Check for Hindi number words
    const hindiNumbers = {
        'ek': 1, 'एक': 1,
        'do': 2, 'दो': 2,
        'teen': 3, 'तीन': 3,
        'char': 4, 'चार': 4,
        'panch': 5, 'पांच': 5,
        'paanch': 5
    };

    for (const [word, num] of Object.entries(hindiNumbers)) {
        if (text.includes(word)) {
            return num;
        }
    }

    // Default to 1
    return 1;
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(items) {
    if (items.length === 0) return 0;

    const sum = items.reduce((acc, item) => acc + item.confidence, 0);
    return sum / items.length;
}

module.exports = {
    matchItemsFromVoice,
    fuzzyMatchProducts,
    calculateOverallConfidence
};
