<template>
  <v-container fluid>
    <!-- Header -->
    <v-card class="mb-4">
      <HeaderCommon :title="t('settings')" />
    </v-card>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" class="folder-tabs mb-0" show-arrows centered>
      <v-tab>{{ t('tab_set_alert') }}</v-tab>
      <v-tab>{{ t('tab_set_alert_temperature') }}</v-tab>
    </v-tabs>

    <!-- Tab Content -->
    <v-window v-model="activeTab">
      <!-- Tab 1: Set Alert -->
      <v-window-item value="0">
        <SetAlert v-if="activeTab === 0" />
      </v-window-item>

      <!-- Tab 2: Set Alert Temperature -->
      <v-window-item value="1">
        <SetAlertTemperature v-if="activeTab === 1" />
      </v-window-item>

      <!-- Tab 3: Set Inactive and Lost Alert ON/OFF-->


    </v-window>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import HeaderCommon from "@/components/HeaderCommon.vue";
import SetAlert from "@/components/TabSetAlert.vue";
import SetAlertTemperature from "@/components/TabSetAlertTemperature.vue";
import { useI18n } from "vue-i18n";

const { t} = useI18n(); // Access Vue I18n functions

// Active tab index
const activeTab = ref(0);
</script>
<style scoped>
.folder-tabs {
  background-color: #f5f5f5;
  border-bottom: 2px solid #ccc;
  margin-bottom: 16px;
}
.folder-tabs .v-tab{
  color: #333;
  font-weight: bold;
  border-top-left-radius: 8px;
  border-top-right-radius: 20px;  /* Increased radius for more curved upper right corner */
  background-color: #e0e0e0;
  margin-right: 4px;
  border: 2px solid #ccc;
  border-bottom: none;
  transition: all 0.3s ease;
  position: relative;  /* Added for pseudo-element positioning */
  overflow: hidden;  /* Added to hide overflow from pseudo-element */
}
.v-tab:hover {
  background-color: #1B5E20; /* Slightly darker red for hover state */
}
/* Override any Vuetify default styles */
.v-tabs .v-tab.v-tab--selected {
  background-color: #388E3C !important;
  color: white !important;
}
.folder-tabs .v-tab.v-tab {
  color: #333;
  font-weight: bold;
  border-top-left-radius: 8px;
  border-top-right-radius: 20px;
  background-color: #e0e0e0;
  margin-right: 4px;
  border: 2px solid #ccc;
  border-bottom: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.v-tabs .v-tab:hover{
  background-color: #1B5E20; /* Slightly darker red for hover state */
}
.v-tabs .v-tab.v-tab--selected {
  background-color: #388E3C !important;
  color: white !important;
  border-top-left-radius: 8px; /* Ensure selected tab also follows same rounding */
  border-top-right-radius: 20px;
}
</style>
