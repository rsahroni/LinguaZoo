import translate from 'translate';
translate.engine = 'google';

export const translateToEnglish = async (text) => {
    try {
        const result = await translate(text, { from: 'id', to: 'en' });
        console.log(`Translated "${text}" to English: "${result}"`);
        return result;
    } catch (e) {
        console.error('Translation error:', e);
        return text; // fallback kalau gagal
    }
};
