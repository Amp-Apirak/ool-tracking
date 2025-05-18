<!-- SupplyDetailsTabs.vue -->

<template>
  <v-card>
    <v-tabs v-model="activeTab" class="folder-tabs mb-0" show-arrows centered>
      <v-tab value="map">{{ t('map') }}</v-tab>
      <v-tab value="floorplan">{{ t('floor_plan') }}</v-tab>
      <v-tab value="requisition">{{ t('requisition_status') }}</v-tab>
      <v-tab value="alerts">{{ t('alerts') }}</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="activeTab">

        <!-- Map Tab -->
        <v-window-item value="map">
          <div class="map-container">
            <img :src="mapImageUrl" alt="Organization Map" class="map-image" />
          </div>
        </v-window-item>

        <!-- Floor Plan Tab -->
        <v-window-item value="floorplan">
          <div class="text-subtitle-1 mb-4">{{ t('floor_plan_support_text') }}</div>

          <!-- Map section in a row/col structure - identical to Supply dialog -->
          <v-row>
            <v-col cols="12">
              <v-sheet
                  class="map-preview-area d-flex align-center justify-center position-relative"
                  color="grey-lighten-3"
                  rounded
                  height="600px"
                  width="100%"
                  style="max-width: 1200px; margin: 0 auto;"
              >
                <v-img
                    v-if="floorPlanImageUrl"
                    :src="floorPlanImageUrl"
                    contain
                    height="100%"
                    width="100%"
                    @load="adjustFloorPlanMarkerPosition"
                    class="cursor-pointer"
                />
                <!-- Map Marker -->
                <v-icon
                    v-if="floorPlanCoordinates"
                    color="red"
                    size="48"
                    class="position-absolute blink"
                    :style="getFloorPlanMarkerStyle"
                >
                  mdi-map-marker
                </v-icon>
                <!-- No Map Available Text -->
                <div
                    v-if="!floorPlanImageUrl"
                    class="text-grey position-absolute w-100 text-center"
                    style="top: 50%; transform: translateY(-50%); font-size: 1.2rem;"
                >
                  {{ t('no_floor_plan_available') }}
                </div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Requisition Status Tab -->
        <v-window-item value="requisition">
          <v-data-table-server
              v-model:page="requisitionOptions.page"
              v-model:items-per-page="requisitionOptions.itemsPerPage"
              :headers="requisitionHeaders"
              :items="requisitionItems"
              :items-length="totalRequisitions"
              :loading="loading"
              :items-per-page-options="[5, 10, 25]"
              items-per-page-text="Items per page"
              class="elevation-1 custom-table"
              @update:items-per-page="fetchRequisitionData"
          >
            <!-- Add status chip template -->
            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)">
                {{ item.status }}
              </v-chip>
            </template>
          </v-data-table-server>
        </v-window-item>

        <!-- Alerts Tab -->
        <v-window-item value="alerts">
          <v-data-table-server
              v-model:page="alertOptions.page"
              v-model:items-per-page="alertOptions.itemsPerPage"
              :headers="alertHeaders"
              :items="alertItems"
              :items-length="totalAlerts"
              :loading="loading"
              :items-per-page-options="[5, 10, 25]"
              items-per-page-text="Items per page"
              class="elevation-1 custom-table-alert"
              @update:items-per-page="fetchAlerts"
              @update:options="handleAlertOptionsUpdate"
          >
            <!-- Image Column -->
            <template v-slot:[`item.image`]="{ item }">
              <div class="d-flex justify-center align-center">
                <v-img
                    :src="getAlertImage(item.alertType)"
                    height="120"
                    width="150"
                    contain
                    class="alert-image"
                />
              </div>
            </template>

            <!-- Hierarchy Column with Localization -->
            <template v-slot:[`item.hierarchy`]="{ item }">
              <div v-if="item.hierarchy">
                <div v-for="(level, key) in item.hierarchy.hierarchyLevels" :key="key">
                  <strong>{{ t(key) }}:</strong> {{ level.translations[locale] || '-' }}
                </div>
              </div>
              <span v-else>NA</span>
            </template>

            <!-- Supply Details Column -->
            <template v-slot:[`item.supply`]="{ item }">
              <div v-if="item.supply">
                <div><strong>{{ t('supply_number') }}:</strong> {{ item.supply.supplyNumber }}</div>
                <div><strong>{{ t('supply_name') }}:</strong> {{ item.supply.supplyName }}</div>
                <div><strong>{{ t('supply_model') }}:</strong> {{ item.supply.supplyModel }}</div>
                <div><strong>{{ t('supply_type') }}:</strong> {{ item.supply.supplyType }}</div>
                <div><strong>{{ t('rfid_tag') }}:</strong> {{ item.supply.rfidTagName || '-' }}</div>
              </div>
              <span v-else>N/A</span>
            </template>
          </v-data-table-server>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
