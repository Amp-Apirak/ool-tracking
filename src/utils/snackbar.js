// utils/snackbar.js

import { reactive } from 'vue';

const snackbarState = reactive({
    show: false,
    text: "",
    color: "success",
    timeout: 5000,
    position: 'bottom',
    dismissible: true
});

export const snackbar = snackbarState;

export const showSnackbar = (options) => {

    snackbarState.text = options.text || "";
    snackbarState.color = options.color || "success";
    snackbarState.timeout = options.timeout !== undefined ? options.timeout : 5000;
    snackbarState.position = options.position || 'bottom';
    snackbarState.dismissible = options.dismissible !== undefined ? options.dismissible : true;

    setTimeout(() => {
        snackbarState.show = true;
    }, 0);
};

export const showSuccess = (text, options = {}) => {
    showSnackbar({
        text,
        color: "success",
        ...options
    });
};

export const showError = (text, options = {}) => {
    showSnackbar({
        text,
        color: "error",
        ...options
    });
};

export const showWarning = (text, options = {}) => {
    showSnackbar({
        text,
        color: "warning",
        ...options
    });
};

export const showInfo = (text, options = {}) => {
    showSnackbar({
        text,
        color: "info",
        ...options
    });
};

export const hideSnackbar = () => {
    snackbarState.show = false;
};

export const showNotification = ({ type = 'success', message }) => {
    const map = {
        success: showSuccess,
        error: showError,
        warning: showWarning,
    };
    const showFn = map[type] || showSuccess;
    showFn(message);
};
