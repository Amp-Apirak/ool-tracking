// router/inex.js

import { createRouter, createWebHistory } from 'vue-router';
import MainSidebar from '@/components/MainSidebar.vue';
import PageDashboard from '@/components/PageDashboard.vue';
import PageRegisterRfidTags from "@/components/PageRegisterRfidTags.vue";
import PageRegisterNetworkDevices from "@/components/PageRegisterNetworkDevices.vue";
import PageManageSupply from "@/components/PageManageSupply.vue";
import PageAlertSummaryPage from "@/components/PageAlertSummaryPage.vue";
import PageLocationManagement from "@/components/PageLocationManagement.vue";
import PageSettings from "@/components/PageSettings.vue";
import PageUsersManagement from "@/components/PageUsersManagement.vue";
import PagePortalSSO from "@/components/PagePortalSSO.vue";
import DirectLogin from "@/components/DirectLogin.vue";

const routes = [
    {  path: '/',
        redirect: to => {
            // ถ้ามี token ให้ไปที่ Dashboard เลย
            if (sessionStorage.getItem('apiKey')) {
                //localStorage.setItem('goto DashBoard with apiKey',sessionStorage.getItem('apiKey'));
                return '/main/Dashboard';
            }
            //localStorage.setItem('No apiKey',sessionStorage.getItem('apiKey'));
            // ถ้าไม่มี token ให้ตรวจสอบค่า config ว่าให้แสดงหน้า login หรือไม่
            const allowDirectLogin = import.meta.env.VITE_ALLOW_DIRECT_LOGIN === 'true';
            if (allowDirectLogin) {
                return '/direct-login';
            }
            // ถ้าไม่อนุญาตให้ login โดยตรง ก็ redirect ไปยัง portal
            const portalUrl = import.meta.env.VITE_PORTAL_LOGIN_URL;
            if (portalUrl) {
                window.location.href = portalUrl;
                return false;
            }
            // fallback ไปที่หน้า SSO
            return '/auth';
        }
    },
    { path: '/auth', component: PagePortalSSO },        // เพิ่มเส้นทางสำหรับ authToken
    { path: '/direct-login', component: DirectLogin },  // เพิ่มเส้นทางสำหรับการเข้าสู่ระบบโดยตรง
    {
        path: '/main',
        component: MainSidebar,
        children: [
            { path: 'Dashboard', component: PageDashboard},
            { path: 'RegisterRfidTags', component: PageRegisterRfidTags},
            { path: 'RegisterReader', component: PageRegisterNetworkDevices },
            { path: 'ManageSupplies', component: PageManageSupply},
            { path: 'AlertSummaryPage', component: PageAlertSummaryPage },
            { path: 'Organization', component: PageLocationManagement },
            { path: 'User', component: PageUsersManagement },
            { path: 'Settings', component: PageSettings},
        ]
    }
];

const router = createRouter({
    // Add the base path from your environment variable
    history: createWebHistory(import.meta.env.VITE_APP_BASE_PATH),
    //history: createWebHistory(),
    routes
});

export default router;
