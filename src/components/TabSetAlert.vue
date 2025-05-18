<!-- TabSetAlert.vue-->
<template>
  <v-card class="alert-settings" flat>
    <v-card-text>
      <v-container>
        <!-- Title with Icon -->
        <div class="alert-header">
          <div class="alert-title-container">
            <v-icon size="x-large" color="error" class="alert-icon pulse-animation">mdi-bell-ring-outline</v-icon>
            <h2 class="alert-title">{{ t('alert_settings') }}</h2>
          </div>
          <div class="alert-subtitle">
            {{ t('alert_settings_description') || 'Configure system alert settings' }}
          </div>
        </div>

        <!-- Alert Settings Container -->
        <v-sheet class="alert-box" rounded elevation="2">
          <div class="alert-box-header">
            <v-icon color="primary" class="me-2">mdi-shield-alert-outline</v-icon>
            <span>{{ t('security_alerts') || 'Security Alerts' }}</span>
          </div>
          
          <!-- Unauthorized Entry Alert -->
          <div class="alert-item" :class="{ 'active': unauthorizedEnterEnabled }">
            <div class="alert-item-info">
              <v-icon color="primary" class="alert-item-icon">
                mdi-door-open
              </v-icon>
              <div class="alert-item-content">
                <div class="alert-item-title">{{ t('unauthorized_entry_alert') }}</div>
                <div class="alert-item-desc">{{ t('unauthorized_entry_alert_desc') || 'Alerts when an unauthorized person enters a restricted area.' }}</div>
              </div>
            </div>
            <div class="alert-item-action">
              <v-switch
                v-model="unauthorizedEnterEnabled"
                color="success"
                hide-details
                inset
              >
                <template v-slot:append>
                  <div class="switch-status">{{ unauthorizedEnterEnabled ? t('enabled') || 'Enabled' : t('disabled') || 'Disabled' }}</div>
                </template>
              </v-switch>
            </div>
          </div>

          <!-- Divider -->
          <v-divider class="alert-divider"></v-divider>

          <!-- Unauthorized Exit Alert -->
          <div class="alert-item" :class="{ 'active': unauthorizedExitEnabled }">
            <div class="alert-item-info">
              <v-icon color="primary" class="alert-item-icon">
                mdi-exit-run
              </v-icon>
              <div class="alert-item-content">
                <div class="alert-item-title">{{ t('unauthorized_exit_alert') }}</div>
                <div class="alert-item-desc">{{ t('unauthorized_exit_alert_desc') || 'Alerts when an item is removed without proper authorization.' }}</div>
              </div>
            </div>
            <div class="alert-item-action">
              <v-switch
                v-model="unauthorizedExitEnabled"
                color="success"
                hide-details
                inset
              >
                <template v-slot:append>
                  <div class="switch-status">{{ unauthorizedExitEnabled ? t('enabled') || 'Enabled' : t('disabled') || 'Disabled' }}</div>
                </template>
              </v-switch>
            </div>
          </div>

          <!-- Temperature alerts section (commented out in original code) -->
          <!--
          <v-divider class="alert-divider"></v-divider>
          
          <div class="alert-box-header mt-6">
            <v-icon color="orange-darken-2" class="me-2">mdi-thermometer</v-icon>
            <span>{{ t('temperature_alerts') || 'Temperature Alerts' }}</span>
          </div>
          
          <div class="alert-item" :class="{ 'active': lowAlertEnabled }">
            <div class="alert-item-info">
              <v-icon color="blue" class="alert-item-icon">
                mdi-thermometer-low
              </v-icon>
              <div class="alert-item-content">
                <div class="alert-item-title">{{ t('lowTempAlert') }}</div>
                <div class="alert-item-desc">{{ t('lowTempAlert_desc') || 'Alerts when temperature falls below the minimum threshold.' }}</div>
              </div>
            </div>
            <div class="alert-item-action">
              <v-switch
                v-model="lowAlertEnabled"
                color="success"
                hide-details
                inset
              >
                <template v-slot:append>
                  <div class="switch-status">{{ lowAlertEnabled ? t('enabled') || 'Enabled' : t('disabled') || 'Disabled' }}</div>
                </template>
              </v-switch>
            </div>
          </div>

          <v-divider class="alert-divider"></v-divider>

          <div class="alert-item" :class="{ 'active': highAlertEnabled }">
            <div class="alert-item-info">
              <v-icon color="red" class="alert-item-icon">
                mdi-thermometer-high
              </v-icon>
              <div class="alert-item-content">
                <div class="alert-item-title">{{ t('highTempAlert') }}</div>
                <div class="alert-item-desc">{{ t('highTempAlert_desc') || 'Alerts when temperature rises above the maximum threshold.' }}</div>
              </div>
            </div>
            <div class="alert-item-action">
              <v-switch
                v-model="highAlertEnabled"
                color="success"
                hide-details
                inset
              >
                <template v-slot:append>
                  <div class="switch-status">{{ highAlertEnabled ? t('enabled') || 'Enabled' : t('disabled') || 'Disabled' }}</div>
                </template>
              </v-switch>
            </div>
          </div>
          -->
        </v-sheet>

        <!-- Save Button Container -->
        <div class="save-button-container">
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="loading"
            size="large"
            @click="saveSettings"
            prepend-icon="mdi-content-save-outline"
            rounded
            elevation="2"
            class="save-button"
          >
            {{ t('saveSettings') || 'Save Settings' }}
          </v-btn>
        </div>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/axiostoastapi.js";