import {ref, onMounted, watch, computed, nextTick, onUnmounted} from 'vue';
import { useI18n } from 'vue-i18n';
import api from "@/axiostoastapi.js";

const { t, locale } = useI18n();

const props = defineProps({
  supply: Object,
  status: String,
  rootOrganizationId: String,
  lowestOrganizationId: String
});

const activeTab = ref('map');
const loading = ref(false);

// Map and Floor Plan
const floorPlanImageUrl = ref('');
const mapImageUrl = ref(null);
const floorPlanCoordinates = ref(null);

// Default floor plan dimensions (set when the image loads)
const floorPlanWidth = ref(0);
const floorPlanHeight = ref(0);

// Requisition Data
const requisitionItems = ref([]);
const totalRequisitions = ref(0);
const requisitionOptions = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  totalItems: 0
});
const requisitionHeaders = [
  { title: t('supply_number'), key: 'supply_number' },
  { title: t('supply_name'), key: 'supply_name' },
  { title: t('quantity'), key: 'quantity' },
  { title: t('unit'), key: 'unit_of_measure' },
  { title: t('status'), key: 'tracking_status' },
  { title: t('requisition_status'), key: 'requisition_status' },
  { title: t('received_date'), key: 'received_date' },
  { title: t('received_by'), key: 'received_by' },
];

// Alert Data
const alertItems = ref([]);
const totalAlerts = ref(0);
const alertOptions = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  totalItems: 0
});
const alertHeaders = computed(() => [
  { title: t('image'), key: 'image', sortable: false, align: 'center' },
  { title: t('alert_time'), key: 'alertTimestamp', sortable: true, align: 'center' },
  { title: t('hierarchy'), key: 'hierarchy', sortable: false },
  { title: t('supply_details'), key: 'supply', sortable: false }
]);

// Floor Plan Marker Style - using same approach as Supply page
const getFloorPlanMarkerStyle = computed(() => {
  if (!floorPlanCoordinates.value) return {};
  return {
    top: `${floorPlanCoordinates.value.y}%`,
    left: `${floorPlanCoordinates.value.x}%`,
    transform: "translate(-50%, -100%)",
    position: "absolute",
  };
});

// Status color helper
const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'active': return 'success';
    case 'inactive': return 'grey';
    case 'ready': return 'info';
    default: return 'grey';
  }
};

// Helper for alert images
const getAlertImage = (alertType) => {
  return `${import.meta.env.VITE_APP_BASE_PATH}/icons/${alertType}.png`;
};

// Fetch map image
const fetchMapImage = async () => {
  if (!props.rootOrganizationId) {
    console.warn('No root organization UUID provided for fetching map.');
    mapImageUrl.value = null;
    return;
  }

  console.log('Fetching image for organization UUID:', props.rootOrganizationId);

  try {
    const response = await api.get(
        `/api/organization-maps/org/${props.rootOrganizationId}`,
        { responseType: 'blob' }
    );

    if (response.status === 200) {
      mapImageUrl.value = URL.createObjectURL(response.data);
      console.log('Map image fetched successfully.');
    } else {
      console.warn('Unexpected response status:', response.status);
      mapImageUrl.value = null;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('Map not found for organization UUID:', props.rootOrganizationId);
      mapImageUrl.value = null;
    } else {
      console.error('Error fetching map:', error);
    }
  }
};

