<template>
  <!-- หัวข้อหลักของทุกหน้า - Main header component -->
  <div class="header-common">
    <!-- ส่วนซ้าย - Left section with logo and title -->
    <div class="header-left">
      <div class="logo-container">
        <!-- สามารถเพิ่มโลโก้ตรงนี้ - You can add a logo here -->
        <v-icon icon="mdi-cube-outline" size="24" class="logo-icon"></v-icon>
      </div>
      <h1 class="header-title">{{ title }}</h1>
    </div>

    <!-- ส่วนขวา - Right section with user controls -->
    <div class="header-right">
      <!-- ปุ่มเปลี่ยนภาษา - Language toggle button -->
      <v-btn
        class="language-btn"
        variant="tonal"
        rounded="lg"
        density="comfortable"
        @click="toggleLanguage"
      >
        {{ currentLanguage }}
      </v-btn>

      <!-- ข้อมูลผู้ใช้ - User information -->
      <div class="user-info-container">
        <v-icon
          icon="mdi-account-circle"
          size="small"
          class="user-icon"
        ></v-icon>
        <span class="user-info"
          >{{ username }} <span class="user-role">{{ roles }}</span></span
        >
      </div>

      <!-- เวลาปัจจุบัน - Current date and time -->
      <div class="date-time-container">
        <v-icon
          icon="mdi-clock-outline"
          size="small"
          class="clock-icon"
        ></v-icon>
        <span class="date-time">{{ currentDateTime }}</span>
      </div>

      <!-- เวลาที่เหลือของโทเค็น - Token time remaining -->
      <div
        v-if="countdownText"
        class="token-container"
        :class="{ warning: timeRemaining <= 120, normal: timeRemaining > 120 }"
      >
        <v-icon
          icon="mdi-timer-outline"
          size="small"
          class="timer-icon"
        ></v-icon>
        <span class="token-warning">{{ countdownText }}</span>
      </div>

      <!-- สถานะการเชื่อมต่อ - Connection status -->
      <div
        class="status-container"
        :class="{
          connected: appStatus === 'Connected',
          disconnected: appStatus === 'Disconnected',
        }"
      >
        <span class="status-dot"></span>
        <span class="status-text">{{ appStatus }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTokenStore } from "@/stores/token";
import api from "@/axiostoastapi.js";

// ตั้งค่าภาษาและโทเค็น - Setup i18n and token store
const { locale, t } = useI18n();
const tokenStore = useTokenStore();
const username = tokenStore.getUsername();
const roles = tokenStore.getRoles();

// สร้างตัวแปรสำหรับเวลาปัจจุบัน - Create reactive reference for current date/time
const currentDateTime = ref(new Date().toLocaleString());
let clockInterval = null;

// อัปเดตเวลาทุกวินาที - Update clock every second
const startClock = () => {
  clockInterval = setInterval(() => {
    currentDateTime.value = new Date().toLocaleString();
  }, 1000);
};

// ตั้งค่า props สำหรับชื่อหัวข้อ - Setup props for header title
const props = defineProps({
  title: {
    type: String,
    default: "Supply Management",
  },
});

// ตั้งค่าภาษาปัจจุบัน - Set current language display
const currentLanguage = ref(
  localStorage.getItem("language") === "th" ? "ไทย" : "EN"
);

// สถานะการเชื่อมต่อแอป - Application connection status
const appStatus = ref("Disconnected");
const pollingInterval = ref(null);

// ฟังก์ชันเรียกสถานะจาก backend - Function to fetch connection status
const fetchAppStatus = async () => {
  try {
    const response = await api.get("/api/gateway/status");
    appStatus.value = response.data.status;
  } catch (error) {
    console.error("Error fetching app status:", error);
    appStatus.value = "Disconnected";
  }
};

// เริ่มการเรียกข้อมูลสถานะทุก 5 วินาที - Start polling every 5 seconds
const startPolling = () => {
  fetchAppStatus(); // Initial call
  pollingInterval.value = setInterval(fetchAppStatus, 5000);
};

