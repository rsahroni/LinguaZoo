import translate from 'translate';
translate.engine = 'google';

/**
 * Defines the available translation engines.
 */
export const TranslationEngine = {
    MYMEMORY: 'mymemory', // More reliable, recommended default
    GOOGLE_LEGACY: 'google_legacy', // Old implementation
};

/**
 * Translates text from Indonesian to English using the MyMemory API.
 * @param {string} text The text to translate.
 * @returns {Promise<string>} The translated text.
 * @throws {Error} If the API request fails.
 */
const translateWithMyMemory = async (text) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`MyMemory API request failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (data.responseStatus !== 200) {
        throw new Error(`MyMemory API returned error: ${data.responseDetails}`);
    }
    return data.responseData.translatedText;
};

/**
 * Translates text using the legacy 'translate' library.
 * @param {string} text The text to translate.
 * @returns {Promise<string>} The translated text.
 * @throws {Error} If the translation fails.
 */
const translateWithGoogleLegacy = async (text) => {
    return translate(text, { from: 'id', to: 'en' });
};

/**
 * Translates text from Indonesian to English using a specified engine.
 * @param {string} text The Indonesian text to translate.
 * @param {string} engine The translation engine to use, defaults to MYMEMORY.
 * @returns {Promise<string>} The translated English text.
 */
export const translateToEnglish = async (text, engine = TranslationEngine.MYMEMORY) => { // Added engine parameter
    try {
        const result = engine === TranslationEngine.GOOGLE_LEGACY
            ? await translateWithGoogleLegacy(text)
            : await translateWithMyMemory(text);
        console.log(`Translated "${text}" to "${result}" using ${engine} engine.`);
        return result;
    } catch (e) {
        console.error('Translation error:', e);
        throw e; // Re-throw the error for the caller to handle
    }
};
