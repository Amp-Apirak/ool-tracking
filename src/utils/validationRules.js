// src/utils/validationRules.js
export const requiredRule = (value) => !!value || 'This field is required';
export const futureDateRule = (value) => {
    return new Date(value) >= new Date() || 'Date must be in the future';
};
export const minLengthRule = (minLength) => {
    return (value) => value.length >= minLength || `Minimum ${minLength} characters required`;
};
export const minimumLength = (length) => (value) => value.length >= length || `Minimum length is ${length} characters`;
export const numberRule = (value) => !isNaN(value) || 'This field must be a number';
export const positiveNumberRule = (value) => value > 0 || 'The number must be positive';
export const emailRule = (value) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || 'Invalid e-mail.';
};
export const maxLength = length => value => (value || '').length <= length || `Max length is ${length} characters`;
export const validatePrice = (value) => {
    if (!value) return 'Unit Price should be number';
    if (isNaN(value) || value <= 0) return 'Unit Price must be a positive number';
    return true;
};
// English Translation
export const engRules = {
    requiredRule: (value) => !!value || 'This field is required.',
    futureDateRule: (value) => new Date(value) >= new Date() || 'The date must be in the future.',
    minLengthRule: (minLength) => (value) => value.length >= minLength || `Minimum of ${minLength} characters required.`,
    maxLengthRule: (length) => (value) => (value || '').length <= length || `Maximum of ${length} characters allowed.`,
    numberRule: (value) => !isNaN(value) || 'This field must be a number.',
    positiveNumberRule: (value) => value > 0 || 'The number must be positive.',
    emailRule: (value) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value) || 'Invalid email address.';
    },
    validatePrice: (value) => {
        if (!value) return 'Unit price is required.';
        if (isNaN(value) || value <= 0) return 'Unit price must be a positive number.';
        return true;
    }
};
// Thai translation
export const thaiRules = {
    requiredRule: (value) => !!value || 'ต้องป้อนข้อมูลในช่องนี้.',
    futureDateRule: (value) => new Date(value) >= new Date() || 'วันที่ต้องเป็นวันในอนาคต.',
    minLengthRule: (minLength) => (value) => value.length >= minLength || `ต้องมีอย่างน้อย ${minLength} ตัวอักษร.`,
    maxLengthRule: (length) => (value) => (value || '').length <= length || `ความยาวสูงสุดคือ ${length} ตัวอักษร.`,
    numberRule: (value) => !isNaN(value) || 'ต้องเป็นตัวเลขเท่านั้น.',
    positiveNumberRule: (value) => value > 0 || 'ต้องเป็นตัวเลขที่มีค่ามากกว่าศูนย์.',
    emailRule: (value) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value) || 'อีเมลไม่ถูกต้อง.';
    },
    validatePrice: (value) => {
        if (!value) return 'ต้องป้อนราคาต่อหน่วย.';
        if (isNaN(value) || value <= 0) return 'ราคาต่อหน่วยต้องเป็นตัวเลขที่มีค่ามากกว่าศูนย์.';
        return true;
    }
};
// Lao (ພາສາລາວ) translations
export const laoRules = {
    requiredRule: (value) => !!value || 'ຕ້ອງປ້ອນຂໍ້ມູນໃສ່ຊ່ອງນີ້',
    futureDateRule: (value) => new Date(value) >= new Date() || 'ວັນທີຕ້ອງເປັນວັນທີໃນອະນາຄົດ',
    minLengthRule: (minLength) => (value) => value.length >= minLength || `ຕ້ອງມີຢ່າງໜ້ອຍ ${minLength} ຕົວອັກສອນ`,
    numberRule: (value) => !isNaN(value) || 'ຕ້ອງເປັນຕົວເລກເທົ່ານັ້ນ',
    positiveNumberRule: (value) => value > 0 || 'ຕ້ອງເປັນຕົວເລກທີ່ມີຄ່າເປັນບວກ',
    emailRule: (value) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || 'ອີເມວບໍ່ຖືກຕ້ອງ';
    },
    maxLength: (length) => (value) => (value || '').length <= length || `ຄວາມຍາວສູງສຸດແມ່ນ ${length} ຕົວອັກສອນ`,
    validatePrice: (value) => {
        if (!value) return 'ຕ້ອງປ້ອນລາຄາຫົວໜ່ວຍ';
        if (isNaN(value) || value <= 0) return 'ລາຄາຫົວໜ່ວຍຕ້ອງເປັນຕົວເລກທີ່ມີຄ່າເປັນບວກ';
        return true;
    }
};
// Japanese (日本語) translations
export const japaneseRules = {
    requiredRule: (value) => !!value || 'このフィールドは必須です',
    futureDateRule: (value) => new Date(value) >= new Date() || '日付は未来の日付でなければなりません',
    minLengthRule: (minLength) => (value) => value.length >= minLength || `最低${minLength}文字必要です`,
    numberRule: (value) => !isNaN(value) || '数字でなければなりません',
    positiveNumberRule: (value) => value > 0 || '正の数でなければなりません',
    emailRule: (value) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || '無効なメールアドレスです';
    },
    maxLength: (length) => (value) => (value || '').length <= length || `最大${length}文字までです`,
    validatePrice: (value) => {
        if (!value) return '単価は必須です';
        if (isNaN(value) || value <= 0) return '単価は正の数でなければなりません';
        return true;
    }
};
// Chinese (中文) translations
export const chineseRules = {
    requiredRule: (value) => !!value || '此字段为必填项',
    futureDateRule: (value) => new Date(value) >= new Date() || '日期必须是未来日期',
    minLengthRule: (minLength) => (value) => value.length >= minLength || `最少需要${minLength}个字符`,
    numberRule: (value) => !isNaN(value) || '必须是数字',
    positiveNumberRule: (value) => value > 0 || '必须是正数',
    emailRule: (value) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || '无效的电子邮件地址';
    },
    maxLength: (length) => (value) => (value || '').length <= length || `最多${length}个字符`,
    validatePrice: (value) => {
        if (!value) return '单价为必填项';
        if (isNaN(value) || value <= 0) return '单价必须是正数';
        return true;
    }
};

