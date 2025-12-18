import { translateToEnglish } from './translate';

// Keywords to identify animal-related definitions
const ANIMAL_KEYWORDS = [
    'mammal', 'bird', 'fish', 'insect', 'reptile', 'amphibian',
    'creature', 'species', 'fauna', 'beast', 'livestock', 'poultry', 'arthropod',
    'vertebrate', 'invertebrate', 'chilopoda', 'arachnid',
    'crustacean', 'annelid', 'mollusk', 'echinoderm', 'cnidarian', 'gastropoda', 'domestic', 'wildlife'
];

/**
 * Validates if a given word in Indonesian is likely a valid animal name.
 * It translates the word to English and checks its definition against a list of keywords.
 * @param {string} indonesianWord The word in Indonesian to validate.
 * @returns {Promise<{isValid: boolean, englishName: string | null, errorType?: 'network' | 'word_not_found' | 'unknown'}>} A promise that resolves to an object indicating validity and the English name, and an error type if applicable.
 */
export const isLikelyAnimal = async (indonesianWord) => {
    if (!indonesianWord) return { isValid: false, englishName: null };

    let englishWord = null;
    try {
        englishWord = await translateToEnglish(indonesianWord);
    } catch (translateError) {
        console.error('Translation failed:', translateError);
        // Check if it's a network error from translation
        if (translateError instanceof TypeError && translateError.message === 'Network request failed') {
            return { isValid: false, englishName: null, errorType: 'network' };
        }
        if (translateError.message.includes('API request failed') || translateError.message.includes('API returned error')) {
            return { isValid: false, englishName: null, errorType: 'network' };
        }
        return { isValid: false, englishName: null, errorType: 'unknown' };
    }

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${englishWord.toLowerCase()}`);

        if (!response.ok) {
            // If dictionary API returns 404 (word not found), it's not a network error.
            // Other non-2xx statuses might indicate network issues or API problems.
            if (response.status === 404) {
                return { isValid: false, englishName: englishWord, errorType: 'word_not_found' };
            } else {
                // Treat other non-OK responses as potential network/API issues
                console.error(`Dictionary API request failed with status: ${response.status}`);
                return { isValid: false, englishName: englishWord, errorType: 'network' };
            }
        }

        const data = await response.json();
        const definitions = JSON.stringify(data[0].meanings).toLowerCase();

        console.log(`Definitions for "${indonesianWord}" (${englishWord}):`, definitions);
        const isValid = ANIMAL_KEYWORDS.some(keyword => definitions.includes(keyword));
        return { isValid, englishName: englishWord };
    } catch (error) {
        console.error('Validation (dictionary API) error:', error);
        // Catch network errors during dictionary API fetch
        if (error instanceof TypeError && error.message === 'Network request failed') {
            return { isValid: false, englishName: englishWord, errorType: 'network' };
        }
        return { isValid: false, englishName: englishWord, errorType: 'unknown' };
    }
};