// stores/token.js

import { defineStore } from 'pinia';

export const useTokenStore = defineStore('token', () => {

    const PORTAL_ACCESS_TOKEN = "portal";
    const API_KEY = "apiKey";
    /**
     * Decode JWT token to extract payload
     */
    function decodeJwt(jwtToken) {
        try {
            const payload = jwtToken.split('.')[1];
            return JSON.parse(atob(payload));
        } catch (e) {
            console.error("Failed to decode token", e);
            return null;
        }
    }
    /**
     * Clear all stored tokens and user session data from both sessionStorage and localStorage.
     */
    function clearTokenData() {
        // Tokens
        sessionStorage.removeItem("apiKey");
        sessionStorage.removeItem("portal");

        // 👤 Profile
        sessionStorage.removeItem("userProfile");
        localStorage.removeItem("userProfile"); // In case debug stored here

        // Menu Permissions
        sessionStorage.removeItem("userMenus");
        localStorage.removeItem("userMenus");

        // Organization Access
        sessionStorage.removeItem("userOrganizations");
        localStorage.removeItem("userOrganizations");

        // 🗝️ Debug values (optional cleanup)
        localStorage.removeItem("goto DashBoard with apiKey");
        localStorage.removeItem("raw_token");
        localStorage.removeItem("raw_access_token");
        localStorage.removeItem("raw_portal_response");
        localStorage.removeItem("No apiKey");

        console.info("[clearTokenData] Session and local storage cleared.");
    }

    /**
     * Get portal token (original access token from Web Portal).
     */
    function getPortalToken() {
        return sessionStorage.getItem(PORTAL_ACCESS_TOKEN);
    }
    /**
     * Get backend-generated API token.
     */
    function getApiToken() {
        return sessionStorage.getItem(API_KEY);
    }

    /**
     * Set token and extract user information (from API token only)
     */
    function setTokens({ portalToken, apiToken }) {
        if (portalToken) {
            sessionStorage.setItem(PORTAL_ACCESS_TOKEN, portalToken);
        }
        if (apiToken) {
            sessionStorage.setItem(API_KEY, apiToken);
        }
    }

    function getUserInfo() {
        const json = sessionStorage.getItem("userInfo");
        try {
            return json ? JSON.parse(json) : null;
        } catch (e) {
            console.warn("Invalid userInfo format", e);
            return null;
        }
    }

    function isTokenValid(token, safetyMargin = 20) {
        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            const now = Math.floor(Date.now() / 1000); // Current time in seconds
            const expiration = decoded.exp;
            const remainingTime = expiration - now;
            return remainingTime > safetyMargin;
        } catch (error) {
            console.error('Failed to validate token:', error);
            return false;
        }
    }

    /**
     * Get roles from API token (comma string or array).
     */
    function getRoles() {
        const token = getApiToken(); // หรือ getAccessToken() แล้วแต่ชื่อฟังก์ชันของคุณ
        const decoded = decodeJwt(token);
        const roles = decoded?.roles;
        return Array.isArray(roles) ? roles : roles?.split(',') ?? [];
    }

    /**
     * Get username from API token.
     */
    function getUsername() {
        const token = getApiToken();
        const decoded = decodeJwt(token);
        return decoded?.sub || null;
    }

    function setUserProfile(profile) {
        if (profile && typeof profile === 'object') {
            try {
                sessionStorage.setItem("userProfile", JSON.stringify(profile));
            } catch (e) {
                console.warn("Failed to stringify userProfile", e);
            }
        }
    }
    function getUserProfile() {
        const raw = sessionStorage.getItem("userProfile");
        try {
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.warn("Invalid userProfile format", e);
            return null;
        }
    }

    return {
        setTokens,
        clearTokenData,
        getPortalToken,
        getApiToken,
        isTokenValid,
        getRoles,
        getUsername,
        getUserInfo,
        decodeJwt,
        setUserProfile,
        getUserProfile,
    };
});
