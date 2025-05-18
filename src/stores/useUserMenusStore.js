// src/stores/useUserMenusStore.js

import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from "@/axiostoastapi.js";  // เปลี่ยนตาม path ที่คุณใช้เรียก API จริง

export const useUserMenusStore = defineStore('userMenus', () => {
    const allowedMenus = ref([]); // รายการชื่อเมนูที่ user มีสิทธิ์ (เช่น ['Dashboard', 'RegisterRfidTags'])
    const MENU_PERMISSION_ENABLED = import.meta.env.VITE_MENU_PERMISSION_ENABLED === 'true';

    const fetchUserMenuPermissions = async (userId) => {

        if (!MENU_PERMISSION_ENABLED) {
            allowedMenus.value = getAllAvailableMenus(userId); // ให้สิทธิ์ทุกเมนู
            return;
        }

        try {
            const response = await api.get(`/api/users/${userId}/menu-permissions`);
            console.log('Response from getting menu permission ',response);
            allowedMenus.value = response.data;
            console.log('Allow: ',allowedMenus.value );
        } catch (error) {
            console.error('Failed to fetch menu permissions', error);
            allowedMenus.value = [];
        }
    };

    // helper
    function getAllAvailableMenus() {
        return [
            'Dashboard',
            'RegisterRfidTags',
            'RegisterReader',
            'ManageSupplies',
            'AlertSummaryPage',
            'Organization',
            'User',
            'Settings'
        ];
    }

    /**
     * ตรวจสอบว่า user มีสิทธิ์ดูเมนูนี้หรือไม่
     * @param {string} menuName - ใช้ค่า route เช่น 'Dashboard', 'Settings'
     */
    const hasMenuPermission = (menuName) => {
        return allowedMenus.value.includes(menuName);
    };

    return {
        allowedMenus,
        fetchUserMenuPermissions,
        hasMenuPermission
    };
}, {
    persist: {
        storage: sessionStorage,
        key: 'user-menus',
        paths: ['allowedMenus']
    }
});