// src/utils/dateFormatterLocale.js

import i18n from '@/i18n';

export const formatDate = (dateString, showTime = true) => {
    if (!dateString) return '-';  // Handle null or undefined dates

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Bangkok', // Adjust timezone as needed
    };

    if (showTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = false; // Use 24-hour format
    }

    try {
        // Use the current locale from i18n
        const locale = i18n.global.locale;
        return new Date(dateString).toLocaleDateString(locale, options).replace(',', '');
    } catch (error) {
        console.error("Invalid date:", dateString, error);
        return '-';  // Return a dash if the date is invalid
    }
};


export const formatDateLocale = (dateString, showTime = true) => {
    if (!dateString) return '-';  // Handle null or undefined dates

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Bangkok', // Adjust timezone as needed
    };

    if (showTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = false; // Use 24-hour format
    }

    try {
        // Use the current locale from i18n
        const locale = i18n.global.locale;
        return new Date(dateString).toLocaleDateString(locale, options).replace(',', '');
    } catch (error) {
        console.error("Invalid date:", dateString, error);
        return '-';  // Return a dash if the date is invalid
    }
};