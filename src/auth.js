// src/auth.js

import { useTokenStore } from '@/stores/token';

export function getToken() {
    return useTokenStore().getApiToken();
}

export function clearStorage() {
    useTokenStore().clearTokenData();
}

export async function handleLogout() {
    const BASE_PATH = import.meta.env.VITE_APP_BASE_PATH || "/";
    try {
        console.log("Logout called");
    } catch (e) {
        console.warn("Logout error", e);
    } finally {
        clearStorage();
        window.location.href = BASE_PATH;
    }
}

export async function handleSSOLogout() {
    clearStorage();
    window.location.href = import.meta.env.VITE_PORTAL_LOGOUT_URL || "/";
}
