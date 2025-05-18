/*
/src/timeConfig.js

This module provides utility functions and configurations for handling
server-side and client-side date and time formatting. It ensures that dates
and times are consistently formatted across the application, adjusts times
based on the server's and user's local time zones, and applies locale-based
formatting.

Usage:
- `convertToLocalTime(serverTime)`: Converts a server UTC time to the local
   time zone of the user.
- `formatDateTime(date, formatString, locale)`: Formats a given date based on
   the server's time zone, with customizable formatting patterns and locale support.

Timezone and locale configuration:
- `SERVER_TIMEZONE`: The server's timezone (default: 'UTC').
- `DEFAULT_LOCALE`: The locale to be used for date formatting (default: 'en-US').

Example usage in Vue components or elsewhere:
- Import `TIME_CONFIG` and use `convertToLocalTime` or `formatDateTime`
   to format dates before displaying them to the user.

*/

import { formatInTimeZone } from 'date-fns-tz';
import { enUS } from 'date-fns/locale';

// Server timezone (ideally, this should come from an environment variable)
export const SERVER_TIMEZONE = import.meta.env.VITE_SERVER_TIMEZONE || 'UTC';

// Date and time formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;

// Locale settings
export const DEFAULT_LOCALE = enUS;  // Use locale object, not string

// Utility functions
export const convertToLocalTime = (serverTime) => {
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return formatInTimeZone(serverTime, localTimeZone, DATETIME_FORMAT);
};

export const formatDateTime = (date, formatString = DATETIME_FORMAT, locale = DEFAULT_LOCALE) => {
    return formatInTimeZone(date, SERVER_TIMEZONE, formatString, { locale });
};

// Configuration object (for easy import of multiple settings)
export const TIME_CONFIG = {
    SERVER_TIMEZONE,
    DATE_FORMAT,
    TIME_FORMAT,
    DATETIME_FORMAT,
    DEFAULT_LOCALE,
    convertToLocalTime,
    formatDateTime,
};

export default TIME_CONFIG;
