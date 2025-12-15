import translate from 'translate';
translate.engine = 'google';

export const translateToEnglish = async (text) => {
    try {
        const result = await translate(text, { from: 'id', to: 'en' });
        return result;
    } catch (e) {
        return text; // fallback kalau gagal
    }
};
