<template>
  <v-app>
    <router-view />
    <SnackbarComponent />
    <!-- Components ที่ใช้ reactive state ควรอยู่ใน v-app -->
  </v-app>
</template>

<script setup>
import SnackbarComponent from './components/SnackbarComponent.vue';
// Import components อื่นๆ ที่ใช้ reactive state หรือ Vuetify ที่นี่
</script>

<script>
export default {
  name: 'App'
}
</script>
