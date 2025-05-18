// src/utils/permissions.js
import {useTokenStore} from '@/stores/token';

// Admin roles that have full access
const ADMIN_ROLES = ['admin', 'administrator', 'manage-account'];

// Organization access roles
const ORGANIZATION_ACCESS_ROLES = ['admin', 'administrator', 'manage-account'];

// Device management roles
const DEVICE_MANAGEMENT_ROLES = ['admin', 'administrator', 'manage-account', 'device-manager'];

// RFID tag roles
const RFID_MANAGEMENT_ROLES = ['admin', 'administrator', 'manage-account', 'rfid-manager'];

/**
 * Check if the current user has admin privileges
 * @returns {boolean} True if user has admin access
 */
export function hasAdminAccess() {
    const tokenStore = useTokenStore();
    const currentRoles = tokenStore.getRoles();

    if (!Array.isArray(currentRoles)) {
        console.warn("Roles is undefined or not an array:", currentRoles);
        return false;
    }

    const hasAccess = currentRoles.some(role =>
        ADMIN_ROLES.includes(role.toLowerCase())
    );

    console.log("Has admin access:", hasAccess);
    return hasAccess;
}

/**
 * Check if the current user has organization access
 * @returns {boolean} True if user has organization access
 */
export function hasOrganizationAccess() {
    const tokenStore = useTokenStore();
    const currentRoles = tokenStore.getRoles();

    console.log("Current roles (function):", currentRoles);

    if (!Array.isArray(currentRoles)) {
        console.warn("Roles is undefined or not an array:", currentRoles);
        return false;
    }

    const hasAccess = currentRoles.some(role =>
        ORGANIZATION_ACCESS_ROLES.includes(role.toLowerCase())
    );

    console.log("Has organization access (function):", hasAccess);
    return hasAccess;
}

/**
 * Check if the current user has device management access
 * @returns {boolean} True if user has device management access
 */
export function hasDeviceManagementAccess() {
    const tokenStore = useTokenStore();
    const currentRoles = tokenStore.getRoles();

    if (!Array.isArray(currentRoles)) {
        console.warn("Roles is undefined or not an array:", currentRoles);
        return false;
    }

    const hasAccess = currentRoles.some(role =>
        DEVICE_MANAGEMENT_ROLES.includes(role.toLowerCase())
    );

    console.log("Has device management access:", hasAccess);
    return hasAccess;
}

/**
 * Check if the current user has RFID tag management access
 * @returns {boolean} True if user has RFID management access
 */
export function hasRfidManagementAccess() {
    const tokenStore = useTokenStore();
    const currentRoles = tokenStore.getRoles();

    if (!Array.isArray(currentRoles)) {
        console.warn("Roles is undefined or not an array:", currentRoles);
        return false;
    }

    const hasAccess = currentRoles.some(role =>
        RFID_MANAGEMENT_ROLES.includes(role.toLowerCase())
    );

    console.log("Has RFID management access:", hasAccess);
    return hasAccess;
}

/**
 * Generic function to check if user has a specific role
 * @param {string|string[]} requiredRoles - Role or array of roles to check
 * @returns {boolean} True if user has at least one of the required roles
 */
export function hasRole(requiredRoles) {
    const tokenStore = useTokenStore();
    const currentRoles = tokenStore.getRoles();

    if (!Array.isArray(currentRoles)) {
        console.warn("Roles is undefined or not an array:", currentRoles);
        return false;
    }

    // Convert single role to array if needed
    const rolesToCheck = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

    return currentRoles.some(userRole =>
        rolesToCheck.some(requiredRole =>
            userRole.toLowerCase() === requiredRole.toLowerCase()
        )
    );
}

/**
 * Check if the current user can perform CRUD operations on RFID tags
 * @returns {boolean} True if user can manage RFID tags
 */
export function canManageRfidTags() {
    return hasAdminAccess() || hasRfidManagementAccess();
}

/**
 * Check if the current user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated() {
    const tokenStore = useTokenStore();
    const token = tokenStore.getAccessToken();
    return !!token;
}

//// In a component
// import { hasAdminAccess, canManageRfidTags } from '@/utils/permissions';
// import { computed } from 'vue';
//
// // Create computed properties for reactive checks
// const canManageTags = computed(() => canManageRfidTags());
// const isAdmin = computed(() => hasAdminAccess());
//
// // Then use them in template conditions
// // <button v-if="canManageTags">Add Tag</button>
// // <button v-if="isAdmin">Delete</button>