// ฟังก์ชันเปลี่ยนภาษา - Function to toggle language
function toggleLanguage() {
  if (locale.value === "en") {
    locale.value = "th";
    currentLanguage.value = "ไทย";
    localStorage.setItem("language", "th");
  } else {
    locale.value = "en";
    currentLanguage.value = "EN";
    localStorage.setItem("language", "en");
  }
}

// ตัวแปรสำหรับการแจ้งเตือนโทเค็นหมดอายุ - Variables for token expiry warning
const timeRemaining = ref(0);
const countdownText = ref("");
let countdownInterval = null;
const showExpiryWarning = ref(false);

// จัดการเหตุการณ์แจ้งเตือนโทเค็นหมดอายุ - Handle token expiry warning event
function handleTokenExpiryWarning() {
  showExpiryWarning.value = true;
}

// เริ่มการนับถอยหลังโทเค็น - Start token countdown
function startTokenCountdown() {
  const token = tokenStore.getApiToken();
  if (!token) return;

  const payload = tokenStore.decodeJwt(token);
  if (!payload?.exp) return;

  const now = Math.floor(Date.now() / 1000);
  timeRemaining.value = payload.exp - now;

  updateCountdownText(); // initial update

  countdownInterval = setInterval(() => {
    timeRemaining.value--;
    updateCountdownText();

    // Log สำหรับการดีบัก - Debug log
    console.log("[Countdown]", timeRemaining.value, "seconds remaining");

    if (timeRemaining.value <= 0) {
      clearInterval(countdownInterval);
      countdownText.value = "";
    }
  }, 1000);
}

// อัปเดตข้อความนับถอยหลัง - Update countdown text
function updateCountdownText() {
  const minutes = Math.floor(timeRemaining.value / 60);
  const seconds = timeRemaining.value % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  countdownText.value = t("token_expiry_warning_countdown", {
    time: timeFormatted,
  });
}

// ติดตั้ง event listener เมื่อคอมโพเนนต์ถูกสร้าง - Add event listener on mount
onMounted(() => {
  window.addEventListener("token-expiry-warning", handleTokenExpiryWarning);
});

// ลบ event listener เมื่อคอมโพเนนต์ถูกทำลาย - Remove event listener on unmount
onUnmounted(() => {
  window.removeEventListener("token-expiry-warning", handleTokenExpiryWarning);
});

// เริ่มต้นคอมโพเนนต์ - Component initialization
onMounted(() => {
  locale.value = localStorage.getItem("language") || "en";
  startPolling();
  startClock();
  startTokenCountdown();
});

// หยุดการทำงานเมื่อคอมโพเนนต์ถูกทำลาย - Cleanup on component unmount
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
  if (clockInterval) clearInterval(clockInterval);
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<style scoped>
/* สไตล์โดยรวมของส่วนหัว - Overall header styling */
.header-common {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 24px;
  background: linear-gradient(135deg, #04101d 50%, #0d47a1 100%) !important;
  border-bottom: 1px solid #0d47a1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  height: 60px;
  color: white;
}

/* ส่วนซ้ายที่มีโลโก้และชื่อ - Left section with logo and title */
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* คอนเทนเนอร์สำหรับโลโก้ - Logo container */
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 8px;
}

/* ไอคอนโลโก้ - Logo icon */
.logo-icon {
  color: #1976d2;
}

/* สไตล์ของชื่อหัวข้อ - Header title styling */
.header-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
  letter-spacing: -0.3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* ส่วนขวาที่มีตัวควบคุมต่างๆ - Right section with controls */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ปุ่มเปลี่ยนภาษา - Language toggle button */
.language-btn {
  font-size: 14px;
  min-width: 40px;
  height: 32px;
  font-weight: 500;
  color: #1976d2;
  background-color: white;
  transition: all 0.2s ease;
  text-transform: none;
  padding: 0 12px;
  border: none;
}

.language-btn:hover {
  background-color: #f5f5f5;
}

