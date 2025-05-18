<template>
  <v-card class="alert-settings" flat>
    <v-card-text>
      <v-container>
        <!-- Title with Icon -->
        <div class="alert-header">
          <div class="alert-title-container">
            <v-icon size="x-large" color="deep-orange-darken-1" class="alert-icon">mdi-thermometer-high</v-icon>
            <h2 class="alert-title">{{ t('temperatureAlertManagement') }}</h2>
          </div>
          <div class="alert-subtitle">
            {{ t('temperatureAlertManagement_desc') || 'Configure temperature thresholds and alerts for your system' }}
          </div>
        </div>

        <!-- Temperature Alert Settings Container -->
        <v-sheet class="alert-box" rounded elevation="2">
          <div class="alert-box-header">
            <v-icon color="deep-orange-darken-1" class="me-2">mdi-bell-alert-outline</v-icon>
            <span>{{ t('temperature_alert_settings') || 'Temperature Alert Notifications' }}</span>
          </div>
          
          <!-- Low Temperature Alert -->
          <div class="alert-item" :class="{ 'active': lowAlertEnabled }">
            <div class="alert-item-info">
              <v-icon color="blue-darken-1" class="alert-item-icon">
                mdi-thermometer-low
              </v-icon>
              <div class="alert-item-content">
                <div class="alert-item-title">{{ t('lowTempAlert') }}</div>
                <div class="alert-item-desc">{{ t('lowTempAlert_desc') || 'Trigger an alert when temperature falls below the minimum threshold.' }}</div>
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

          <!-- Divider -->
          <v-divider class="alert-divider"></v-divider>

          <!-- High Temperature Alert -->
          <div class="alert-item" :class="{ 'active': highAlertEnabled }">
            <div class="alert-item-info">
              <v-icon color="red-darken-1" class="alert-item-icon">
                mdi-thermometer-high
              </v-icon>
              <div class="alert-item-content">
                <div class="alert-item-title">{{ t('highTempAlert') }}</div>
                <div class="alert-item-desc">{{ t('highTempAlert_desc') || 'Trigger an alert when temperature rises above the maximum threshold.' }}</div>
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
        </v-sheet>

        <!-- Temperature Range Settings Container -->
        <v-sheet class="alert-box mt-6" rounded elevation="2">
          <div class="alert-box-header">
            <v-icon color="primary" class="me-2">mdi-thermometer</v-icon>
            <span>{{ t('temperatureRange') || 'Temperature Thresholds' }}</span>
          </div>
          
          <div class="range-container">
            <!-- Current values display -->
            <div class="current-values">
              <div class="low-value">
                <v-icon color="blue-darken-1" size="small">mdi-arrow-down</v-icon>
                <span class="temp-value">{{ tempRange[0].toFixed(1) }}°C</span>
                <span class="temp-label">{{ t('low_threshold') || 'Low Threshold' }}</span>
              </div>
              <div class="high-value">
                <v-icon color="red-darken-1" size="small">mdi-arrow-up</v-icon>
                <span class="temp-value">{{ tempRange[1].toFixed(1) }}°C</span>
                <span class="temp-label">{{ t('high_threshold') || 'High Threshold' }}</span>
              </div>
            </div>
            
            <!-- Temperature Range Slider -->
            <div class="slider-container">
              <v-range-slider
                v-model="tempRange"
                :min="-10"
                :max="110"
                :step="0.1"
                :rules="rangeRules"
                thumb-label="always"
                thumb-size="24"
                class="mt-4 gradient-slider custom-range-slider"
                track-color="transparent"
                :color="['blue-darken-1', 'red-darken-1']"
                show-ticks="always"
              >
                <template v-slot:thumb-label="{ modelValue, index }">
                  <div class="thumb-label-custom" :class="index === 0 ? 'low-thumb-label' : 'high-thumb-label'">
                    {{ modelValue.toFixed(1) }}°C
                  </div>
                </template>
              </v-range-slider>

              <!-- Custom Thumb Displays -->
              <div class="custom-thumbs">
                <div 
                  class="custom-thumb low-thumb" 
                  :style="{ left: `calc(${((tempRange[0] + 10) / 120) * 100}% - 18px)` }"
                >
                  <div class="thumb-value">{{ tempRange[0].toFixed(1) }}°C</div>
                </div>
                <div 
                  class="custom-thumb high-thumb" 
                  :style="{ left: `calc(${((tempRange[1] + 10) / 120) * 100}% - 18px)` }"
                >
                  <div class="thumb-value">{{ tempRange[1].toFixed(1) }}°C</div>
                </div>
              </div>

              <!-- Scale Markers -->
              <div class="scale-container">
                <div class="scale-line"></div>
                <div class="scale-markers">
                  <div class="scale-point" v-for="temp in scalePoints" :key="temp" :style="{ left: `${((temp + 10) / 120) * 100}%` }">
                    <div class="marker-line"></div>
                    <div class="marker-label">{{ temp }}°C</div>
                  </div>
                </div>
              </div>

              <!-- Temperature zones visualization -->
              <div class="temp-zones">
                <div class="cold-zone" :style="{ width: `${((tempRange[0] + 10) / 120) * 100}%` }">
                  <div class="zone-gradient cold-gradient"></div>
                </div>
                <div class="normal-zone" :style="{ 
                  left: `${((tempRange[0] + 10) / 120) * 100}%`,
                  width: `${((tempRange[1] - tempRange[0]) / 120) * 100}%` 
                }">
                  <div class="zone-gradient normal-gradient"></div>
                </div>
                <div class="hot-zone" :style="{ 
                  left: `${((tempRange[1] + 10) / 120) * 100}%`,
                  width: `${((110 - tempRange[1]) / 120) * 100}%` 
                }">
                  <div class="zone-gradient hot-gradient"></div>
                </div>
              </div>
            </div>
          </div>
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
            {{ t('saveSettings') || 'บันทึกการตั้งค่า' }}
          </v-btn>
        </div>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/axiostoastapi.js";
