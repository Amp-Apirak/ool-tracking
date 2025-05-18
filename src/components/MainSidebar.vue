<template>
  <div class="sidebar-container">
    <!-- ปุ่มแฮมเบอร์เกอร์สำหรับมือถือ -->
    <div
      class="mobile-toggle-btn"
      @click="toggleSidebar"
      v-if="isSidebarCollapsed && isSmallScreen"
    >
      <v-icon>mdi-menu</v-icon>
    </div>

    <!-- เมนูด้านข้างแบบปรับปรุง -->
    <div class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="sidebar-inner">
        <!-- ปุ่มสำหรับย่อ/ขยายเมนู -->
        <div class="toggle-btn" @click="toggleSidebar">
          <v-icon>{{
            isSidebarCollapsed ? "mdi-chevron-right" : "mdi-chevron-left"
          }}</v-icon>
        </div>

        <!-- ส่วนโลโก้ด้านบนของเมนู -->
        <div class="logo-container">
          <img
            src="@/assets/Black _ White Letter MD Logo Instagram Post.png"
            alt="ระบบติดตามพัสดุ"
            class="logo"
          />
        </div>

        <!-- ส่วนของผู้ใช้งาน -->
        <div class="user-profile" v-if="!isSidebarCollapsed">
          <div class="user-avatar">
            <v-icon size="32">mdi-account-circle</v-icon>
          </div>
          <div class="user-info">
            <div class="user-name">
              {{ userProfile?.firstName || "ผู้ใช้งาน" }}
            </div>
            <div class="user-role">
              {{ userProfile?.position?.title || "เจ้าหน้าที่" }}
            </div>
          </div>
        </div>
        <div class="user-profile collapsed-profile" v-else>
          <div class="user-avatar">
            <v-icon size="32">mdi-account-circle</v-icon>
          </div>
        </div>

        <!-- เส้นคั่นระหว่างส่วน -->
        <div class="divider"></div>

        <!-- หัวข้อเมนูหลัก -->
        <div class="menu-section">
          <div class="menu-section-title" v-if="!isSidebarCollapsed">
            {{ t("main_menu") || "MAIN_MENU" }}
          </div>

          <ul class="menu-list">
            <li
              v-for="item in mainMenuItems"
              :key="item.title"
              class="menu-item"
              :class="{ active: isActive(item), collapsed: isSidebarCollapsed }"
              @click="navigate(item)"
            >
              <div class="menu-item-content">
                <v-icon
                  class="menu-icon"
                  :color="isActive(item) ? 'primary' : ''"
                  >{{ item.icon }}</v-icon
                >
                <span class="menu-title" v-if="!isSidebarCollapsed">{{
                  item.title
                }}</span>
              </div>
              <div
                v-if="!isSidebarCollapsed && isActive(item)"
                class="active-indicator-container"
              >
                <span class="active-dot"></span>
                <v-icon class="active-indicator" color="primary"
                  >mdi-chevron-right</v-icon
                >
              </div>
            </li>
          </ul>
        </div>

        <!-- ส่วนล่างของเมนู -->
        <div class="bottom-section">
          <!-- เมนูออกจากระบบ -->
          <ul class="menu-list">
            <li
              class="menu-item logout-item"
              :class="{ collapsed: isSidebarCollapsed }"
              @click="triggerLogout"
            >
              <div class="menu-item-content">
                <v-icon class="menu-icon">mdi-logout</v-icon>
                <span class="menu-title" v-if="!isSidebarCollapsed">{{
                  t("logout") || "Logout"
                }}</span>
              </div>
            </li>
          </ul>

          <!-- ส่วนแสดงเวอร์ชัน -->
          <div
            class="version-container"
            :class="{ 'collapsed-version': isSidebarCollapsed }"
          >
            <span v-if="!isSidebarCollapsed"
              >{{ t("version") || "version" }}: {{ version }}</span
            >
            <span v-else>v{{ version.split(".")[1] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ส่วนเนื้อหาหลัก -->
    <div class="main-content" :class="{ expanded: isSidebarCollapsed }">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { computed, ref, onMounted, watch, onBeforeUnmount } from "vue";
import { handleLogout, handleSSOLogout } from "@/auth";
import { useI18n } from "vue-i18n";
import { hasOrganizationAccess } from "@/utils/permissions";
import { MenuName } from "@/constants/menuName";
import { useUserMenusStore } from "@/stores/useUserMenusStore";
import { useTokenStore } from "@/stores/token";

export default {
  name: "MainSidebar",
  setup() {
    const { t } = useI18n();
    const version = import.meta.env.VITE_VERSION;
    const router = useRouter();
    const hoveredItem = ref(null);
    const isSidebarCollapsed = ref(false);
    const isSmallScreen = ref(false);
    const BASE_PATH = import.meta.env.VITE_APP_BASE_PATH || "/";
    const menuStore = useUserMenusStore();
    const tokenStore = useTokenStore();

    // ดึงข้อมูลผู้ใช้
    const userProfile = computed(() => {
      return tokenStore.getUserProfile();
    });

    // กำหนดรายการเมนูหลัก
    const rawMenuItems = [
      {
        route: MenuName.DASHBOARD,
        icon: "mdi-view-dashboard",
        visible: true,
        titleKey: "overview_report",
      },
      {
        route: MenuName.REGISTER_RFID_TAGS,
        icon: "mdi-tag-multiple",
        visible: hasOrganizationAccess(),
        titleKey: "register_equipment_code",
      },
      {
        route: MenuName.REGISTER_READER,
        icon: "mdi-devices",
        visible: hasOrganizationAccess(),
        titleKey: "register_network_devices",
      },
      {
        route: MenuName.MANAGE_SUPPLIES,
        icon: "mdi-archive",
        visible: true,
        titleKey: "supply_management",
      },
      {
        route: MenuName.ALERT_SUMMARY,
        icon: "mdi-bell-ring-outline",
        visible: true,
        titleKey: "alert_summary_page",
      },
      {
        route: MenuName.ORGANIZATION,
        icon: "mdi-office-building",
        visible: hasOrganizationAccess(),
        titleKey: "organization_page",
      },
      {
        route: MenuName.USER_MANAGEMENT,
        icon: "mdi-account-group",
        visible: hasOrganizationAccess(),
        titleKey: "user_page",
      },
      {
        route: MenuName.SETTINGS,
        icon: "mdi-cog",
        visible: hasOrganizationAccess(),
        titleKey: "settings",
      },
    ];

    // กรองเมนูตามสิทธิ์การเข้าถึง
    const mainMenuItems = computed(() =>
      rawMenuItems
        .filter((item) => menuStore.hasMenuPermission(item.route))
        .map((item) => ({
          ...item,
          title: t(item.titleKey),
        }))
    );

    // ฟังก์ชันนำทางไปยังหน้าต่างๆ
    function navigate(item) {
      if (item.route) {
        router.push(`/main/${item.route}`).catch((err) => {
          console.error("การนำทางล้มเหลว:", err);
        });
      } else if (item.action) {
        item.action();
      }
    }

    // ตรวจสอบว่าเมนูไหนกำลังถูกเลือกอยู่
    const isActive = (item) => {
      return router.currentRoute.value.path === `/main/${item.route}`;
    };

    // ฟังก์ชันสำหรับการ hover
    function setHover(item) {
      hoveredItem.value = item;
    }

    function clearHover() {
      hoveredItem.value = null;
    }

    // ฟังก์ชันออกจากระบบ
    async function triggerLogout() {
      try {
        await handleSSOLogout(); // ใช้สำหรับ Portal Login
        // await handleLogout();  // ใช้สำหรับ Dev Login
      } catch (error) {
        console.error("การออกจากระบบล้มเหลว:", error);
        window.location.href = BASE_PATH;
      }
    }

    // ฟังก์ชันตรวจสอบขนาดหน้าจอ
    const checkScreenSize = () => {
      isSmallScreen.value = window.innerWidth <= 768;
      if (isSmallScreen.value && !isSidebarCollapsed.value) {
        isSidebarCollapsed.value = true;
        localStorage.setItem("sidebarCollapsed", "true");
      }
    };

    // ฟังก์ชันสำหรับย่อ/ขยายเมนู
    function toggleSidebar() {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
      // บันทึกสถานะการย่อ/ขยายเมนูไว้ใน localStorage
      localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.value);
    }

    // สถานะการ scroll ของหน้า
    const scrollPosition = ref(0);

    // ติดตามการ scroll ของหน้า
    const handleScroll = () => {
      scrollPosition.value = window.scrollY;
    };

    // เพิ่ม event listener สำหรับการ scroll
    onMounted(() => {
      // โหลดสถานะการย่อ/ขยายเมนูจาก localStorage
      const savedState = localStorage.getItem("sidebarCollapsed");
      if (savedState !== null) {
        isSidebarCollapsed.value = savedState === "true";
      }

      // เพิ่ม event listener สำหรับการ scroll
      window.addEventListener("scroll", handleScroll);

      // ตรวจสอบขนาดหน้าจอเมื่อโหลด
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);

      // ติดตามการเปลี่ยนเส้นทาง
      watch(
        () => router.currentRoute.value,
        () => {
          // ปิดเมนูอัตโนมัติเมื่อมีการนำทางบนอุปกรณ์มือถือ
          if (isSmallScreen.value) {
            isSidebarCollapsed.value = true;
          }
        }
      );
    });

    // ลบ event listener เมื่อ component ถูกทำลาย
    onBeforeUnmount(() => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScreenSize);
    });

    return {
      mainMenuItems,
      navigate,
      setHover,
      clearHover,
      hoveredItem,
      isActive,
      isSidebarCollapsed,
      isSmallScreen,
      toggleSidebar,
      version,
      triggerLogout,
      userProfile,
      scrollPosition,
      t,
    };
  },
};
</script>

