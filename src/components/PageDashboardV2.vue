<!-- PageDashboard.vue -->

<template>

  <!-- Template with Fixed Fullscreen Functionality -->
  <v-container fluid class="dashboard-container pa-4">
    <!-- Header -->
    <v-card class="mb-4">
      <HeaderCommon :title="'Dashboard'" />
    </v-card>

    <!-- Main two-column layout -->
    <v-row>
      <!-- Left Column -->
      <v-col cols="12" md="6" class="pr-md-2">
        <!-- Total Organizations Card -->
        <v-card color="red-darken-4" class="cursor-pointer mb-4" @click="$router.push('/main/Organization')">
          <v-card-text class="d-flex flex-column align-center justify-center py-4"  style="color: black;">
            <v-icon size="28" class="position-absolute top-left-icon">mdi-police-badge</v-icon>
            <div class="text-h6 text-center">{{ t('dashboard.stats.totalOrganizations') }}</div>
            <div class="text-h3 mt-2">{{ totalData.totalOrganizations }}</div>
          </v-card-text>
        </v-card>

        <!-- Total Readers Card -->
        <v-card color="blue-lighten-2" class="cursor-pointer mb-4" @click="$router.push('/main/RegisterReader')">
          <v-card-text class="d-flex flex-column align-center justify-center py-4">
            <v-icon size="28" class="position-absolute top-left-icon"> mdi-network-outline</v-icon>
            <div class="text-h6 text-center">{{ t('dashboard.stats.totalReaders') }}</div>
            <div class="text-h3 mt-2">{{ totalData.totalReaders }}</div>
          </v-card-text>
        </v-card>

        <!-- Reader Status Cards -->
        <v-row class="mb-4">

          <!--STATUS CARD -->
          <v-col cols="4" class="pr-1">
            <v-card
                color="grey-lighten-1"
                :class="['rounded-0', shouldBlink ? 'blinking' : '']"
            >
              <v-card-text class="d-flex flex-column align-center justify-center py-3">
                <div class="text-subtitle-1 text-center">{{ t('status') }}</div>
                <div class="text-h4 mt-1">{{t('rfid_gateway')}}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Reader Online Card -->
          <v-col cols="4" class="pr-1">
            <v-card color="green-lighten-2" class="cursor-pointer" @click="showDetailDialog('readerOnline')">
              <v-card-text class="d-flex flex-column align-center justify-center py-3">
                <div class="text-subtitle-1 text-center">{{ t('dashboard.stats.readerOnline') }}</div>
                <div class="text-h4 mt-1">{{ readerStatus.readerOnline }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Reader Offline Card -->
          <v-col cols="4" class="pl-1">
            <v-card color="lime-lighten-4" class="cursor-pointer" @click="showDetailDialog('readerOffline')">
              <v-card-text class="d-flex flex-column align-center justify-center py-3">
                <div class="text-subtitle-1 text-center">{{ t('dashboard.stats.readerOffline') }}</div>
                <div class="text-h4 mt-1">{{ readerStatus.readerOffline }}</div>
              </v-card-text>
            </v-card>
          </v-col>

        </v-row>

        <!-- Gateway Location Map -->
        <v-card
            :height="isLocationMapFullscreen ? 'calc(100vh - 200px)' : '300'"
            color="grey-lighten-3"
            class="mb-2"
            :class="{ 'fullscreen-card': isLocationMapFullscreen }"
        >
          <v-card-title class="d-flex align-center justify-space-between">
            <span>{{ t('gateway_location_map') }}</span>
            <div class="d-flex align-center">
              <span class="text-caption me-2" v-if="readerMapOrgName">{{ translatedReaderMapOrgName }}</span>
              <v-btn icon size="small" @click="toggleLocationMapFullscreen">
                <v-icon>{{ isLocationMapFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text :style="{ height: isLocationMapFullscreen ? 'calc(100% - 64px)' : '240px' }" class="pa-0 position-relative">
            <v-btn icon variant="text" @click="cycleToPreviousReaderMap" class="position-absolute map-navigation-btn"
                   style="left: 10px; top: 50%; transform: translateY(-50%);">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn icon variant="text" @click="cycleToNextReaderMap" class="position-absolute map-navigation-btn"
                   style="right: 10px; top: 50%; transform: translateY(-50%);">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>

            <!-- Map Display -->
            <template v-if="readerMapUrl">
              <div class="map-container" id="reader-map-container">
                <img :src="readerMapUrl" class="organization-map" :class="{ 'fullscreen': isLocationMapFullscreen }" alt="Reader Map" style="opacity: 0.4;" @click="handleReaderImageClick" @load="onMapImageLoad"/>

                <!-- Reader Coordinates Loading -->
                <div v-if="sectionStates.readerCoordinates.loading" class="reader-loading">
                  <v-progress-circular size="24" indeterminate></v-progress-circular>
                </div>

                <!-- Reader Coordinates Error -->
                <div v-else-if="sectionStates.readerCoordinates.error" class="reader-error">
                  <v-icon color="error" size="small">mdi-alert</v-icon>
                </div>

                <!-- Multiple Reader Markers -->
                <template v-if="readerCoordinates.length > 0 && !isHeatMapFullscreen">
                  <div v-for="reader in readerCoordinates" :key="reader.id" class="reader-marker" :style="getReaderMarkerStyle(reader)" :title="getReaderTooltip(reader)">
                    <v-icon :color="getReaderColor(reader.status)" size="32" :class="'status-' + reader.status.toLowerCase()">
                      {{ getReaderIcon(reader.role) }}
                    </v-icon>
                  </div>
                </template>
              </div>
            </template>

            <!-- No Map State -->
            <template v-else>
              <div class="d-flex flex-column align-center justify-center h-100">
                <v-icon size="32" color="grey">mdi-map-outline</v-icon>
                <div class="text-grey text-center mt-2">{{ t('no_map_available') }}</div>
              </div>
            </template>
          </v-card-text>
        </v-card>

        <!-- RFID Tag Heat Map -->
        <v-card
            :height="isHeatMapFullscreen ? 'calc(100vh - 200px)' : '300'"
            color="grey-lighten-3"
            :class="{ 'fullscreen-card': isHeatMapFullscreen }"
        >
          <v-card-title class="d-flex align-center justify-space-between">
            <span>{{ t('rfid_heat_map') }}</span>
            <div class="d-flex align-center">
              <span class="text-caption me-2" v-if="heatMapOrgName">{{ translatedHeatMapOrgName }}</span>
              <v-btn icon size="small" @click="toggleHeatMapFullscreen">
                <v-icon>{{ isHeatMapFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text :style="{ height: isHeatMapFullscreen ? 'calc(100% - 64px)' : '240px' }" class="pa-0 position-relative">
            <v-btn icon variant="text" @click="cycleToPreviousHeatMap" class="position-absolute map-navigation-btn"
                   style="left: 10px; top: 50%; transform: translateY(-50%);">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn icon variant="text" @click="cycleToNextHeatMap" class="position-absolute map-navigation-btn"
                   style="right: 10px; top: 50%; transform: translateY(-50%);">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>

            <!-- Map Display -->
            <template v-if="heatMapUrl">
              <div class="map-container" id="rfid-map-container">
                <img :src="heatMapUrl" class="organization-map" :class="{ 'fullscreen': isHeatMapFullscreen }" alt="Heat Map" style="opacity: 0.4;" @load="onHeatmapImageLoad"/>

                <!-- RFID Tag Coordinates Loading -->
                <div v-if="sectionStates.rfidTagCoordinates.loading" class="tag-loading">
                  <v-progress-circular size="24" indeterminate></v-progress-circular>
                </div>

                <!-- RFID Tag Coordinates Error -->
                <div v-else-if="sectionStates.rfidTagCoordinates.error" class="tag-error">
                  <v-icon color="error" size="small">mdi-alert</v-icon>
                </div>

                <!-- Styled Tag Markers with Click to Show Details -->
                <div v-if="rfidTagsCoordinates && rfidTagsCoordinates.length > 0 && !isLocationMapFullscreen" class="rfid-test-container">
                  <div v-for="cluster in rfidTagsCoordinates"
                       :key="cluster.readerSerialNumber"
                       class="tag-cluster"
                       :style="getTagMarkerStyle(cluster)"
                       @click="showClusterDetails(cluster)"
                       @mouseenter="handleClusterHover(cluster)"
                       :title="hoveredCluster === cluster ? getClusterTooltip(cluster) : ''"
                  >
                    <div class="cluster-marker"
                         :style="{
                      backgroundColor: getClusterColor(cluster.tagCount || cluster.tags?.length || 0),
                      width: `${getClusterSize(cluster.tagCount || cluster.tags?.length || 0)}px`,
                      height: `${getClusterSize(cluster.tagCount || cluster.tags?.length || 0)}px`
                      }"
                         @click.stop.prevent="showClusterDetails(cluster)">
                      <span class="cluster-count">
                        {{ cluster.tagCount || cluster.tags?.length || 0 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- No Map State -->
            <template v-else>
              <div class="d-flex flex-column align-center justify-center h-100">
                <v-icon size="32" color="grey">mdi-map-outline</v-icon>
                <div class="text-grey text-center mt-2">{{ t('no_map_available') }}</div>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>






      <!-- Right Column -->
      <v-col cols="12" md="6" class="pl-md-2">
        <!-- Total Supplies Card -->
        <v-card color="amber-darken-3" class="cursor-pointer mb-4" @click="$router.push('/main/ManageSupplies')">
          <v-card-text class="d-flex flex-column align-center justify-center py-4">
            <v-icon size="28" class="position-absolute top-left-icon">mdi-pistol</v-icon>
            <div class="text-h6 text-center">{{ t('dashboard.stats.totalSupplies') }}</div>
            <div class="text-h3 mt-2">{{ totalData.totalSupplies }}</div>
          </v-card-text>
        </v-card>

        <!-- Total RFID Tags Card -->
        <v-card color="blue-lighten-4" class="cursor-pointer mb-4" @click="$router.push('/main/RegisterRfidTags')">
          <v-card-text class="d-flex flex-column align-center justify-center py-4">
            <v-icon size="28" class="position-absolute top-left-icon">mdi-barcode</v-icon>
            <div class="text-h6 text-center">{{ t('dashboard.stats.totalRfidTags') }}</div>
            <div class="text-h3 mt-2">{{ totalData.totalRfidTags }}</div>
          </v-card-text>
        </v-card>

        <!-- RFID Status Cards (Top Row) -->

        <v-row class="mb-3">
          <v-col cols="4" class="pr-1">
            <v-card color="green-lighten-2" class="cursor-pointer" @click="showDetailDialog('tagInUsing')">
              <v-card-text class="d-flex flex-column align-center justify-center py-3">
                <div class="text-subtitle-1 text-center">{{ t('dashboard_10_using') }}</div>
                <div class="text-h4 mt-1">{{ tagStats2[0]?.value ?? 0 }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- RFID พร้อมใช้งาน (Ready Tags) -->
          <v-col cols="4" class="pr-1">
            <v-card color="light-blue-lighten-4" class="cursor-pointer" @click="showDetailDialog('tagInRemaining')">
              <v-card-text class="d-flex flex-column align-center justify-center py-3">
                <div class="text-subtitle-1 text-center">{{ t('dashboard_10_remain') }}</div>
                <div class="text-h4 mt-1">{{ tagStats2[1]?.value ?? 0 }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- RFID คงเหลือ (Remained Tags) -->
          <v-col cols="4" class="pl-1">
            <v-card color="brown-lighten-3" class="cursor-pointer" @click="showDetailDialog('tagDamaged')">
              <v-card-text class="d-flex flex-column align-center justify-center py-3">
                <div class="text-subtitle-1 text-center">{{ t('dashboard_10_damaged') }}</div>
                <div class="text-h4 mt-1">{{ tagStats2[2]?.value ?? 0 }}</div>
              </v-card-text>
            </v-card>
          </v-col>

        </v-row>

        <!-- RFID Tag Small Status Cards (Bottom Row) -->
        <v-row class="mb-4">

          <!-- STATUS CARD -->
          <v-col cols="3" class="pr-1">
            <v-card
                color="grey-lighten-1"
                :class="['rounded-0', shouldBlink ? 'blinking' : '']">
              <v-card-text class="d-flex flex-column align-center justify-center py-2">
                <div class="text-subtitle-2 text-center">{{ t('status') }}</div>
                <div class="text-h5 mt-1">{{ t('rfid_tag') }}</div>
              </v-card-text>
            </v-card>
          </v-col>


          <!-- Supply Active -->
          <v-col cols="3" class="pr-1">
            <v-card color="green-lighten-2" class="cursor-pointer" @click="showDetailDialog('activeSupplies')">
              <v-card-text class="d-flex flex-column align-center justify-center py-2">
                <div class="text-subtitle-2 text-center">{{ t('dashboard.stats.trackingActive') }}</div>
                <div class="text-h5 mt-1">{{ suppliesStats[0]?.value ?? 0 }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Supply Inactive -->
          <v-col cols="3" class="px-1">
            <v-card color="lime-lighten-4" class="cursor-pointer" @click="showDetailDialog('inactiveSupplies')">
              <v-card-text class="d-flex flex-column align-center justify-center py-2">
                <div class="text-subtitle-2 text-center">{{ t('dashboard.stats.trackingInactive') }}</div>
                <div class="text-h5 mt-1">{{ suppliesStats[1]?.value ?? 0 }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Supply Lost -->
          <v-col cols="3" class="pl-1">
            <v-card color="red-lighten-3" class="cursor-pointer" @click="showDetailDialog('lostSupplies')">
              <v-card-text class="d-flex flex-column align-center justify-center py-2">
                <div class="text-subtitle-2 text-center">{{ t('dashboard.stats.trackingLost') }}</div>
                <div class="text-h5 mt-1">{{ suppliesStats[2]?.value ?? 0 }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Supply Types Chart -->
        <div :class="{ 'chart-fullscreen-container': isPieChartFullscreen }">
          <v-card
              :height="isPieChartFullscreen ? 'calc(50vh - 100px)' : '500px'"
              :width="isPieChartFullscreen ? 'calc(70vw)' : 'auto'"
              color="grey-lighten-3"
              :class="{ 'fullscreen-card-chart': isPieChartFullscreen }"
          >
            <v-card-title class="d-flex align-center justify-space-between">
              <span>{{ t('dashboard.charts.supplyTypes') }}</span>
              <v-btn icon size="small" @click="togglePieChartFullscreen">
                <v-icon>{{ isPieChartFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text :style="{ height: isPieChartFullscreen ? 'calc(100% - 64px)' : 'calc(500px - 64px)' }" class="d-flex justify-center align-center">
              <template v-if="sectionStates.supplyTypes.loading">
                <v-progress-circular indeterminate></v-progress-circular>
              </template>
              <template v-else-if="supplyTypeData.length">
                <PieChart :chartData="computedChartData" :isFullscreen="isPieChartFullscreen" class="w-100 h-100"/>
              </template>
              <template v-else>
                <div class="empty-state-container">
                  <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-chart-pie</v-icon>
                  <div class="text-h6 text-grey-darken-1">{{ t('dashboard.charts.noDataTitle') }}</div>
                  <div class="text-body-2 text-grey">{{ t('dashboard.charts.noDataMessage') }}</div>
                </div>
              </template>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Copy/PNG Button -->
    <div class="d-flex mb-4">
      <span class="text-subtitle-2" style="color:#FF8C00;">COPY</span>
      <v-btn variant="outlined" color="#FF8C00" size="small" class="ml-2" @click="exportReport('PNG')">PNG</v-btn>
    </div>

    <!-- Details Panel Dialog -->
    <v-dialog v-model="showDebugDetails" max-width="900">
      <v-card v-if="selectedCluster">
        <v-card-title class="d-flex justify-space-between align-center">
          {{ selectedCluster.tagCount || selectedCluster.tags?.length || 0 }} Tags
          <v-btn icon="mdi-close" size="small" @click="showDebugDetails = false"></v-btn>
        </v-card-title>
        <v-card-text style="max-height: 800px; overflow-y: auto;">
          <!-- Dialog content unchanged -->
          <!-- Reader / Cluster Information -->
          <div class="text-h6">{{ t('reader_serial_number') || 'Reader Serial Number' }}: {{ selectedCluster.readerSerialNumber }}
            <span
                v-if="selectedCluster.note"
                class="text-primary font-weight-medium ms-2"
            > - {{ selectedCluster.note }}</span>
          </div>

          <v-divider class="my-2"></v-divider>
          <!-- Search Bar -->
          <v-text-field v-model="searchTag" :label="t('search') || 'Search'" density="compact" variant="outlined" hide-details class="mb-2 custom-table"></v-text-field>
          <!-- Tag List with Vuetify 3 Data Table -->
          <v-data-table
              :headers="tagHeaders"
              :items="filteredTags"
              :items-per-page="itemsPerPage"
              :page="page"
              @update:page="page = $event"
              class="mt-2">
            <!-- Custom template for status column to use the color function -->
            <template v-slot:item.trackingStatus="{ item }">
              <v-chip :color="getTrackingStatusColor(item.trackingStatus)" size="small">{{ item.trackingStatus }}</v-chip>
            </template>
            <!-- Footer template for items-per-page selector -->
            <template v-slot:bottom>
              <div class="d-flex align-center justify-space-between px-4 py-2">
                <span>Items per page:</span>
                <v-select
                    v-model="itemsPerPage"
                    :items="[1, 3, 5, 10, 25, 50, 100, { value: -1, title: 'All' }]"
                    density="compact"
                    hide-details
                    variant="outlined"
                    style="min-width: 100px; width: 100px; max-width: 150px;"
                    class="mx-2"
                ></v-select>

                <div class="d-flex align-center">
                  <span class="me-4">{{ getPaginationText() }}</span>
                  <div class="d-flex">
                    <v-btn icon="mdi-page-first" variant="text" density="compact" :disabled="page <= 1" @click="page = 1"></v-btn>
                    <v-btn icon="mdi-chevron-left" variant="text" density="compact" :disabled="page <= 1" @click="page--"></v-btn>
                    <v-btn icon="mdi-chevron-right" variant="text" density="compact" :disabled="page >= pageCount" @click="page++"></v-btn>
                    <v-btn icon="mdi-page-last" variant="text" density="compact" :disabled="page >= pageCount" @click="page = pageCount"></v-btn>
                  </div>
                </div>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>


    <DashboardDialog
        v-model="dialogVisible"
        :type="dialogType"
    />

  </v-container>

</template>

<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref} from 'vue';
import HeaderCommon from "@/components/HeaderCommon.vue";
import api from "@/axiostoastapi.js";
import { useI18n } from "vue-i18n";
import PieChart from '@/components/charts/PieChart.vue';
import DashboardDialog from '@/components/DashboardDialog.vue';
import html2canvas from "html2canvas";
import { rfidTagsData} from '@/mock/rfidTagsMock';
import {showSuccess, showError, snackbar} from '@/utils/snackbar';
const dialogVisible = ref(false);
const dialogType = ref('');

const showDetailDialog = (type) => {
  dialogType.value = type;
  dialogVisible.value = true;
};
const shouldBlink = ref(true)
const { t, locale } = useI18n();
const sectionStates = ref({
  readerStats: { loading: true, error: null },
  supplyTypes: { loading: true, error: null },
  readerCoordinates: { loading: true, error: null },
  rfidTagCoordinates: { loading: true, error: null }
});
const supplyTypeData = ref([]);
const totalSupplies = ref(0);

const readerRoleStats = ref([]);
const computedChartData = computed(() => {
  console.log(" supplyTypeData before transformation:", supplyTypeData.value);

  if (!supplyTypeData.value || supplyTypeData.value.length === 0 || totalSupplies.value === 0) {
    console.warn(" No data available for PieChart!");
    return null; // Prevents PieChart from rendering with invalid data
  }

  return {
    labels: supplyTypeData.value.map(item => {
      console.log(" Checking supplyTypeData item:", item);

      const name = item.typeName || "Unknown"; // Fix: Ensure `typeName` is correctly accessed
      const percentage = totalSupplies.value > 0
          ? ((item.count / totalSupplies.value) * 100).toFixed(1)
          : "0.0";

      return `${name} (${percentage}%)`;
    }),
    datasets: [{
      data: supplyTypeData.value.map(item => item.count || 0),
      backgroundColor: [
        '#4285F4', '#34A853', '#FBBC05', '#EA4335',
        '#FF6D01', '#46BDC6', '#7B1FA2', '#C2185B'
      ]
    }]
  };
});

const updateReaderRoleStats = d => readerRoleStats.value = [
  ['readerGateMonitor', d.reader_role_GATE_MONITOR, 'deep-purple-lighten-1', 'mdi-gate'],
  ['readerRoomMonitor', d.reader_role_ROOM_MONITOR, 'indigo-lighten-1', 'mdi-door'],
  ['readerPathMonitor', d.reader_role_PATH_MONITOR, 'blue-lighten-1', 'mdi-sign-direction'],
  ['mongoDbStatus', d.mongoDb_status === "Disconnected" ? t('dashboard.mongoDb.disconnected') : d.mongoDb_status, 'orange-lighten-4', 'mdi-database']
].map(([key, value, color, icon]) => ({titleKey: `dashboard.stats.${key}`, value, color, icon}));

const fetchReaderRoleStats = async () => {
  sectionStates.value.readerStats.loading = true;
  sectionStates.value.readerStats.error = null;
  try {
    const response = await api.get('/api/dashboard', {params: {optionType: 4}});
    console.log(response);
    updateReaderRoleStats(response.data);
  } catch (error) {
    console.error('Error fetching reader stats:', error);
    sectionStates.value.readerStats.error = t('errors.fetchFailed');
  } finally {
    sectionStates.value.readerStats.loading = false;
  }
};

const fetchSupplyTypes = async () => {
  sectionStates.value.supplyTypes.loading = true;
  sectionStates.value.supplyTypes.error = null;
  try {
    const response = await api.get('/api/dashboard', {params: {optionType: 5}});
    console.log(response);
    supplyTypeData.value = response.data.supplyTypes;
    totalSupplies.value = response.data.totalSupplies;
  } catch (error) {
    console.error('Error fetching supply types:', error);
    sectionStates.value.supplyTypes.error = t('errors.fetchFailed');
  } finally {
    sectionStates.value.supplyTypes.loading = false;
  }
};

// Expandable Pie Chart
const isPieChartFullscreen = ref(false);
const togglePieChartFullscreen = () => {
  isPieChartFullscreen.value = !isPieChartFullscreen.value;
  if (isPieChartFullscreen.value) {
    isLocationMapFullscreen.value = false;
    isHeatMapFullscreen.value = false;
  }
};
const fetchDashboardData = async () => {
  Object.keys(sectionStates.value).forEach(key => {
    sectionStates.value[key] = { loading: true, error: null };
  });
  await Promise.all([
    fetchReaderRoleStats(),
    fetchSupplyTypes()
  ]);
};
const isLocationMapFullscreen = ref(false);
const isHeatMapFullscreen = ref(false);
const toggleLocationMapFullscreen = () => {
  console.log('Toggle Location Map Full Screen BEFORE ',isLocationMapFullscreen.value);
  isLocationMapFullscreen.value = !isLocationMapFullscreen.value;
  if (isLocationMapFullscreen.value && isHeatMapFullscreen.value) {
    isHeatMapFullscreen.value = false;
  }
  console.log('Toggle Location Map Full Screen AFTER ',isLocationMapFullscreen.value);
  // Force marker recalculation after transition
  setTimeout(() => {
    if (readerCoordinates.value && readerCoordinates.value.length > 0) {
      readerCoordinates.value = [...readerCoordinates.value];
    }
  }, 300); // Adjust this delay to match your transition duration
};

const toggleHeatMapFullscreen = () => {
  console.log('Toggle HeatMap Full Screen BEFORE ',isHeatMapFullscreen.value);
  isHeatMapFullscreen.value = !isHeatMapFullscreen.value;
  if (isHeatMapFullscreen.value && isLocationMapFullscreen.value) {
    isLocationMapFullscreen.value = false;
  }
  console.log('Toggle HeatMap Full Screen AFTER ',isHeatMapFullscreen.value);
  // Force marker recalculation after transition
  setTimeout(() => {
    if (rfidTagsCoordinates.value && rfidTagsCoordinates.value.length > 0) {
      console.log("Recalculating RFID tag positions after fullscreen toggle");
      rfidTagsCoordinates.value = [...rfidTagsCoordinates.value];
    }
  }, 300); // Adjust this delay to match your transition duration
};
// Improved export function: Map stretched and blank pie chart
const exportReport = async (format) => {
  if (format === "PNG") {
    const dashboard = document.querySelector(".dashboard-container");
    if (!dashboard) {
      console.error("Dashboard container not found.");
      return;
    }
    try {
      // Show loading indicator
      snackbar.value = {
        show: true,
        text: t('dashboard.exporting') || 'Exporting dashboard...',
        color: "info"
      };
      // Get all charts first and convert them to images
      const charts = [];
      // Get the pie chart
      const pieChartElement = document.querySelector('.chart-container canvas');
      if (pieChartElement) {
        charts.push({
          element: pieChartElement,
          dataUrl: pieChartElement.toDataURL(),
          rect: pieChartElement.getBoundingClientRect()
        });
      }
      // Capture the dashboard
      const canvas = await html2canvas(dashboard, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        logging: false,
        imageTimeout: 0,
        removeContainer: false,
        onclone: function(clonedDoc){
          // Fix maps in the clone
          const mapContainers = clonedDoc.querySelectorAll('.map-container');
          const mapImages = clonedDoc.querySelectorAll('.organization-map');

          mapContainers.forEach(container => {
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.style.overflow = 'hidden';
          });
          mapImages.forEach(img => {
            img.style.objectFit = 'contain';
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.width = 'auto';
            img.style.height = 'auto';
            img.style.display = 'block';
            img.style.margin = '0 auto';
            img.style.opacity = '1';
          });
          // Replace pie chart with captured image
          charts.forEach(chart => {
            const cloneChart = clonedDoc.querySelector('.chart-container canvas');
            if (cloneChart) {
              const img = document.createElement('img');
              img.src = chart.dataUrl;
              img.style.width = chart.rect.width + 'px';
              img.style.height = chart.rect.height + 'px';
              cloneChart.parentNode.replaceChild(img, cloneChart);
            }
          });
        }
      });
      // Convert to PNG and download
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `dashboard_report_${new Date().toISOString().slice(0,10)}.png`;
      link.click();
      // Show success message
      snackbar.value = {
        show: true,
        text: t('dashboard.exportSuccess') || 'Export successful!',
        color: "success"
      };
    } catch (error) {
      console.error("Error exporting PNG:", error);
      snackbar.value = {
        show: true,
        text: t('dashboard.exportFailed') || 'Export failed. Please try again.',
        color: "error"
      };
    }
  }
};
// Extended Organization Map

// UUIDs are required to be pass for get Supply
const organizationHierarchy = ref([])
const fetchOrganizationHierarchy = async () => {
  try {
    const response = await api.get('/api/organization-hierarchies/9levels')
    // Log full response object for detailed information
    console.log("Full response:", response);
    // Log response data only
    console.log("Fetch full organization:", response.data);
    showSuccess(t('fetch_organization_successfully'));
    organizationHierarchy.value = response.data
  } catch (error) {
    showError(t('error_loading_organizations'))
  }
};

const rootOrganizations = ref([]);
const readerMapUrl = ref(null);
const heatMapUrl = ref(null);
const currentReaderMapIndex = ref(0);
const currentHeatMapIndex = ref(0);
const currentOrgName = ref('');
const translatedOrgName = computed(() => {
  if (!currentOrgName.value) return '';

  return locale.value === 'th'
      ? currentOrgName.value?.th || currentOrgName.value
      : currentOrgName.value?.en || currentOrgName.value;
});

sectionStates.value.organizationMap = { loading: true, error: null };
const getRootOrganizations = (hierarchy) => {
  return hierarchy.filter(org => !org.parentUUID);
};

const initializeReaderMapData = async () => {
  sectionStates.value.organizationMap.loading = true;
  sectionStates.value.organizationMap.error = null;
  try {
    await fetchOrganizationHierarchy();
    rootOrganizations.value = getRootOrganizations(organizationHierarchy.value);
    console.log("Root Organizations:", rootOrganizations.value);
    if (rootOrganizations.value.length > 0) {
      //await loadCurrentMap('reader');  // Load Reader Map first
      await loadCurrentReaderMap();  // Load Reader Map first
    }
  } catch (error) {
    console.error('Error initializing map data:', error);
    sectionStates.value.organizationMap.error = true;
  } finally {
    sectionStates.value.organizationMap.loading = false;
  }
};

const initializeHeatMapData = async () => {
  sectionStates.value.organizationMap.loading = true;
  sectionStates.value.organizationMap.error = null;
  try {
    await fetchOrganizationHierarchy();
    rootOrganizations.value = getRootOrganizations(organizationHierarchy.value);
    console.log("Root Organizations:", rootOrganizations.value);
    if (rootOrganizations.value.length > 0) {
      //await loadCurrentMap('heat');    // Load Heat Map second
      await loadCurrentHeatMap();
    }
  } catch (error) {
    console.error('Error initializing map data:', error);
    sectionStates.value.organizationMap.error = true;
  } finally {
    sectionStates.value.organizationMap.loading = false;
  }
};

const loadCurrentReaderMap = async () => {
  if (rootOrganizations.value.length === 0) {
    if (readerMapUrl.value) URL.revokeObjectURL(readerMapUrl.value);
    readerMapUrl.value = null;
    return;
  }
  const currentOrg = rootOrganizations.value[currentReaderMapIndex.value];
  readerMapOrgName.value = currentOrg.translations; // Update only reader map org name
  //currentOrgName.value = currentOrg.translations;
  try {
    // Fetch reader coordinates
    await fetchReaderCoordinates(currentOrg.id);
    // Fetch the reader map image
    const response = await api.get(
        `/api/organization-maps/org/${currentOrg.id}`,
        { responseType: "blob" }
    );
    if (response.status === 200) {
      const blob = new Blob([response.data], { type: "image/jpeg" });

      if (readerMapUrl.value) URL.revokeObjectURL(readerMapUrl.value);
      readerMapUrl.value = URL.createObjectURL(blob);
    } else {
      if (readerMapUrl.value) URL.revokeObjectURL(readerMapUrl.value);
      readerMapUrl.value = null;
    }
  } catch (error) {
    console.error("Error loading Reader Map:", error);
    if (readerMapUrl.value) URL.revokeObjectURL(readerMapUrl.value);
    readerMapUrl.value = null;
  }
};
const loadCurrentHeatMap = async () => {
  if (rootOrganizations.value.length === 0) {
    if (heatMapUrl.value) URL.revokeObjectURL(heatMapUrl.value);
    heatMapUrl.value = null;
    return;
  }
  const currentOrg = rootOrganizations.value[currentHeatMapIndex.value];
  heatMapOrgName.value = currentOrg.translations; // Update only heat map org name
  //currentOrgName.value = currentOrg.translations;
  try {
    await fetchRfidTagsCoordinates(currentOrg.id);
    // Fetch the heat map image
    const response = await api.get(
        `/api/organization-maps/org/${currentOrg.id}`,
        { responseType: "blob" }
    );
    if (response.status === 200) {
      const blob = new Blob([response.data], { type: "image/jpeg" });
      if (heatMapUrl.value) URL.revokeObjectURL(heatMapUrl.value);
      heatMapUrl.value = URL.createObjectURL(blob);
    } else {
      if (heatMapUrl.value) URL.revokeObjectURL(heatMapUrl.value);
      heatMapUrl.value = null;
    }
  } catch (error) {
    console.error("Error loading Heat Map:", error);
    if (heatMapUrl.value) URL.revokeObjectURL(heatMapUrl.value);
    heatMapUrl.value = null;
  }
};
const cycleToNextReaderMap = async () => {
  if (rootOrganizations.value.length <= 1) {console.warn("Only one map available, cannot cycle.");return;}
  if (readerMapUrl.value) {console.log("Cleaning up previous reader map URL...");URL.revokeObjectURL(readerMapUrl.value);}
  currentReaderMapIndex.value = (currentReaderMapIndex.value + 1) % rootOrganizations.value.length;
  console.log("New Reader Map Index:", currentReaderMapIndex.value);
  await loadCurrentReaderMap();
};

const cycleToPreviousReaderMap = async () => {
  console.log("Button Clicked: Previous Reader Map");
  if (rootOrganizations.value.length <= 1) {console.warn("Only one map available, cannot cycle.");return;}
  if (readerMapUrl.value) {console.log("Cleaning up previous reader map URL...");URL.revokeObjectURL(readerMapUrl.value);}
  currentReaderMapIndex.value = (currentReaderMapIndex.value === 0)
      ? rootOrganizations.value.length - 1
      : currentReaderMapIndex.value - 1;
  console.log("New Reader Map Index:", currentReaderMapIndex.value);
  await loadCurrentReaderMap();
};
const cycleToNextHeatMap = async () => {
  if (rootOrganizations.value.length <= 1) return;
  if (heatMapUrl.value) URL.revokeObjectURL(heatMapUrl.value); // Free old map URL
  currentHeatMapIndex.value = (currentHeatMapIndex.value + 1) % rootOrganizations.value.length;
  await loadCurrentHeatMap();
};
const cycleToPreviousHeatMap = async () => {
  if (rootOrganizations.value.length <= 1) return;
  if (heatMapUrl.value) URL.revokeObjectURL(heatMapUrl.value); // Free memory
  currentHeatMapIndex.value = (currentHeatMapIndex.value === 0)
      ? rootOrganizations.value.length - 1
      : currentHeatMapIndex.value - 1;
  await loadCurrentHeatMap();
};
const tagMapCoordinates = ref(null);
const getTagMapMarkerStyle = () => {
  if (!tagMapCoordinates.value) return {};
  return {
    left: `${tagMapCoordinates.value.x}%`,
    top: `${tagMapCoordinates.value.y}%`
  };
};
// Plot Readers on Map
sectionStates.value.readerCoordinates = { loading: false, error: null };
const readerCoordinates = ref([]);
const fetchReaderCoordinates = async (organizationId) => {
  console.log(`===== FETCHING READER COORDINATES FOR ORG: ${organizationId} =====`);
  sectionStates.value.readerCoordinates.loading = true;
  sectionStates.value.readerCoordinates.error = null;
  try {
    const response = await api.get('/api/rfid_readers/coordinates');
    console.log("API response received:", response.data);
    // Filter for readers belonging to the current organization
    const filteredReaders = response.data.filter(
        reader => reader.organizationId === organizationId
    );
    console.log(`Filtered ${filteredReaders.length} readers for organization ${organizationId}`);
    // Log each reader's coordinates
    filteredReaders.forEach((reader, index) => {
      console.log(`Reader ${index + 1}: ID=${reader.id || reader.readerSerialNumber}, ` +
          `Coordinates=(${reader.x_coordinate}, ${reader.y_coordinate}), ` +
          `Status=${reader.status}, Role=${reader.role}`);
    });
    readerCoordinates.value = filteredReaders;
  } catch (error) {
    console.error('Error fetching reader coordinates:', error);
    sectionStates.value.readerCoordinates.error = error;
  } finally {
    sectionStates.value.readerCoordinates.loading = false;
  }
};
// Add this improved image load handler
const onMapImageLoad = (event) => {
  const img = event.target;
  console.log(`===== MAP IMAGE LOADED =====`);
  console.log(`Natural dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
  console.log(`Display dimensions: ${img.width}x${img.height}`);
  console.log(`Complete: ${img.complete}`);
  // Force a recalculation of marker positions
  nextTick(() => {
    console.log("Recalculating marker positions after image load");
    if (readerCoordinates.value && readerCoordinates.value.length > 0) {
      // Force Vue to update by creating a shallow copy
      readerCoordinates.value = [...readerCoordinates.value];
    }
  });
};
// Add this window resize handler with debouncing
let resizeTimeout = null;

let previousWidth = window.innerWidth;
let previousHeight = window.innerHeight;

const handleResize = () => {
  // Clear any existing timeout to debounce the resize events
  if (resizeTimeout) clearTimeout(resizeTimeout);
  // Detect if this is likely a maximize/restore event
  const isMaximizeEvent = Math.abs(window.innerWidth - previousWidth) > 200 ||
      Math.abs(window.innerHeight - previousHeight) > 200;
  // Set a timeout to avoid multiple rapid recalculations
  resizeTimeout = setTimeout(() => {
    // Store current dimensions for next comparison
    previousWidth = window.innerWidth;
    previousHeight = window.innerHeight;

    // For maximize events, use a more aggressive retry strategy
    if (isMaximizeEvent) {
      console.log("Detected maximize/restore event - using extended recalculation strategy");
      // Series of recalculations at increasing intervals
      const intervals = [50, 150, 300, 500, 1000]; // milliseconds
      intervals.forEach(delay => {
        setTimeout(() => {

          if (readerCoordinates.value && readerCoordinates.value.length > 0) {
            console.log(`Recalculating marker positions after maximize/restore (delay: ${delay}ms)`);
            readerCoordinates.value = [...readerCoordinates.value];
          }
          // Recalculate RFID tag cluster positions
          if (rfidTagsCoordinates.value && rfidTagsCoordinates.value.length > 0) {
            console.log(`Recalculating RFID tag positions (delay: ${delay}ms)`);
            rfidTagsCoordinates.value = [...rfidTagsCoordinates.value];
          }
        }, delay);
      });
    } else {
      // Normal resize - single recalculation
      if (readerCoordinates.value && readerCoordinates.value.length > 0) {
        console.log("Recalculating marker positions after resize");
        readerCoordinates.value = [...readerCoordinates.value];
      }
      // Recalculate RFID tag cluster positions
      if (rfidTagsCoordinates.value && rfidTagsCoordinates.value.length > 0) {
        console.log("Recalculating RFID tag positions after resize");
        rfidTagsCoordinates.value = [...rfidTagsCoordinates.value];
      }
    }
  }, 100);
};

// Also handle browser fullscreen events
document.addEventListener('fullscreenchange', () => {
  console.log("Browser fullscreen state changed");
  // Use the same staggered approach as for maximize
  const intervals = [100, 300, 500, 1000];
  intervals.forEach(delay => {
    setTimeout(() => {
      if (readerCoordinates.value && readerCoordinates.value.length > 0) {
        console.log(`Recalculating marker positions after fullscreen change (delay: ${delay}ms)`);
        readerCoordinates.value = [...readerCoordinates.value];
      }
      // Recalculate RFID tag cluster positions
      if (rfidTagsCoordinates.value && rfidTagsCoordinates.value.length > 0) {
        console.log(`Recalculating RFID tag positions after fullscreen change (delay: ${delay}ms)`);
        rfidTagsCoordinates.value = [...rfidTagsCoordinates.value];
      }
    }, delay);
  });
});
// Improve the getReaderMarkerStyle function for more stability
const getReaderMarkerStyle = (reader) => {
  console.log(`===== MARKER POSITIONING FOR READER ${reader.id || reader.readerSerialNumber} =====`);
  console.log(`Reader coordinates: x=${reader.x_coordinate}, y=${reader.y_coordinate}`);
  // Get the image element to calculate proper scaling
  //const mapImage = document.querySelector('.organization-map');
  const mapImage = document.querySelector('#reader-map-container .organization-map');
  if (!mapImage) {
    console.error("Map image element not found!");
    return { display: 'none' };
  }
  // Log image load state
  console.log(`Image complete: ${mapImage.complete}`);
  console.log(`Image natural dimensions: ${mapImage.naturalWidth}x${mapImage.naturalHeight}`);
  if (!mapImage.complete || !mapImage.naturalWidth) {
    console.warn("Image not fully loaded, deferring marker positioning");
    return { display: 'none' };
  }
  // Get container dimensions
  const container = mapImage.parentElement;
  const containerRect = container.getBoundingClientRect();
  const imgRect = mapImage.getBoundingClientRect();
  console.log(`Container dimensions: ${containerRect.width}x${containerRect.height}`);
  console.log(`Image display dimensions: ${imgRect.width}x${imgRect.height}`);
  // Calculate aspect ratios
  const imgAspectRatio = mapImage.naturalWidth / mapImage.naturalHeight;
  const containerAspectRatio = containerRect.width / containerRect.height;
  console.log(`Image aspect ratio: ${imgAspectRatio.toFixed(4)}`);
  console.log(`Container aspect ratio: ${containerAspectRatio.toFixed(4)}`);
  // Calculate letterboxing
  let offsetX = 0, offsetY = 0;
  let scaledWidth, scaledHeight;
  if (imgAspectRatio > containerAspectRatio) {
    // Image is wider than container (letterboxing on top/bottom)
    scaledWidth = imgRect.width;
    scaledHeight = imgRect.width / imgAspectRatio;
    offsetY = (imgRect.height - scaledHeight) / 2;
    console.log(`Letterboxing on top/bottom`);
    console.log(`Scaled dimensions: ${scaledWidth.toFixed(2)}x${scaledHeight.toFixed(2)}`);
    console.log(`Vertical offset (Y): ${offsetY.toFixed(2)}px`);
  } else {
    // Image is taller than container (letterboxing on sides)
    scaledHeight = imgRect.height;
    scaledWidth = imgRect.height * imgAspectRatio;
    offsetX = (imgRect.width - scaledWidth) / 2;
    console.log(`Letterboxing on sides`);
    console.log(`Scaled dimensions: ${scaledWidth.toFixed(2)}x${scaledHeight.toFixed(2)}`);
    console.log(`Horizontal offset (X): ${offsetX.toFixed(2)}px`);
  }
  // Calculate the scaling factors
  const scaleX = scaledWidth / mapImage.naturalWidth;
  const scaleY = scaledHeight / mapImage.naturalHeight;
  console.log(`Scaling factors: X=${scaleX.toFixed(4)}, Y=${scaleY.toFixed(4)}`);
  // Convert the coordinates (accounting for both scaling and offset)
  const pixelX = (reader.x_coordinate * scaleX) + offsetX;
  const pixelY = (reader.y_coordinate * scaleY) + offsetY;
  // Convert to percentages relative to container
  const percentX = (pixelX / imgRect.width) * 100;
  const percentY = (pixelY / imgRect.height) * 100;
  console.log(`Converted coordinates:`);
  console.log(`  - Pixels: (${pixelX.toFixed(2)}, ${pixelY.toFixed(2)})`);
  console.log(`  - Percent: (${percentX.toFixed(2)}%, ${percentY.toFixed(2)}%)`);
  return {
    position: 'absolute',
    left: `${percentX}%`,
    top: `${percentY}%`,
    transform: 'translate(-50%, -50%)',
    cursor: 'pointer',
    zIndex: 2
  };
};
const getReaderTooltip = (reader) => {
  return `ID: ${reader.readerSerialNumber}
Status: ${reader.status}
Role: ${reader.role}
IP: ${reader.ipAddress}`;
};
const getReaderColor = (status) => {
  return status === 'ONLINE' ? 'green' : 'red';
};
// map-marker-radius, map-marker-circle, map-marker-radius-outline, map-marker, alpha-r-circle, alpha-d-circle
const getReaderIcon = (role) => {
  switch (role) {
    case 'GATE_MONITOR': return 'mdi-map-marker-radius-outline';
    case 'ROOM_MONITOR': return 'mdi-map-marker-circle';
    case 'PATH_MONITOR': return 'mdi-map-marker-radius';
    default: return 'mdi-map-marker-radius';
  }
};
const handleReaderImageClick = (event) => {
  const img = event.target.getBoundingClientRect();
  // Calculate X and Y in percentage relative to the image
  const x = ((event.clientX - img.left) / img.width) * 100;
  const y = ((event.clientY - img.top) / img.height) * 100;
  console.log(`Clicked at: X = ${x.toFixed(2)}%, Y = ${y.toFixed(2)}%`);
};

// Plot RFID Tags Coordinates to heatMap
const showDebugDetails = ref(false);
// Add a flag to toggle between mock and real API
const useMockData = false; // Change to false to use the real API
const totalTagCount = ref(0);
const rfidTagsCoordinates = ref([]);

const fetchRfidTagsCoordinates = async (organizationId) => {
  console.log(`######### FETCHING RFID TAG COORDINATES FOR ORG: ${organizationId} =====`);
  sectionStates.value.rfidTagCoordinates.loading = true;
  sectionStates.value.rfidTagCoordinates.error = null;
  try {

    let data;
    if (useMockData){
      // Use mock data
      console.log("######### Using mock RFID tag data");
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      data = rfidTagsData;
      //data = blankMockupData;
    }else {
      // Use real API
      const response = await api.get('/api/rfid_tags_tracking_V2/coordinates-cluster');
      data = response.data;
    }
    console.log("######### RFID reader and tag data cluster coordinates received:", data);
    // Filter for readers belonging to the current organization
    const filteredClusters = data.filter(
        cluster => cluster.organizationId === organizationId
    );
    // Store the filtered data without processing
    rfidTagsCoordinates.value = filteredClusters;
    // Process the data for display
    processTagClusters(filteredClusters);
  } catch (error) {
    console.error('######### Error fetching reader coordinates:', error);
    sectionStates.value.rfidTagCoordinates.error = error;
  } finally {
    sectionStates.value.rfidTagCoordinates.loading = false;
  }
};
// Process tag clusters from reader data
const processTagClusters = (readers) => {
  console.log("Processing tag clusters:", readers.length);
  // Calculate total tags
  totalTagCount.value = readers.reduce((sum, reader) =>
      sum + (reader.tagCount || (reader.tags?.length || 0)), 0
  );
  // Process supply breakdown for each reader
  const processedReaders = readers.map(reader => {
    // Generate supply breakdown (count by supply type)
    const supplyBreakdown = {};
    if (reader.tags && reader.tags.length > 0) {
      reader.tags.forEach(tag => {
        // Create a key from supply name
        const key = tag.supplyName || 'Unknown';
        if (!supplyBreakdown[key]) {
          supplyBreakdown[key] = {
            supplyName: tag.supplyName || 'Unknown',
            count: 0,
            trackingStatus: tag.trackingStatus || 'UNKNOWN'
          };
        }
        supplyBreakdown[key].count++;
      });
    }
    // Return enhanced reader object with processed data
    return {
      ...reader,
      // Convert supply breakdown object to array for easier rendering
      supplyBreakdownArray: Object.values(supplyBreakdown)
    };
  });
  // Update the rfidTagsCoordinates with processed data
  rfidTagsCoordinates.value = processedReaders;
  console.log(`Processed ${processedReaders.length} readers with ${totalTagCount.value} total tags`);
};
// Get color for tag cluster based on count
const getClusterColor = (count) => {
  if (count > 100) return '#F44336'; // Red for 100+
  if (count > 50) return '#FF9800';  // Orange for 51-100
  if (count > 20) return '#4CAF50';  // Green for 21-50
  return '#42A5F5';                  // Blue for 1-20
};
// Get size for tag cluster based on count
const getClusterSize = (count) => {
  const baseSize = 24;
  if (count > 100) return baseSize * 2;      // Largest
  if (count > 50) return baseSize * 1.75;    // Large
  if (count > 20) return baseSize * 1.5;     // Medium
  if (count > 5) return baseSize * 1.25;     // Medium-small
  return baseSize;                           // Smallest
};
const showClusterDetails = (cluster) => {
  console.log("Cluster clicked:", cluster);
  selectedCluster.value = cluster;
  showDebugDetails.value = true;
};
// Add these refs if not already present
const selectedCluster = ref(null);
const getTagMarkerStyle = (cluster) => {
  console.log(`===== MARKER POSITIONING FOR CLUSTER ${cluster.readerSerialNumber} =====`);
  console.log(`Cluster coordinates: x=${cluster.x_coordinate}, y=${cluster.y_coordinate}`);
  // Get the image element to calculate proper scaling
  const mapImage = document.querySelector('#rfid-map-container .organization-map');
  if (!mapImage) {
    console.error("Map image element not found!");
    return { display: 'none' };
  }
  // Log image load state
  console.log(`Image complete: ${mapImage.complete}`);
  console.log(`Image natural dimensions: ${mapImage.naturalWidth}x${mapImage.naturalHeight}`);
  if (!mapImage.complete || !mapImage.naturalWidth) {
    console.warn("Image not fully loaded, deferring marker positioning");
    return { display: 'none' };
  }
  // Get container dimensions
  const container = mapImage.parentElement;
  const containerRect = container.getBoundingClientRect();
  const imgRect = mapImage.getBoundingClientRect();
  console.log(`Container dimensions: ${containerRect.width}x${containerRect.height}`);
  console.log(`Image display dimensions: ${imgRect.width}x${imgRect.height}`);
  // Calculate aspect ratios
  const imgAspectRatio = mapImage.naturalWidth / mapImage.naturalHeight;
  const containerAspectRatio = containerRect.width / containerRect.height;
  console.log(`Image aspect ratio: ${imgAspectRatio.toFixed(4)}`);
  console.log(`Container aspect ratio: ${containerAspectRatio.toFixed(4)}`);
  // Calculate letterboxing
  let offsetX = 0, offsetY = 0;
  let scaledWidth, scaledHeight;
  if (imgAspectRatio > containerAspectRatio) {
    // Image is wider than container (letterboxing on top/bottom)
    scaledWidth = imgRect.width;
    scaledHeight = imgRect.width / imgAspectRatio;
    offsetY = (imgRect.height - scaledHeight) / 2;
    console.log(`Letterboxing on top/bottom`);
    console.log(`Scaled dimensions: ${scaledWidth.toFixed(2)}x${scaledHeight.toFixed(2)}`);
    console.log(`Vertical offset (Y): ${offsetY.toFixed(2)}px`);
  } else {
    // Image is taller than container (letterboxing on sides)
    scaledHeight = imgRect.height;
    scaledWidth = imgRect.height * imgAspectRatio;
    offsetX = (imgRect.width - scaledWidth) / 2;
    console.log(`Letterboxing on sides`);
    console.log(`Scaled dimensions: ${scaledWidth.toFixed(2)}x${scaledHeight.toFixed(2)}`);
    console.log(`Horizontal offset (X): ${offsetX.toFixed(2)}px`);
  }
  // Calculate the scaling factors
  const scaleX = scaledWidth / mapImage.naturalWidth;
  const scaleY = scaledHeight / mapImage.naturalHeight;
  console.log(`Scaling factors: X=${scaleX.toFixed(4)}, Y=${scaleY.toFixed(4)}`);
  // Convert the coordinates (accounting for both scaling and offset)
  const pixelX = (cluster.x_coordinate * scaleX) + offsetX;
  const pixelY = (cluster.y_coordinate * scaleY) + offsetY;
  // Convert to percentages relative to container
  const percentX = (pixelX / imgRect.width) * 100;
  const percentY = (pixelY / imgRect.height) * 100;
  console.log(`Converted coordinates:`);
  console.log(`  - Pixels: (${pixelX.toFixed(2)}, ${pixelY.toFixed(2)})`);
  console.log(`  - Percent: (${percentX.toFixed(2)}%, ${percentY.toFixed(2)}%)`);
  return {
    position: 'absolute',
    left: `${percentX}%`,
    top: `${percentY}%`,
    transform: 'translate(-50%, -50%)',
    zIndex: 25,
    pointerEvents: 'auto'
  };
};

const onHeatmapImageLoad = (event) => {
  const img = event.target;
  console.log(`===== HEAT MAP IMAGE LOADED =====`);
  console.log(`Natural dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
  console.log(`Display dimensions: ${img.width}x${img.height}`);
  console.log(`Complete: ${img.complete}`);
  // Force a recalculation of cluster positions after image load
  nextTick(() => {
    console.log("Recalculating RFID tag positions after image load");
    if (rfidTagsCoordinates.value && rfidTagsCoordinates.value.length > 0) {
      // Force Vue to update by creating a shallow copy
      rfidTagsCoordinates.value = [...rfidTagsCoordinates.value];
    }
  });
};
const page = ref(1);
const itemsPerPage = ref(10);
const searchTag = ref("");
// Calculate the total number of pages
const pageCount = computed(() => {
  if (itemsPerPage.value === -1) return 1;
  return Math.ceil(filteredTags.value.length / itemsPerPage.value);
});
// Generate pagination text (e.g., "1-5 of 10")
const getPaginationText = () => {
  if (filteredTags.value.length === 0) return '0-0 of 0';
  if (itemsPerPage.value === -1) return `1-${filteredTags.value.length} of ${filteredTags.value.length}`;
  const start = (page.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(page.value * itemsPerPage.value, filteredTags.value.length);
  return `${start}-${end} of ${filteredTags.value.length}`;
};
const tagHeaders = computed(() => [
  { title: t('index'), key: 'index', align: 'start', width: 80 },
  { title: t('supply_name'), key: 'supplyName' },
  { title: t('rfid_no'), key: 'rfidNumber' },
  { title: t('tracking_status'), key: 'trackingStatus', align: 'center' }
]);
// Add index to the filtered tags
const filteredTags = computed(() => {
  if (!selectedCluster.value || !selectedCluster.value.tags) return [];
  return selectedCluster.value.tags
      .filter(tag =>
          searchTag.value === "" ||
          (tag.supplyName && tag.supplyName.toLowerCase().includes(searchTag.value.toLowerCase())) ||
          (tag.rfidNumber && tag.rfidNumber.toLowerCase().includes(searchTag.value.toLowerCase()))
      )
      .map((tag, index) => ({
        index: index + 1,
        supplyName: tag.supplyName,
        rfidNumber: tag.rfidNumber,
        trackingStatus: tag.trackingStatus
      }));
});
const getTrackingStatusColor = (status) => {
  switch (status) {
    case "ACTIVE": return "green";
    case "INACTIVE": return "orange";
    case "LOST": return "red";
    default: return "gray";
  }
};

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  await Promise.all([
    fetchDashboardData(),
    initializeReaderMapData(),
    initializeHeatMapData()
  ]);
  // Set up ResizeObserver for RFID Heat Map
  if (window.ResizeObserver) {
    const rfidMapObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        console.log("RFID Heat Map container size changed:", entry.contentRect.width, entry.contentRect.height);
        handleRFIDTagsResize();
      }
    });
    setTimeout(() => {
      const rfidMapContainer = document.querySelector('#rfid-map-container .organization-map');
      if (rfidMapContainer) {
        rfidMapObserver.observe(rfidMapContainer);
      }
    }, 1000);
  }

  // Set up ResizeObserver for Reader Location Map
  if (window.ResizeObserver) {
    const readerMapObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        console.log("Reader Location Map container size changed:", entry.contentRect.width, entry.contentRect.height);
        handleReaderResize();
      }
    });
    setTimeout(() => {
      const readerMapContainer = document.querySelector('#reader-map-container .organization-map');
      if (readerMapContainer) {
        readerMapObserver.observe(readerMapContainer);
      }
    }, 1000);
  }
});
let readerResizeTimeout = null;
let rfidResizeTimeout = null;
const handleReaderResize = () => {
  if (readerResizeTimeout) clearTimeout(readerResizeTimeout);
  readerResizeTimeout = setTimeout(() => {
    console.log("== Debounced Reader Resize ==");

    if (readerCoordinates.value && readerCoordinates.value.length > 0) {
      readerCoordinates.value = [...readerCoordinates.value];
    }
  }, 1000); //Debounce , reduce coordinates calculation.
};
const handleRFIDTagsResize = () => {
  if (rfidResizeTimeout) clearTimeout(rfidResizeTimeout);

  rfidResizeTimeout = setTimeout(() => {
    console.log("== Debounced RFID Heatmap Resize ==");

    if (rfidTagsCoordinates.value && rfidTagsCoordinates.value.length > 0) {
      rfidTagsCoordinates.value = [...rfidTagsCoordinates.value];
    }
  }, 1000); //Debounce, reduce coordinates calculation.
};

// Add Hover to show Reader Details on Heat Map
const fetchReaderNotes = async (cluster) => {
  if (!cluster.readerSerialNumber || cluster.notesLoaded) return;

  try {
    const response = await api.get(`/api/rfid_readers/serial_number/${cluster.readerSerialNumber}/notes`);
    if (response.status === 200) {
      cluster.note = response.data;
    }
  } catch (error) {
    console.error("Error fetching reader notes:", error);
  } finally {
    cluster.notesLoaded = true; // always set this to avoid repeated requests
  }
};
const getClusterTooltip = (cluster) => {
  return `ID: ${cluster.readerSerialNumber}
Note: ${cluster.note || 'UNKNOWN'}`;
};

const hoveredCluster = ref(null);
const handleClusterHover = async (cluster) => {
  hoveredCluster.value = cluster;
  await fetchReaderNotes(cluster);
};


// Separate Organization Name for Reader Map and Tag Density Map
const readerMapOrgName = ref('');
const heatMapOrgName = ref('');
const translatedReaderMapOrgName = computed(() => {
  if (!readerMapOrgName.value) return '';
  return locale.value === 'th'
      ? readerMapOrgName.value?.th || readerMapOrgName.value
      : readerMapOrgName.value?.en || readerMapOrgName.value;
});
const translatedHeatMapOrgName = computed(() => {
  if (!heatMapOrgName.value) return '';
  return locale.value === 'th'
      ? heatMapOrgName.value?.th || heatMapOrgName.value
      : heatMapOrgName.value?.en || heatMapOrgName.value;
});



// New Dashboard 6-7-8

const totalData = ref({
  totalOrganizations: 0,
  totalSupplies: 0,
  totalReaders: 0,
  totalRfidTags: 0
});
const readerStatus = ref({
  readerOnline: 0,
  readerOffline: 0
});
const tagStats = ref([]);
const tagStats2 = ref([]);
const suppliesStats = ref([]);

const fetchDashboard6 = async () => {
  const res = await api.get('/api/dashboard', { params: { optionType: 6 } });
  console.log('Dashboard 6: ',res.data);
  totalData.value = res.data;
};

const fetchDashboard7 = async () => {
  const res = await api.get('/api/dashboard', { params: { optionType: 7 } });
  console.log('Dashboard 7: ',res.data);
  readerStatus.value = res.data;
};

const fetchDashboard8 = async () => {
  const res = await api.get('/api/dashboard', { params: { optionType: 8 } });
  console.log('Dashboard 8: ',res.data);
  const d = res.data;
  tagStats.value = [
    { label: 'dashboard.stats.readyTags', value: d.readyTags, color: 'purple-lighten-2' },
    { label: 'dashboard.stats.remainedTags', value: d.remainedTags, color: 'deep-purple-lighten-2' },
    { label: 'dashboard.stats.usingTags', value: d.usingTags, color: 'teal-lighten-2' },
    { label: 'dashboard.stats.usedTags', value: d.usedTags, color: 'blue-lighten-2' }
  ];
};

const fetchDashboard9 = async () => {
  const res = await api.get('/api/dashboard', { params: { optionType: 9 } });
  console.log('Dashboard 9: ',res.data);
  const d = res.data;
  suppliesStats.value = [
    { label: 'dashboard.stats.trackingActive', value: d.activeSupplies, color: 'purple-lighten-2' },
    { label: 'dashboard.stats.trackingInactive', value: d.inactiveSupplies, color: 'deep-purple-lighten-2' },
    { label: 'dashboard.stats.trackingLost', value: d.lostSupplies, color: 'teal-lighten-2' },
  ];
};

const fetchDashboard10 = async () => {
  const res = await api.get('/api/dashboard', { params: { optionType: 10 } });
  console.log('Dashboard 10: ',res.data);
  const d = res.data;
  tagStats2.value = [
    { label: 'dashboard_10_using', value: d.tagInUsing, color: 'purple-lighten-2' },
    { label: 'dashboard_10_remain', value: d.tagInRemaining, color: 'deep-purple-lighten-2' },
    { label: 'dashboard_10_damaged', value: d.tagDamaged, color: 'deep-purple-lighten-2' }
  ];
};

/*
let intervalId;
onMounted(async () => {
  await fetchAllDashboards();
  // Set interval for repeated fetches every 5 seconds
  intervalId = setInterval(() => {
    fetchAllDashboards();
  }, 5000);
});*/

const fetchAllDashboards = async () => {
  try {
    await Promise.all([
      fetchDashboard6(),
      fetchDashboard7(),
      fetchDashboard9(),
      fetchDashboard10()
    ]);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
  }
};

/*
onUnmounted(() => {
  // Clear the interval when component is destroyed
  if (intervalId) {
    clearInterval(intervalId);
  }
});*/

onMounted(async () => {
  await Promise.all([
    fetchDashboard6(),
    fetchDashboard7(),
    fetchDashboard9(),
    fetchDashboard10(),
  ]);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (resizeTimeout) clearTimeout(resizeTimeout);
  if (readerMapUrl.value) {
    URL.revokeObjectURL(readerMapUrl.value);
    readerMapUrl.value = null; // Ensure it's reset
  }
  if (heatMapUrl.value) {
    URL.revokeObjectURL(heatMapUrl.value);
    heatMapUrl.value = null; // Ensure it's reset
  }
});
</script>

<style scoped>
/* Vuetify 3 table styles */
:deep(.v-table) {
  background-color: #ffffff !important;
}
:deep(.v-table th) {
  color: rgba(2, 2, 2, 0.9) !important;
  background-color: #a6d6d6 !important;
  font-weight: bold;
  white-space: nowrap;
}
/* Hover effect */
:deep(.v-table tbody tr:hover td) {
  background: #ccccca !important;
}
.empty-state-container {
  padding: 20px;
  border-radius: 8px;
  background-color: white;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed #e0e0e0;
}
.empty-state-container .v-icon {
  opacity: 0.5;
}
.v-card {
  transition: all 0.3s ease;
}
.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.error-card {
  background-color: rgb(254, 242, 242);
  border: 1px solid rgb(254, 226, 226);
}
.error-card:hover {
  transform: none;
}
.error-state-card {
  background-color: rgb(254, 242, 242);
  border: 1px solid rgb(254, 226, 226);
  height: 100%;
}
.error-state-card.small {
  min-height: 100px;
}
.error-state-card.medium {
  min-height: 150px;
}
.error-state-card.large {
  min-height: 200px;
}
.retry-button {
  text-transform: none;
  letter-spacing: normal;
}
.error-state-card:hover {
  transform: none !important;
  box-shadow: none !important;
}
@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px solid rgb(142, 142, 139);
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f5f5;
}
.organization-map {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.organization-map.fullscreen {
  object-fit: contain;
  max-height: calc(100vh - 200px);
  border: 2px solid #b3b1b1;
  border-radius: 5px; /* Optional: Rounded edges */
}
.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 2;
}
.fullscreen-card {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  margin: 16px;
  transition: all 0.3s ease;
}
.position-relative {
  position: relative;
}
.h-100 {
  height: 100%;
}
.chart-fullscreen-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}
.fullscreen-card-chart {
  margin: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.reader-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 2;
  transition: all 0.3s ease;
}
.reader-marker:hover {
  transform: translate(-50%, -50%) scale(1.2);
  z-index: 3;
}
/* Add blinking effect for online/offline status */
.reader-marker .v-icon {
  animation: blink 2s infinite;
}
@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}
.blinking {
  animation: blink 5s infinite;
}
/* Different blink speeds based on status */
.reader-marker .status-online {
  animation: blink 2s infinite;
}
.reader-marker .status-offline {
  animation: blink 1s infinite;
}
/* Optional: Pulsing effect */
.reader-marker::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: pulse 2s infinite;
  z-index: -1;
}
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}
.reader-loading,
.reader-error {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px;
  border-radius: 4px;
}

/* Improve navigation buttons visibility and interaction */
.map-navigation-btn {
  z-index: 20 !important; /* Ensure buttons are on top */
  background-color: rgba(255, 255, 255, 0.7) !important; /* Semi-transparent background */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important; /* Add shadow for depth */
  transition: all 0.2s ease !important;
}

.map-navigation-btn:hover {
  background-color: rgba(255, 255, 255, 0.9) !important;
  transform: translateY(-50%) scale(1.1) !important;
}

.map-navigation-btn:active {
  transform: translateY(-50%) scale(0.95) !important;
}
.debug-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  z-index: 100;
  max-width: 80%;
}
.rfid-test-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
}
.rfid-test-container .test-marker {
  pointer-events: auto;
  cursor: pointer;
}
.tag-loading, .tag-error {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px;
  border-radius: 4px;
}
.tag-cluster {
  position: absolute;
  z-index: 25;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.5s ease-out; /* Smooth transition */
}
.cluster-marker {
  pointer-events: auto;
  cursor: pointer;
}
.tag-cluster .cluster-marker:hover {
  transform: scale(1.1);
  cursor: pointer;
}
.tag-cluster .cluster-marker {
  animation: blink 1s infinite;
}
.tag-cluster .cluster-marker {
  animation: blink 2s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
  cursor: pointer;
}
.tag-cluster .cluster-marker:hover {
  transform: scale(1.1);
}
.cluster-count {
  color: white;
  font-weight: bold;
  font-size: 12px;
}
.tag-count-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}
.map-legend {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px;
  border-radius: 4px;
  z-index: 10;
  font-size: 12px;
}
.legend-title {
  font-weight: bold;
  margin-bottom: 4px;
}
.legend-item {
  display: flex;
  align-items: center;
  margin-top: 2px;
}
.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
}
.top-left-icon {
  top: 8px;
  left: 8px;
  position: absolute;
}
</style>