/* คอนเทนเนอร์สำหรับข้อมูลผู้ใช้ - User info container */
.user-info-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* ไอคอนผู้ใช้ - User icon */
.user-icon {
  color: white;
}

/* ข้อมูลผู้ใช้ - User information */
.user-info {
  font-size: 14px;
  color: white;
  font-weight: 500;
}

/* บทบาทของผู้ใช้ - User role */
.user-role {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 4px;
}

/* คอนเทนเนอร์สำหรับวันที่และเวลา - Date time container */
.date-time-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* ไอคอนนาฬิกา - Clock icon */
.clock-icon {
  color: white;
}

/* การแสดงวันที่และเวลา - Date time display */
.date-time {
  font-size: 14px;
  color: white;
  white-space: nowrap;
}

/* คอนเทนเนอร์สำหรับโทเค็น - Token container */
.token-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* สถานะปกติของโทเค็น - Normal token status */
.token-container.normal {
  background-color: rgba(46, 125, 50, 0.2);
  border: 1px solid rgba(46, 125, 50, 0.3);
}

/* สถานะเตือนของโทเค็น - Warning token status */
.token-container.warning {
  background-color: rgba(198, 40, 40, 0.2);
  border: 1px solid rgba(198, 40, 40, 0.3);
  animation: pulse 2s infinite;
}

/* ไอคอนจับเวลา - Timer icon */
.timer-icon {
  color: white;
}

/* ข้อความเตือนโทเค็น - Token warning text */
.token-warning {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

/* คอนเทนเนอร์สำหรับสถานะ - Status container */
.status-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: rgba(198, 40, 40, 0.2);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(198, 40, 40, 0.3);
  transition: background-color 0.3s ease;
}

/* สถานะเชื่อมต่อ - Connected status */
.status-container.connected {
  background-color: rgba(46, 125, 50, 0.2);
  border: 1px solid rgba(46, 125, 50, 0.3);
}

/* สถานะไม่เชื่อมต่อ - Disconnected status */
.status-container.disconnected {
  background-color: rgba(198, 40, 40, 0.2);
  border: 1px solid rgba(198, 40, 40, 0.3);
}

/* จุดแสดงสถานะ - Status dot */
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  animation: blink 2s infinite;
}

.status-container.connected .status-dot {
  background-color: #4caf50;
  box-shadow: 0 0 5px #4caf50;
}

.status-container.disconnected .status-dot {
  background-color: #f44336;
  box-shadow: 0 0 5px #f44336;
}

/* ข้อความสถานะ - Status text */
.status-text {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

/* แอนิเมชันสำหรับกระพริบ - Animation for blinking */
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

/* แอนิเมชันสำหรับเต้นเมื่อใกล้หมดเวลา - Animation for pulsing when time is low */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

/* การปรับแต่งสำหรับอุปกรณ์เคลื่อนที่ - Responsive adjustments for mobile */
@media (max-width: 991px) {
  .header-right {
    gap: 8px;
  }
  
  .date-time-container {
    display: none;
  }
  
  .token-container {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-common {
    padding: 8px 12px;
    height: auto;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .header-left {
    order: 1;
    flex: 1;
    min-width: 100px;
  }
  
  .header-title {
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }
  
  .header-right {
    order: 2;
    justify-content: flex-end;
    flex: 1;
  }
  
  .user-info-container {
    padding: 4px 8px;
  }
  
  .user-info {
    font-size: 12px;
  }
  
  .user-role {
    display: none;
  }
  
  .status-container {
    padding: 4px 8px;
  }
  
  .status-text {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .header-common {
    padding: 6px 10px;
  }
  
  .logo-container {
    width: 32px;
    height: 32px;
  }
  
  .header-title {
    max-width: 90px;
    font-size: 14px;
  }
  
  .language-btn {
    min-width: 36px;
    height: 28px;
    font-size: 12px;
    padding: 0 8px;
  }
  
  .user-info-container {
    max-width: 80px;
    overflow: hidden;
  }
}
</style>