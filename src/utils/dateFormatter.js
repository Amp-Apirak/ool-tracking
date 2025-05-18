// src/utils/dateFormatter.js
import {format} from "date-fns";
import i18n from '@/i18n';

export const formatDateAsset = (dateString, showTime = true) => {
    if (!dateString) return '-';  // Handle null or undefined dates

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Bangkok'
    };

    if (showTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = false;
    }

    try {
        return new Date(dateString).toLocaleDateString('en-US', options).replace(',', '');
    } catch (error) {
        console.error("Invalid date:", dateString, error);
        return '-';  // Return a dash if the date is invalid
    }
};

export const formatDateAssetNoComma = (dateString, showTime = true) => {
    if (!dateString) return '-';  // Handle null or undefined dates

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Bangkok'
    };

    if (showTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = false;
    }

    try {
        return new Date(dateString)
            .toLocaleDateString('en-US', options)
            .replace(/,/g, '');  // Replace commas with spaces
    } catch (error) {
        console.error("Invalid date:", dateString, error);
        return '-';  // Return a dash if the date is invalid
    }
};

export const formatDate = (dateString) => {
    // Check if the dateString is null, undefined, or invalid
    if (!dateString || isNaN(new Date(dateString).getTime())) {
        return '';  // Return a default value like '' when the date is invalid
    }
    const options = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, timeZone: 'Asia/Bangkok'
    };

    return new Date(dateString).toLocaleDateString('en-US', options).replace(',', '');
};

export const formatDateDelete = (date) => {
    if (!date) return 'Not deleted';
    return format(new Date(date), 'MMM dd yyyy \'at\' HH:mm:ss');
}

export const formatDateMMM_DD_YYYY = (date) => {
    if (!date) return 'Not deleted';
    return format(new Date(date), 'MMM dd yyyy');
}

export const formatDateYYYY_MMM_DD = (date) => {
    if (!date) return 'Not deleted';
    const dateObject = typeof date === 'string' ? new Date(Number(date)) : new Date(date);
    return format(dateObject, 'yyyy-MM-dd');
}

export const formatDateYYYY_MMM_DD_Non = (date) => {
    if (!date) return '';
    const dateObject = typeof date === 'string' ? new Date(Number(date)) : new Date(date);
    return format(dateObject, 'yyyy-MM-dd');
}

export const formatDateMMM_DD_YYYY_Non = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM dd yyyy');
}

export const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset() * 60000; // Convert offset to milliseconds
        return new Date(date - offset).toISOString().slice(0, 16);
    } catch (error) {
        console.error("Invalid date:", dateString, error);
        return '';
    }
};