// RFID Tag Validation: Must be 24 characters, uppercase, and hexadecimal
export const rfidTagValidationRule = (value) => {
    const pattern = /^[A-F0-9]{24}$/;
    return pattern.test(value) || 'RFID Tag must be a 24-character uppercase hexadecimal string';
};

export const thaiCharacterRuleStrict = (value) => {
    const thaiPattern = /^[ก-๙\s]+$/;
    return thaiPattern.test(value) || 'ต้องเป็นอักขระภาษาไทยเท่านั้น.';
};
export const thaiCharacterRule = (value) => {
    const pattern = /^[A-Za-zก-๙0-9.,\-\/():@&_"'!%*+=[\]{}<>?^~`|\\]+$/;
    return pattern.test(value) || 'ห้ามเว้นวรรค และอนุญาตเฉพาะภาษาไทย ภาษาอังกฤษ ตัวเลข และอักขระทั่วไปเท่านั้น.';
};
export const englishCharacterRuleStrict = (value) => {
    const englishPattern = /^[A-Za-z\s]+$/;
    return englishPattern.test(value) || 'Only English letters are allowed.';
};
export const englishCharacterRule = (value) => {
    const pattern = /^[A-Za-z0-9.,\-\/():@&_"'!%*+=[\]{}<>?^~`|\\]+$/;
    return pattern.test(value) || 'Only English letters, numbers, and special characters are allowed (no spaces).';
};

// MAC Address validation
export const macAddressRule = (value) => {
    if (!value) return true; // Allow empty
    const pattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return pattern.test(value) || 'Invalid MAC address format (e.g., AA:BB:CC:DD:EE:FF)';
};

// IP Address validation
export const ipAddressRule = (value) => {
    if (!value) return true; // Allow empty
    const pattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    return pattern.test(value) || 'Invalid IP address format (e.g., 192.168.1.1)';
};

// Required IP Address (combines required and format)
export const requiredIpAddressRule = (value) => {
    if (!value) return 'IP address is required';
    return ipAddressRule(value);
};

// Serial Number validation (if needed)
export const serialNumberRule = (value) => {
    if (!value) return true;
    const pattern = /^[A-Za-z0-9-]+$/;
    return pattern.test(value) || 'Serial number can only contain letters, numbers, and hyphens';
};

// Model Number validation (if needed)
export const modelNumberRule = (value) => {
    if (!value) return true;
    const pattern = /^[A-Za-z0-9-]+$/;
    return pattern.test(value) || 'Model number can only contain letters, numbers, and hyphens';
};

// RFID Number validation 24 digit hexadecimal
export const rfidNumberRule = (value) => {
    if (!value) return true;
    const pattern = /^[A-F0-9]{24}$/;  // 24 uppercase hex characters
    return pattern.test(value) || 'RFID number must be a 24-character uppercase hexadecimal string (0-9, A-F)';
};

export const requiredCoordinateRule = (value, t) => {
    return value !== null && value !== undefined && value !== ''
        ? true
        : t ? t('please_click_on_map_to_set_coordinates') : 'Please click on the map to set coordinates';
};

export const gatewayValidationRule = (value, t) => {
    // Check if the value is a string (user input) and if it resembles "Gateway"
    if (typeof value === 'string' &&
        value.toLowerCase().includes('gateway')) {
        return t('gateway_not_allowed');
    }
    return true; // Validation passes
};
/**
 * Validates start date:
 * - Must not be after the end date (if end date is set)
 * - Must not be after today
 *
 * @param {string} value - The start date value in YYYY-MM-DD format
 * @param {string|null} endDate - The current end date value in YYYY-MM-DD format (optional)
 * @returns {boolean|string} - True if valid, error message if invalid
 */
export const validateStartDateRule = (value, endDate = null) => {
    // Skip validation if empty
    if (!value) return true;

    try {
        // Normalize date (remove time)
        const startDate = new Date(value);
        startDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if start date is in the future
        if (startDate > today) {
            return 'Start date cannot be in the future';
        }

        // Check if end date exists and start date is after end date
        if (endDate) {
            const parsedEndDate = new Date(endDate);
            parsedEndDate.setHours(0, 0, 0, 0);

            if (startDate > parsedEndDate) {
                return 'Start date cannot be after end date';
            }
        }

        return true;
    } catch (error) {
        return 'Invalid date format';
    }
};

/**
 * Validates end date:
 * - Must not be before the start date (if start date is set)
 * - Must not be after today
 *
 * @param {string} value - The end date value in YYYY-MM-DD format
 * @param {string|null} startDate - The current start date value in YYYY-MM-DD format (optional)
 * @returns {boolean|string} - True if valid, error message if invalid
 */
export const validateEndDateRule = (value, startDate = null) => {
    // Skip validation if empty
    if (!value) return true;

    try {
        // Normalize date (remove time)
        const endDate = new Date(value);
        endDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if end date is in the future
        if (endDate > today) {
            return 'End date cannot be in the future';
        }

        // Check if start date exists and end date is before start date
        if (startDate) {
            const parsedStartDate = new Date(startDate);
            parsedStartDate.setHours(0, 0, 0, 0);

            if (endDate < parsedStartDate) {
                return 'End date cannot be before start date';
            }
        }

        return true;
    } catch (error) {
        return 'Invalid date format';
    }
};

export const usernameRules = (value) => {
    // Skip validation if empty
    if (!value) return true;

    // Check minimum and maximum length
    if (value.length < 3) {
        return 'Username must be at least 3 characters long';
    }

    if (value.length > 20) {
        return 'Username cannot exceed 20 characters';
    }

    // Check if username starts with a letter
    if (!/^[a-zA-Z]/.test(value)) {
        return 'Username must start with a letter';
    }

    // Check for valid characters (letters, numbers, underscores, hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        return 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    // Check for consecutive special characters
    if (/[_-]{2,}/.test(value)) {
        return 'Username cannot contain consecutive special characters';
    }

    return true;
};
export const organizationNameRule = (value) => {
    if (!value) return true;

    const trimmedValue = value.trim();
    const invalidChars = /[<>`\\]/g;

    if (invalidChars.test(trimmedValue)) {
        return 'The following characters are not allowed: < > ` \\';
    }

    return true;
};
