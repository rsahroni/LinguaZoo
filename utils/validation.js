import { translateToEnglish } from './translate';

// Kata kunci untuk mengidentifikasi definisi yang berhubungan dengan hewan
const ANIMAL_KEYWORDS = [
    'animal', 'mammal', 'bird', 'fish', 'insect', 'reptile', 'amphibian',
    'creature', 'species', 'fauna', 'beast', 'livestock', 'poultry'
];

/**
 * Validates if a given word in Indonesian is likely a valid animal name.
 * It translates the word to English and checks its definition against a list of keywords.
 * @param {string} indonesianWord The word in Indonesian to validate.
 * @returns {Promise<boolean>} A promise that resolves to true if the word is likely an animal, false otherwise.
 */
export const isLikelyAnimal = async (indonesianWord) => {
    if (!indonesianWord) return false;

    try {
        const englishWord = await translateToEnglish(indonesianWord);
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${englishWord.toLowerCase()}`);

        if (!response.ok) return false; // Kata tidak ditemukan di kamus

        const data = await response.json();
        const definitions = JSON.stringify(data[0].meanings).toLowerCase();

        return ANIMAL_KEYWORDS.some(keyword => definitions.includes(keyword));
    } catch (error) {
        console.error('Validation error:', error);
        return false; // Anggap tidak valid jika terjadi error
    }
};