<style scoped>
/* สไตล์สำหรับคอนเทนเนอร์หลัก */
.sidebar-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

/* ปุ่มแฮมเบอร์เกอร์สำหรับมือถือ */
.mobile-toggle-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background-color: #424242;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 0 3px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.mobile-toggle-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 0 5px rgba(255, 255, 255, 0.15);
  background-color: #4f4f4f;
}

/* สไตล์สำหรับเมนูด้านข้าง */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  background: linear-gradient(135deg, #323232 0%, #1c1c1c 100%);
  color: #fff;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100vh;
  z-index: 100;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3),
    inset 0 0 10px rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar.collapsed {
  width: 70px;
}

/* โครงสร้างภายในเมนู */
.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: inherit;
  max-width: inherit;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.sidebar-inner::-webkit-scrollbar {
  width: 4px;
}

.sidebar-inner::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-inner::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

/* ปุ่มย่อ/ขยายเมนู */
.toggle-btn {
  position: absolute;
  top: 20px;
  right: 10px;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.07);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  z-index: 2;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2),
    inset 0 0 3px rgba(255, 255, 255, 0.1);
}

.toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

/* ส่วนของโลโก้ */
.logo-container {
  padding: 25px 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.logo {
  max-width: 130px; /* เพิ่มขนาดจาก 60px เป็น 90px */
  height: auto;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 5px rgba(255, 255, 255, 0.1));
}