// Fetch floor plan image
const fetchFloorPlanImage = async () => {
  if (!props.lowestOrganizationId) {
    console.warn('No lowest organization UUID provided for fetching floor plan.');
    floorPlanImageUrl.value = null;
    return;
  }

  console.log('Fetching image for organization UUID:', props.lowestOrganizationId);

  try {
    const response = await api.get(
        `/api/organization-maps/org/${props.lowestOrganizationId}`,
        { responseType: 'blob' }
    );

    if (response.status === 200) {
      floorPlanImageUrl.value = URL.createObjectURL(response.data);
      console.log('Floor plan image fetched successfully.');
    } else {
      console.warn('Unexpected response status:', response.status);
      floorPlanImageUrl.value = null;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('Floor plan not found for organization UUID:', props.lowestOrganizationId);
      floorPlanImageUrl.value = null;
    } else {
      console.error('Error fetching floor plan:', error);
    }
  }
};

// Fetch supply coordinates
const fetchSupplyCoordinates = async () => {
  if (!props.supply?.id) {
    console.warn('No supply ID provided for fetching coordinates.');
    floorPlanCoordinates.value = null;
    return;
  }

  try {
    console.log('Fetching coordinates for supply:', props.supply.id);
    const response = await api.get(`/api/supply-coordinates/${props.supply.id}`);

    if (response.status === 200 && response.data) {
      console.log('Supply coordinates retrieved:', response.data);
      floorPlanCoordinates.value = {
        x: response.data.x,
        y: response.data.y
      };
    } else {
      console.warn('No coordinates found for this supply');
      floorPlanCoordinates.value = null;
    }
  } catch (error) {
    console.error('Error fetching supply coordinates:', error);
    floorPlanCoordinates.value = null;
  }
};

// Add a fallback method to ensure dimensions are set - similar to Supply page
const ensureFloorPlanDimensions = () => {
  if (floorPlanWidth.value === 0 || floorPlanHeight.value === 0) {
    // Try to get the image by selector
    const imgElement = document.querySelector('.map-preview-area img');
    if (imgElement && imgElement.complete) {
      floorPlanWidth.value = imgElement.naturalWidth || 0;
      floorPlanHeight.value = imgElement.naturalHeight || 0;
      console.log(`🗺️ Floor plan dimensions set by fallback: ${floorPlanWidth.value}x${floorPlanHeight.value}`);
    }
  }
};

// Using the same approach as Supply page for adjustMapMarkerPosition
const adjustFloorPlanMarkerPosition = (event) => {
  // Check if event exists and has a target property
  if (event && event.target) {
    const img = event.target;
    floorPlanWidth.value = img.naturalWidth || 0;
    floorPlanHeight.value = img.naturalHeight || 0;
    console.log(`Floor plan loaded. Dimensions: ${floorPlanWidth.value}x${floorPlanHeight.value}`);
  } else {
    // If called without a valid event, try to get the image by other means
    console.log('Floor plan event missing, using alternative method');
    ensureFloorPlanDimensions();
  }
};

// Fetch requisition data
const fetchRequisitionData = async () => {
  if (!props.supply?.id) {
    console.warn("Supply ID is missing, skipping API call.");
    return;
  }

  try {
    loading.value = true;
    const response = await api.get(`/api/supply/${props.supply.id}/requisitions`, {
      params: {
        page: requisitionOptions.value.page - 1,
        itemsPerPage: requisitionOptions.value.itemsPerPage,
        sortBy: requisitionOptions.value.sortBy[0]?.key || '',
        sortDesc: requisitionOptions.value.sortBy[0]?.order === 'desc'
      }
    });
    requisitionItems.value = response.data.content;
    totalRequisitions.value = response.data.totalElements;
  } catch (error) {
    console.error('Error fetching requisition data:', error);
  } finally {
    loading.value = false;
  }
};

// Handle requisition options update
const handleRequisitionOptionsUpdate = async (options) => {
  loading.value = true;
  try {
    const response = await api.get(`/api/supply/${props.supply.id}/requisitions`, {
      params: {
        page: options.page - 1,
        size: options.itemsPerPage,
        sort: options.sortBy[0]?.key || 'id',
        direction: options.sortBy[0]?.order === 'desc' ? 'desc' : 'asc'
      }
    });

    requisitionItems.value = response.data.content;
    totalRequisitions.value = response.data.totalElements;
  } catch (error) {
    console.error('Error fetching requisitions:', error);
  } finally {
    loading.value = false;
  }
};