import { useI18n } from "vue-i18n";
import { showSuccess, showError } from '@/utils/snackbar';

const { t } = useI18n();
// State
const tempRange = ref([19.2, 40.1]);
const lowAlertEnabled = ref(false);
const highAlertEnabled = ref(false);
const loading = ref(false);

// Scale points for markers
const scalePoints = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

// Validation rules
const rangeRules = [
  (value) => value[0] < value[1] || t('lowTempMustBeLessThanHigh'),
];

// Fetch initial settings
const fetchSettings = async () => {
  try {
    const response = await api.get("/api/temperature-threshold");
    const settings = response.data;
    tempRange.value = [
      Number(settings.lowAlert),
      Number(settings.highAlert),
    ];
    lowAlertEnabled.value = settings.alertTemperatureLow === "ON";
    highAlertEnabled.value = settings.alertTemperatureHigh === "ON";
  } catch (error) {
    showError(t('failedToLoadSettings'));
    console.error("Error fetching settings:", error);
  }
};

// Save settings
const updateSettings = async () => {
  loading.value = true;
  const payload = {
    lowAlert: tempRange.value[0],
    highAlert: tempRange.value[1],
    alertTemperatureLow: lowAlertEnabled.value ? "ON" : "OFF",
    alertTemperatureHigh: highAlertEnabled.value ? "ON" : "OFF",
  };

  try {
    await api.put("/api/temperature-threshold", payload);
    showSuccess(t('settingsSavedSuccessfully'));
  } catch (error) {
    showError(t('failedToSaveSettings'));
    console.error("Error saving settings:", error);
  } finally {
    loading.value = false;
  }
};

// Save temperature threshold settings (POST)
const saveSettings = async () => {
  loading.value = true;

  const payload = {
    lowAlert: tempRange.value[0],
    highAlert: tempRange.value[1],
    alertTemperatureLow: lowAlertEnabled.value ? "ON" : "OFF",
    alertTemperatureHigh: highAlertEnabled.value ? "ON" : "OFF",
  };

  try {
    await api.post("/api/temperature-threshold", payload);
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
  fetchSettings();
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
  color: #f4511e;
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
  margin-bottom: 24px;
  position: relative;
}

.alert-box-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background-color: #f5f5f5;
  font-size: 1.1rem;
  font-weight: 500;
  color: #455a64;
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

/* Temperature range styling */
.range-container {
  padding: 0 24px 24px;
}

.current-values {
  display: flex;
  justify-content: space-between;
  margin: 24px 0;
  padding: 0 24px;
}

.low-value, .high-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f9ff;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid #e3f2fd;
}

.high-value {
  background-color: #fff5f5;
  border: 1px solid #ffebee;
}

.temp-value {
  font-size: 1.6rem;
  font-weight: 600;
  margin: 8px 0;
}