.sidebar.collapsed .logo {
  max-width: 60px; /* ปรับขนาดเมื่อเมนูถูกย่อ */
}

.app-title {
  margin-top: 15px;
  font-size: 18px; /* เพิ่มขนาดจาก 16px เป็น 18px */
  font-weight: 600;
  color: #fff;
  text-align: center;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* ส่วนแสดงข้อมูลผู้ใช้ */
.user-profile {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin: 15px 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 0 5px rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.user-profile:hover {
  background-color: rgba(255, 255, 255, 0.05);
  transform: translateY(-1px);
}

.collapsed-profile {
  justify-content: center;
  padding: 10px;
  align-items: center;
}

.user-avatar {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2),
    inset 0 0 5px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.3;
  max-height: 3.9em; /* สามบรรทัด (3 x 1.3) */
  display: -webkit-box;
  -webkit-line-clamp: 3; /* จำกัดการแสดงไม่เกิน 3 บรรทัด */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* เส้นคั่นในเมนู */
.divider {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  margin: 5px 15px;
}

/* ส่วนของหัวข้อหมวดหมู่ในเมนู */
.menu-section {
  flex: 1;
  overflow-y: auto;
  padding: 0 5px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.menu-section::-webkit-scrollbar {
  width: 3px;
}

.menu-section::-webkit-scrollbar-track {
  background: transparent;
}

.menu-section::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.menu-section-title {
  font-size: 11px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  padding: 5px 15px 8px;
  letter-spacing: 1px;
  font-weight: 500;
}

/* รายการเมนู */
.menu-list {
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
}

.menu-item {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  margin: 2px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  overflow: hidden;
}

.menu-item-content {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.menu-icon {
  margin-right: 12px;
  font-size: 22px;
  transition: transform 0.2s ease;
}

.menu-item.collapsed .menu-icon {
  margin-right: 0;
}

.menu-title {
  font-size: 14px;
  white-space: nowrap;
  transition: transform 0.2s ease;
}

.active-indicator-container {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #80cbc4; /* สีเทอร์ควอยซ์อ่อน */
  margin-right: 5px;
  box-shadow: 0 0 5px rgba(128, 203, 196, 0.7);
}

.active-indicator {
  font-size: 18px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

/* สไตล์เมื่อเมนูถูกเลือก */
.menu-item.active {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2),
    inset 0 0 3px rgba(255, 255, 255, 0.05);
}

.menu-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: #80cbc4; /* สีเทอร์ควอยซ์อ่อน */
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 8px rgba(128, 203, 196, 0.7);
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  transform: translateX(2px);
}

.menu-item:hover .menu-icon {
  transform: scale(1.1);
  color: rgba(255, 255, 255, 0.9);
}

/* ส่วนล่างของเมนู */
.bottom-section {
  padding: 5px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  background: rgba(0, 0, 0, 0.1);
}

/* ปรับแต่งเมนูออกจากระบบ */
.logout-item {
  margin: 10px 8px;
  color: #ff6b6b;
  transition: all 0.2s ease;
}

.logout-item:hover {
  background-color: rgba(255, 107, 107, 0.1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2),
    inset 0 0 3px rgba(255, 107, 107, 0.1);
}

.logout-item .menu-icon {
  color: #ff6b6b;
  filter: drop-shadow(0 0 2px rgba(255, 107, 107, 0.3));
}

/* ส่วนแสดงเวอร์ชัน */
.version-container {
  text-align: center;
  padding: 12px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  background-color: rgba(0, 0, 0, 0.2);
  margin: 0 -5px;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.02);
}

.collapsed-version {
  text-align: center;
  padding: 10px 0;
}

/* ส่วนของเนื้อหาหลัก */
.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f8f9fa;
  margin-left: 280px;
  width: calc(100% - 280px);
  min-height: 100vh;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.main-content.expanded {
  margin-left: 70px;
  width: calc(100% - 70px);
}

/* การปรับแต่งสำหรับอุปกรณ์มือถือ */
/* การปรับแต่งสำหรับอุปกรณ์มือถือและแท็บเล็ต */
@media screen and (max-width: 991px) {
  .sidebar {
    width: 240px;
  }

  .main-content {
    margin-left: 240px;
    width: calc(100% - 240px);
  }

  .logo {
    max-width: 80px; /* ขนาดโลโก้สำหรับแท็บเล็ต */
  }
}

@media screen and (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%); /* เริ่มต้นด้วยการซ่อน */
    width: 280px;
    background: linear-gradient(135deg, #323232 0%, #1c1c1c 100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0); /* แสดงเมื่อไม่ได้ถูกย่อ */
  }

  .main-content {
    margin-left: 0;
    width: 100%;
  }

  .main-content.expanded {
    margin-left: 0;
    width: 100%;
  }

  .toggle-btn {
    display: flex;
    z-index: 10;
  }

  .logo {
    max-width: 90px; /* ขนาดโลโก้สำหรับมือถือเมื่อเปิดเมนู */
  }

  /* เพิ่ม overlay เมื่อเปิดเมนูบนมือถือ */
  .sidebar:not(.collapsed)::after {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: -1;
    animation: fadeIn 0.3s ease forwards;
    backdrop-filter: blur(1px);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

/* สำหรับหน้าจอขนาดเล็กมาก (เช่น iPhone SE) */
@media screen and (max-width: 375px) {
  .sidebar {
    width: 260px;
  }

  .logo {
    max-width: 80px; /* ปรับขนาดโลโก้ให้เล็กลงบนหน้าจอเล็กมาก */
  }

  .app-title {
    font-size: 16px;
  }
}
</style>