// Fetch alerts
const fetchAlerts = async () => {
  if (!props.supply?.id) {
    console.warn("No supply ID provided for fetching alerts.");
    return;
  }

  loading.value = true;
  try {
    const response = await api.get(`/api/alert/supply/${props.supply.id}`, {
      params: {
        page: alertOptions.value.page - 1,
        itemsPerPage: alertOptions.value.itemsPerPage,
        sortBy: "alertTimestamp",
        sortDesc: true
      },
    });

    console.log("Filtered Alerts:", response.data);
    alertItems.value = response.data.content;
    totalAlerts.value = response.data.totalElements;
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
  } finally {
    loading.value = false;
  }
};

// Handle alert options update
const handleAlertOptionsUpdate = async (options) => {
  loading.value = true;
  try {
    const response = await api.get(`/api/alert/supply/${props.supply.id}`, {
      params: {
        page: options.page - 1,
        itemsPerPage: options.itemsPerPage,
        sortBy: options.sortBy[0]?.key || "alertTimestamp",
        sortDesc: options.sortBy[0]?.order === "desc"
      },
    });

    console.log("Filtered Alerts:", response.data);
    alertItems.value = response.data.content;
    totalAlerts.value = response.data.totalElements;
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
  } finally {
    loading.value = false;
  }
};

// Watch for tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'floorplan' && props.supply?.id && !floorPlanCoordinates.value) {
    console.log('Floor plan tab activated, fetching coordinates');
    setTimeout(() => {
      fetchSupplyCoordinates();
    }, 200); // Small delay to ensure tab is fully activated
  }
});

// Watch for supply changes
watch(() => props.supply, () => {
  if (props.supply) {
    handleRequisitionOptionsUpdate(requisitionOptions.value);
    // Reset coordinates when supply changes
    floorPlanCoordinates.value = null;
  }
}, { immediate: true });

// Cleanup function for resources
const cleanupResources = () => {
  if (mapImageUrl.value) {
    URL.revokeObjectURL(mapImageUrl.value);
    mapImageUrl.value = null;
  }
  if (floorPlanImageUrl.value) {
    URL.revokeObjectURL(floorPlanImageUrl.value);
    floorPlanImageUrl.value = null;
  }
  floorPlanCoordinates.value = null;
};

// Lifecycle hooks
onMounted(() => {
  console.log('Root Organization UUID:', props.rootOrganizationId);
  console.log('Lowest Organization UUID:', props.lowestOrganizationId);

  // Fetch initial data
  if (props.supply) {
    fetchAlerts();
    if (activeTab.value === 'floorplan') {
      fetchSupplyCoordinates();
    }
  }

  fetchMapImage();
  fetchFloorPlanImage();
});

// Clean up resources when component is unmounted
onUnmounted(() => {
  cleanupResources();
});

</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
  position: relative; /* Important for absolute positioning of the marker */
}
.map-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.position-absolute {
  position: absolute;
}
/* Ensure the supply marker appears above the image */
.supply-marker {
  z-index: 10;
}
.folder-tabs {
  background-color: #f5f5f5;
  border-bottom: 2px solid #ccc;
  margin-bottom: 16px;
}
.v-tab:hover {
  background-color: #1B5E20; /* Slightly darker green for hover state */
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
/* Custom table styles */
:deep(.custom-table) {
  background-color: #ffffff !important;
}
:deep(.custom-table th) {
  color: rgba(2, 2, 2, 0.9) !important;
  background-color: #a6d6d6 !important;
  font-weight: bold;
  white-space: nowrap;
}
/* Hover effect */
:deep(.custom-table tbody tr:hover td) {
  background: #ccccca;
}
.cursor-pointer {
  cursor: pointer;
}
:deep(.v-data-table-footer__items-per-page .v-select) {
  min-width: 120px;
}
/* Fix items per page width */
:deep(.v-data-table-footer__items-per-page) {
  min-width: 150px !important;
}
/* Apply background color only to this specific table */
:deep(.custom-table-alert tbody tr) {
  background-color: #fce8e6 !important; /* Permanent light pink */
}
/* Adjust hover to be slightly darker */
:deep(.custom-table-alert tbody tr:hover) {
  background-color: #f8d7da !important;
  cursor: pointer; /* Show pointer to indicate clickable row */
}
/* Style headers */
:deep(.custom-table-alert th) {
  color: rgba(2, 2, 2, 0.9) !important;
  background-color: #a6d6d6 !important;
  font-weight: bold;
}
.blink {
  animation: blink 2s infinite;
}
@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>