.low-value .temp-value {
  color: #1976d2;
}

.high-value .temp-value {
  color: #d32f2f;
}

.temp-label {
  font-size: 0.8rem;
  color: #78909c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slider-container {
  position: relative;
  padding: 24px 12px 48px;
  margin-top: 16px;
}

/* Gradient slider custom styling */
.gradient-slider {
  margin-bottom: 32px;
}

:deep(.v-slider-thumb) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.v-slider-thumb__label) {
  background-color: #1976d2;
  font-weight: 600;
  font-size: 14px;
  color: white;
  z-index: 10;
}

/* ปรับปรุง label ที่แสดงค่าอุณหภูมิให้ชัดเจนขึ้น */
:deep(.v-slider-thumb__label) {
  transform: translateY(-10px) !important;
  background-color: #1976d2;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px !important;
  height: 30px !important;
  border-radius: 4px !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

:deep(.v-slider-thumb__label::before) {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #1976d2;
}

/* แก้ไขให้ Thumb สีแตกต่างกันตามค่าอุณหภูมิ */
:deep(.v-slider-track__background) {
  height: 6px !important;
  opacity: 0.5;
}

:deep(.v-slider-track__fill) {
  background-color: transparent !important;
}

/* Scale markers styling */
.scale-container {
  position: relative;
  height: 40px;
  margin-top: 8px;
}

.scale-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e0e0e0;
}

.scale-markers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
}

.scale-point {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
}

.marker-line {
  width: 1px;
  height: 6px;
  background-color: #9e9e9e;
  margin: 0 auto;
}

.marker-label {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #616161;
  text-align: center;
  white-space: nowrap;
}

/* แก้ไขตัวเลขบนสไลเดอร์ให้ชัดเจน */
.slider-label {
  font-weight: 600;
  font-size: 14px;
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.low-label {
  color: white;
  background-color: #1976d2;
}

.high-label {
  color: white;
  background-color: #d32f2f;
}

/* Custom Range Slider Styling */
.custom-range-slider {
  z-index: 1;
}

:deep(.v-slider-thumb) {
  z-index: 5;
}

:deep(.v-slider-thumb--focused) {
  box-shadow: 0 0 0 8px rgba(25, 118, 210, 0.1);
}

:deep(.v-slider-thumb__surface) {
  border: 2px solid white;
}

:deep(.v-slider-thumb__label) {
  display: none !important;
}

/* Custom Thumb Display */
.custom-thumbs {
  position: relative;
  height: 0;
  z-index: 2;
}

.custom-thumb {
  position: absolute;
  top: -44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: left 0.3s ease;
}

.thumb-value {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
  position: relative;
  white-space: nowrap;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.thumb-value::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
}

.low-thumb .thumb-value {
  background-color: #1976d2;
}

.low-thumb .thumb-value::after {
  border-top: 5px solid #1976d2;
}

.high-thumb .thumb-value {
  background-color: #d32f2f;
}

.high-thumb .thumb-value::after {
  border-top: 5px solid #d32f2f;
}

/* Custom Thumb Label */
.thumb-label-custom {
  color: white;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  font-size: 12px;
}

.low-thumb-label {
  background-color: #1976d2;
}

.high-thumb-label {
  background-color: #d32f2f;
}

/* Temperature zones visualization */
.temp-zones {
  position: absolute;
  top: 24px;
  left: 12px;
  right: 12px;
  height: 6px;
  z-index: 0;
}

.cold-zone, .normal-zone, .hot-zone {
  position: absolute;
  top: 0;
  height: 6px;
  overflow: hidden;
}

.zone-gradient {
  width: 100%;
  height: 100%;
}

.cold-gradient {
  background: linear-gradient(to right, #2196f3, #90caf9);
}

.normal-gradient {
  background: linear-gradient(to right, #4caf50, #8bc34a);
}

.hot-gradient {
  background: linear-gradient(to right, #ff9800, #f44336);
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
  
  .current-values {
    flex-direction: column;
    gap: 16px;
  }
  
  .low-value, .high-value {
    width: 100%;
  }
  
  .scale-point:nth-child(odd) {
    display: none;
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
  
  .temp-value {
    font-size: 1.4rem;
  }
  
  .scale-point:nth-child(4n+1) {
    display: block;
  }
  
  .scale-point:not(:nth-child(4n+1)) {
    display: none;
  }
}
</style>