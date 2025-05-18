import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/axiostoastapi.js';

export const useUserOrganizationsStore = defineStore('userOrganizations', () => {
    // State
    const organizationAccesses = ref([]);

    // Actions
    const fetchUserOrganizations = async (username) => {
        try {
            const response = await api.get(`/api/users/${username}/organizations`);

            // Update store state with List<UserOrganizationAccessDTO>
            organizationAccesses.value = response.data;

            return {
                organizations: organizationAccesses.value
            };
        } catch (error) {
            console.error('Failed to fetch user organizations', error);
            clearUserOrganizations();
            throw error;
        }
    };

    const clearUserOrganizations = () => {
        organizationAccesses.value = [];
    };

    // Utility methods
    const hasAccessToOrganization = (organizationId, minAccessLevel = 'READ') => {
        return organizationAccesses.value.some(org =>
            org.organizationHierarchyId === organizationId &&
            compareAccessLevel(org.accessLevel, minAccessLevel)
        );
    };

    const getOrganizationAccessLevel = (organizationId) => {
        const orgAccess = organizationAccesses.value.find(
            org => org.organizationHierarchyId === organizationId
        );
        return orgAccess ? orgAccess.accessLevel : null;
    };

    // Helper for comparing access levels
    const compareAccessLevel = (userLevel, requiredLevel) => {
        const accessLevels = ['NONE', 'READ', 'WRITE', 'ADMIN'];
        const userLevelIndex = accessLevels.indexOf((userLevel || 'NONE').toUpperCase());
        const requiredLevelIndex = accessLevels.indexOf(requiredLevel.toUpperCase());

        return userLevelIndex >= requiredLevelIndex;
    };

    return {
        // State
        organizationAccesses,

        // Actions
        fetchUserOrganizations,
        clearUserOrganizations,

        // Utility
        hasAccessToOrganization,
        getOrganizationAccessLevel
    };
}, {
    persist: {
        storage: sessionStorage,
        key: 'user-organizations',
        paths: ['organizationAccesses']
    }
});

