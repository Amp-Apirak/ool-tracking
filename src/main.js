// src/main.js
// Close console.log(), console.warn(), console.error() ในโหมด Production
if (import.meta.env.VITE_ENABLE_CONSOLE !== "true") {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
}

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import {createVuetify} from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import VueSidebarMenu from 'vue-sidebar-menu'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { createPinia } from 'pinia';
import Toast from 'vue3-toastify';
import i18n from './i18n';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
        iconfont: 'mdiSvg',
    },
})

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

createApp(App)
    .use(i18n)
    .use(VueSidebarMenu)
    .use(vuetify)
    .use(router)
    .use(Toast)
    .use(pinia)
    .mount('#app')