import { showSuccess, showError } from '@/utils/snackbar';

const { t } = useI18n();
const unauthorizedEnterEnabled = ref(false);
const unauthorizedExitEnabled = ref(false);
const lowAlertEnabled = ref(false);
const highAlertEnabled = ref(false);
const loading = ref(false);

// Fetch initial settings
const fetchGlobalAlertSettings = async () => {
  try {
    const response = await api.get("/api/global_alert");
    const settings = response.data;

    // Handle case where data might be null
    if (settings) {
      unauthorizedExitEnabled.value = settings.alertUnauthorizedExit === "ON";
      unauthorizedEnterEnabled.value = settings.alertUnauthorizedEnter === "ON";
      lowAlertEnabled.value = settings.alertTemperatureLow === "ON";
      highAlertEnabled.value = settings.alertTemperatureHigh === "ON";
    }
  } catch (error) {
    showError(t('failedToLoadSettings'));
    console.error("Error fetching settings:", error);
  }
};

// Save settings
const updateSettings = async () => {
  loading.value = true;
  const payload = {
    alertUnauthorizedExit: unauthorizedExitEnabled.value ? "ON" : "OFF",
    alertUnauthorizedEnter: unauthorizedEnterEnabled.value ? "ON" : "OFF",
    alertTemperatureLow: lowAlertEnabled.value ? "ON" : "OFF",
    alertTemperatureHigh: highAlertEnabled.value ? "ON" : "OFF",
  };

  try {
    await api.put("/api/global_alert", payload);
    showSuccess(t('settingsSavedSuccessfully'));
  } catch (error) {
    showError(t('failedToSaveSettings'));
    console.error("Error saving settings:", error);
  } finally {
    loading.value = false;
  }
};

// Save global alert settings (POST)
const saveSettings = async () => {
  loading.value = true;

  const payload = {
    alertUnauthorizedExit: unauthorizedExitEnabled.value ? "ON" : "OFF",
    alertUnauthorizedEnter: unauthorizedEnterEnabled.value ? "ON" : "OFF",
    alertTemperatureLow: lowAlertEnabled.value ? "ON" : "OFF",
    alertTemperatureHigh: highAlertEnabled.value ? "ON" : "OFF",
  };

  console.log(payload);
  try {
    await api.post("/api/global_alert", payload);
    showSuccess(t('settingsSavedSuccessfully'));
  } catch (error) {
    showError(t('failedToSaveSettings'));
    console.error("Error saving settings:", error);
  } finally {
    loading.value = false;
  }
};

// Fetch settings on component mount
onMounted(() => {
  fetchGlobalAlertSettings();
});
</script>

<style scoped>
.alert-settings {
  background-color: transparent;
  box-shadow: none;
}

/* Header styling */
.alert-header {
  margin-bottom: 32px;
  text-align: center;
}

.alert-title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.alert-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1976d2;
  margin: 0 0 0 12px;
}

.alert-subtitle {
  color: #607d8b;
  font-size: 1rem;
  font-weight: 400;
}

.alert-icon {
  margin-right: 8px;
}

/* Alert box styling */
.alert-box {
  border-radius: 12px;
  background-color: white;
  overflow: hidden;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  position: relative;
}

.alert-box-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background-color: #1f1c1c;
  font-size: 1.1rem;
  font-weight: 500;
  color: #f1f6f8;
  border-bottom: 1px solid #e0e0e0;
}

/* Alert item styling */
.alert-item {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.alert-item.active {
  background-color: #f5f9ff;
}

.alert-item-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.alert-item-icon {
  margin-right: 16px;
  margin-top: 2px;
}

.alert-item-content {
  display: flex;
  flex-direction: column;
}

.alert-item-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #263238;
  margin-bottom: 4px;
}

.alert-item-desc {
  font-size: 0.9rem;
  color: #78909c;
  line-height: 1.4;
}

.alert-item-action {
  display: flex;
  align-items: center;
}

.switch-status {
  margin-left: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 64px;
}

.alert-divider {
  margin: 0 24px;
}

/* Save button styling */
.save-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.save-button {
  font-weight: 500;
  padding: 0 32px;
  letter-spacing: 0.5px;
  text-transform: none;
}

/* Animation for the bell icon */
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive styles */
@media (max-width: 768px) {
  .alert-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .alert-item-action {
    margin-top: 16px;
    align-self: flex-start;
  }
  
  .alert-title {
    font-size: 1.7rem;
  }
  
  .alert-item-title {
    font-size: 1rem;
  }
  
  .alert-box-header {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .alert-title-container {
    flex-direction: column;
  }
  
  .alert-title {
    margin: 8px 0 0 0;
    font-size: 1.5rem;
  }
  
  .alert-subtitle {
    font-size: 0.9rem;
  }
  
  .save-button-container {
    justify-content: center;
  }
  
  .alert-item-info {
    flex-direction: column;
  }
  
  .alert-item-icon {
    margin-bottom: 8px;
  }
}
</style>