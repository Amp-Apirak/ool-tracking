// i18n.js
import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import th from '@/locales/th.json';

const messages = {
    en,
    th,
};

const i18n = createI18n({
    locale: 'en', // Default language
    fallbackLocale: 'en', // Fallback language if a translation is missing
    messages,
});

export default i18n;
