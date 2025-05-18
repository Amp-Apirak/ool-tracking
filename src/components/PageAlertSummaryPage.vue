<!-- PageAlertSummaryPage.vue -->

<template>
  <v-container fluid>
    <!-- Header -->
    <v-card class="mb-4">
      <HeaderCommon :title="t('alert_summary_page')" />
    </v-card>

    <!-- Section 2 & 3: Search Filters -->
    <v-card class="mb-4">
      <v-card-title>{{ t('search') }}</v-card-title>
      <v-card-text>
        <!-- First Row -->
        <v-row>
          <!-- Search Text -->
          <v-col cols="12" md="3">
            <v-text-field v-model="searchText" :label="t('type_to_search')" clearable hide-details variant="outlined" density="comfortable"></v-text-field>
          </v-col>
          <!-- Start Date -->
          <v-col cols="12" md="2">
            <v-text-field v-model="startDate" :label="t('start_date')" type="date" clearable hide-details variant="outlined" density="comfortable"></v-text-field>
          </v-col>
          <!-- End Date -->
          <v-col cols="12" md="2">
            <v-text-field v-model="endDate" :label="t('end_date')" type="date" clearable hide-details variant="outlined" density="comfortable"></v-text-field>
          </v-col>

          <!-- select_alert_type -->
          <v-col cols="12" md="2">
            <v-select v-model="selectedAlertType" :items="alertType" :label="t('select_alert_type')" clearable hide-details variant="outlined" density="comfortable"></v-select>
          </v-col>

          <!-- select_material_type -->
          <v-col cols="12" md="3">
            <v-select v-model="selectedSupplyType" :items="supplyType" :item-title="s => s.typeName" :item-value="s => s.id"  :label="t('select_supply_type')" clearable hide-details variant="outlined" density="comfortable"></v-select>
          </v-col>

        </v-row>
        <!-- Second Row -->
        <v-row>
          <!-- Organization -->
          <v-col cols="12">
            <OrganizationHierarchySelect v-model="locationData" :organization-hierarchy="organizationHierarchy" context="search" :hide-details="true" @hierarchy-change="handleHierarchyChange"/>
          </v-col>
        </v-row>
        <!-- Third Row -->
        <v-row>
          <!-- select_material_type -->
          <!--
          <v-col cols="12" md="3">
            <v-select v-model="selectedSupplyType" :items="supplyType" :item-title="s => s.typeName" :item-value="s => s.id"  :label="t('select_supply_type')" clearable hide-details variant="outlined" density="comfortable"></v-select>
          </v-col>-->
          <!-- select_item -->
          <v-col cols="12" md="3">
            <v-select v-model="selectedSupplyNumber" :items="[]" :label="t('select_supply_number')" disabled hint="Disabled to prevent performance issues" clearable hide-details variant="outlined" density="comfortable"></v-select>
          </v-col>
          <!-- select_alert_type -->
          <!--
          <v-col cols="12" md="3">
            <v-select v-model="selectedAlertType" :items="alertType" :label="t('select_alert_type')" clearable hide-details variant="outlined" density="comfortable"></v-select>
          </v-col>-->
          <v-spacer> </v-spacer>
          <!-- Search Button -->
          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn color="primary" block @click="handleSearch">{{ t('search') }}</v-btn>
          </v-col>
          <!-- Clear Search Button -->
          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn color="primary" block @click="clearSearch">{{ t('clear_search') }}</v-btn>
          </v-col>
        </v-row>

      </v-card-text>
    </v-card>


    <!-- Alert Summary -->
    <v-col cols="12" md="6">
      <v-text-field
          :model-value="alertSummaryText"
          :label="t('alert_summary')"
          variant="outlined"
          readonly
          hide-details
          density="comfortable"
      />
    </v-col>

    <!-- Section 5: Data Table -->
    <v-data-table-server
        v-model:page="alertOptions.page"
        v-model:items-per-page="alertOptions.itemsPerPage"
        :headers="alertHeaders"
        :items="alertItems"
        :items-length="totalAlerts"
        :loading="loading"
        :items-per-page-options="[5, 10, 25, 50, 100]"
        items-per-page-text="Items per page"
        class="elevation-1 custom-table-alert"
        @update:items-per-page="fetchAlerts"
        @update:options="handleAlertOptionsUpdate"
    >
      <!-- Image Column -->
      <template v-slot:[`item.image`]="{ item }">
        <div class="d-flex justify-center align-center">
          <v-img :src="getAlertImage(item.alertType)" height="100" width="100" contain class="alert-image"/>
        </div>
      </template>

      <template v-slot:item.alertType="{ item }">
        <div class="d-flex flex-column" style="line-height: 2">
          {{ getAlertTypeTranslation(item.alertType) }}<br>
          <div class="d-flex align-items-center">
            {{ item.gateway }}
            <v-icon class="ms-2 cursor-pointer" color="red" @click="handleLocationClick(item)">mdi-map-marker-radius</v-icon>
          </div>
        </div>
      </template>

      <template v-slot:[`item.hierarchy`]="{ item }">
        <div v-if="item.alertHierarchy" class="d-flex flex-wrap">
          <div class="w-50">
            <div v-for="(level, index) in Object.entries(item.alertHierarchy.hierarchyLevels).slice(0, Math.ceil(Object.keys(item.alertHierarchy.hierarchyLevels).length / 2))"
                 :key="'left-' + index">
              <strong>{{ t(level[0]) }}:</strong> {{ level[1].translations[locale] || '-' }}
            </div>
          </div>
          <div class="w-50">
            <div v-for="(level, index) in Object.entries(item.alertHierarchy.hierarchyLevels).slice(Math.ceil(Object.keys(item.alertHierarchy.hierarchyLevels).length / 2))"
                 :key="'right-' + index">
              <strong>{{ t(level[0]) }}:</strong> {{ level[1].translations[locale] || '-' }}
            </div>
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

      <template v-slot:item.alertStatus="{ item }">
        {{ getAlertStatusTranslation(item.alertStatus) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
            icon
            variant="text"
            size="small"
            :color="getActionButtonColor(item.alertStatus)"
            :disabled="item.alertStatus === 'RESOLVED'"
            @click="handleAcknowledge(item)"
        >
          <v-icon>{{ getActionButtonIcon(item.alertStatus) }}</v-icon>
          <v-tooltip activator="parent">
            {{ item.alertStatus === 'NEW' ? t('acknowledge_alert') :
              item.alertStatus === 'ACKNOWLEDGED' ? t('resolve_alert') :
                  t('alert_resolved') }}
          </v-tooltip>
        </v-btn>
      </template>

      <template v-slot:item.temperature="{ item }">
        <span>{{ item.temperature ? Math.round(item.temperature) : '' }}</span>
      </template>

    </v-data-table-server>

  </v-container>

  <MapViewer
      v-if="showMapViewerDialog"
      :isVisible="showMapViewerDialog"
      :propsSupplyId="propsSupplyId"
      :propsSupplyNumber="propsSupplyNumber"
      :propsRfidNumber="propsRfidNumber"
      :propsReaderSerialNumber="propsReaderSerialNumber"
      :propsReaderData="propsReaderData"
      :propsCallerType="'alert'"
      @close="handleMapViewerClose"
  />

</template>

<script setup>
import {ref, onMounted, computed, watch, nextTick} from 'vue'
import { useI18n } from 'vue-i18n'
import api from "@/axiostoastapi.js";
import HeaderCommon from "@/components/HeaderCommon.vue";
import OrganizationHierarchySelect from '@/components/OrganizationHierarchySelectForAlertPage.vue';
import MapViewer from '@/components/MapViewer.vue'
import { showSuccess, showError, showInfo } from "@/utils/snackbar.js";

const showMapViewerDialog = ref(false)
const propsSupplyId = ref(null);
const propsRfidNumber = ref(null);
const propsSupplyNumber = ref(null);
const propsReaderSerialNumber = ref(null);
const propsReaderData = ref(null);
const { t, locale } = useI18n()
const organizationHierarchy = ref([]);
const locationData = ref({
  organizationId: null,
  armoryId: null,
  buildingId: null,
  floorId: null,
  zoneId: null,
  roomId: null,
  partitionId: null,
  shelfId: null,
  slotId: null
});
// Add this handler
const handleHierarchyChange = ({ level, value }) => {
  console.log(`Hierarchy changed: ${level} = ${value}`);
  // Update your search params based on hierarchy change
  handleSearch();
};

const handleMapViewerClose = () => {
  console.log('Map viewer closed');
  closeViewer()
};
const closeViewer = () => {
  showMapViewerDialog.value = false
}

// Fetch organization hierarchy
const fetchOrganizationHierarchy = async () => {
  try {
    const response = await api.get('/api/organization-hierarchies/9levels');
    organizationHierarchy.value = response.data;
  } catch (error) {
    console.error('Error fetching organization hierarchy:', error);
    showError(t('error_loading_organization_hierarchy'));
  }
};

// Table state
const loading = ref(false)
const alertOptions = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: "alertTimestamp",
  sortDesc: true,
});
const alertItems = ref([]);
const totalAlerts = ref(0);

const getAlertImage = (alertType) => {
  return `${import.meta.env.VITE_APP_BASE_PATH}/icons/${alertType}.png`;
};
const alertHeaders = computed(() => [
  { title: t('image'), key: 'image', sortable: false, align: 'center' },
  { title: t('alert_type'), key: 'alertType', sortable: false },
  { title: t('temperature'), key: 'temperature',  align: 'center', sortable: false },
  { title: t('alert_time'), key: 'alertTimestamp', sortable: true, align: 'center' },
  { title: t('hierarchy_registered'), key: 'hierarchy', sortable: false},
  { title: t('supply_details'), key: 'supply', sortable: false },
  { title: t('alert_status'), key: 'alertStatus', sortable: true },
  { title: t('column_actions'), key: "actions", sortable: false},
]);

const fetchAlerts = async () => {
  loading.value = true;
  // Create the params object
  const params = {
    page: alertOptions.value.page - 1,
    itemsPerPage: alertOptions.value.itemsPerPage,
    sortBy: alertOptions.value.sortBy || "alertTimestamp",
    sortDesc: alertOptions.value.sortDesc
  };
  // Add search filters
  if (searchText.value) params.searchText = searchText.value;
  if (startDate.value) params.startDate = startDate.value;
  if (endDate.value) params.endDate = endDate.value;
  if (selectedSupplyType.value) params.supplyType = selectedSupplyType.value;
  if (selectedSupplyNumber.value) params.supplyItem = selectedSupplyNumber.value;
  if (selectedAlertType.value) params.alertType = selectedAlertType.value;
  // Add location hierarchy filters
  Object.entries(locationData.value).forEach(([key, value]) => {
    if (value) params[key] = value;
  });
  console.log(params);
  try {
    const response = await api.get(`/api/alert`, { params });
    console.log("Filtered Alerts:", response.data);
    alertItems.value = response.data.content.map(alert => ({
      ...alert,
      alertHierarchy: alert.hierarchy,
    }));

    totalAlerts.value = response.data.totalElements;
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    showError(t('error_loading_alerts'));
  } finally {
    loading.value = false;
  }
};

// Search filters
const searchText = ref('')
const startDate = ref('')
const endDate = ref('')

const selectedSupplyType = ref(null);
const supplyType = ref([]);
const selectedSupplyNumber = ref(null);
const supplyNumber = ref([]);  // Will hold supply item options
const selectedAlertType = ref(null);
//const alertType = ref([]);   // Will hold alert type options
const alertType = ref([
  { title: t('temperature_alert'), value: 'TEMPERATURE' },
  { title: t('unauthorized_entry_alert'), value: 'UNAUTHORIZED_ENTER' },
  { title: t('unauthorized_exit_alert'), value: 'UNAUTHORIZED_EXIT' },
  { title: t('offline_alert'), value: 'OFFLINE' }
]);
const fetchSupplyTypes = async () => {
  try {
    // Fetch only supply type names
    const typesResponse = await api.get('/api/supply-type/type_name_dto');
    console.log("Supply Type Names:", typesResponse.data);
    supplyType.value = typesResponse.data
    console.log("Supply Type Options Names after Gateway filtered:", supplyType.value);
  } catch (error) {
    console.error('Error fetching options:', error);
    showError(t('error_loading_options'));
  }
};

// Event handlers
const handleAlertOptionsUpdate = async (options) => {
  console.log("Sorting triggered:", options.sortBy);
  alertOptions.value.page = options.page;
  alertOptions.value.itemsPerPage = options.itemsPerPage;
  alertOptions.value.sortBy = options.sortBy.length > 0 ? options.sortBy[0].key : "alertTimestamp";
  alertOptions.value.sortDesc = options.sortBy.length > 0 ? options.sortBy[0].order === "desc" : true;
  await fetchAlerts();
};

const handleSearch = async () => {
  alertOptions.value.page = 1;
  await fetchAlerts();
}

const exportReport = async (format) => {
  console.log("Export Report:", format);
  showInfo(t('feature_not_supported_yet') + ` (${format})`);
}

const getAlertTypeTranslation = (alertType) => {
  const alertTypeMap = {
    'TEMPERATURE': t('temperature_alert'),
    'UNAUTHORIZED_ENTER': t('unauthorized_entry_alert'),
    'UNAUTHORIZED_EXIT': t('unauthorized_exit_alert'),
    'OFFLINE': t('offline_alert')
  };
  return alertTypeMap[alertType] || alertType;
};
const getAlertStatusTranslation = (status) => {
  const statusMap = {
    'NEW': t('alert_status_new'),
    'ACKNOWLEDGED': t('alert_status_acknowledged'),
    'RESOLVED': t('alert_status_resolved')
  };
  return statusMap[status] || status;
};
const alertStatusOptions = ref([
  { title: t('alert_status_new'), value: 'NEW' },
  { title: t('alert_status_acknowledged'), value: 'ACKNOWLEDGED' },
  { title: t('alert_status_resolved'), value: 'RESOLVED' }
]);

const handleLocationClick = (item) => {
  console.log('Location clicked for:', item);

  if (!item.supply) {
    console.warn('Supply data is missing for this alert.');
    return;
  }

  showMapViewerDialog.value = false;

  nextTick(() => {
    propsSupplyId.value = item.supply.supplyId ?? "-";
    propsSupplyNumber.value = item.supply.supplyNumber ?? "-";
    propsRfidNumber.value = item.supply.rfidTagName ?? "-";
    propsReaderSerialNumber.value = item.gateway;

    // Set the reader data with hierarchy information from the alert
    propsReaderData.value = {
      readerSerialNumber: item.gateway,
      hierarchy: item.alertHierarchy // This contains the hierarchyLevels structure
    };

    console.log("Supply ID:", propsSupplyId.value);
    console.log("Supply Number:", propsSupplyNumber.value);
    console.log("RFID Number:", propsRfidNumber.value);
    console.log("Reader Serial Number:", propsReaderSerialNumber.value);
    console.log("Reader Data with Hierarchy:", propsReaderData.value);

    showMapViewerDialog.value = true;
  });
};

const clearSearch = () => {
  console.log("Clearing search filters");

  // Reset all search filters
  searchText.value = '';
  startDate.value = '';
  endDate.value = '';
  selectedSupplyType.value = null;
  selectedSupplyNumber.value = null;
  selectedAlertType.value = null;

  // Reset location hierarchy
  locationData.value = {
    organizationId: null,
    armoryId: null,
    buildingId: null,
    floorId: null,
    zoneId: null,
    roomId: null,
    partitionId: null,
    shelfId: null,
    slotId: null
  };

  // Reset to first page and default items per page
  alertOptions.value.page = 1;

  // Show feedback to user
  showSuccess(t('search_cleared'));

  // Fetch alerts with cleared filters
  fetchAlerts();
};

const getActionButtonColor = (status) => {
  switch (status) {
    case 'NEW':
      return 'error'; // Red for new alerts
    case 'ACKNOWLEDGED':
      return 'warning'; // Orange/yellow for acknowledged
    case 'RESOLVED':
      return 'success'; // Green for resolved
    default:
      return 'error';
  }
};

const getActionButtonIcon = (status) => {
  switch (status) {
    case 'NEW':
      return 'mdi-check-circle-outline'; // Checkmark for new alerts
    case 'ACKNOWLEDGED':
      return 'mdi-check-circle'; // Filled checkmark for acknowledged
    case 'RESOLVED':
      return 'mdi-check-circle'; // Filled checkmark for resolved
    default:
      return 'mdi-check-circle-outline';
  }
};

// Update the handleAcknowledge function to handle different alert statuses
const handleAcknowledge = async (item) => {
  try {
    console.log('Acknowledge:', item.id);

    // Different actions based on current status
    if (item.alertStatus === 'NEW') {
      await api.put(`/api/alert/acknowledge/${item.id}`);

      // Update the local state to reflect the change
      const index = alertItems.value.findIndex(alert => alert.id === item.id);
      if (index !== -1) {
        alertItems.value[index].alertStatus = 'ACKNOWLEDGED';
      }

      showSuccess(t('alert_acknowledged_success'));
    }
    else if (item.alertStatus === 'ACKNOWLEDGED') {
      // Check the alert type - only show auto-resolve message for Temperature and Offline alerts
      if (item.alertType === 'TEMPERATURE') {
        //showInfo(t('temperature_auto_resolve_message') || 'Automatically resolved when temperature falls within limit');
        showInfo(t('temperature_resolve_info') || 'Temperature alert resolved. No new alert will be created unless threshold exceeded again.');
        //return; // Return early without making API call
      }
      else if (item.alertType === 'OFFLINE') {
        showInfo(t('offline_auto_resolve_message') || 'Automatically resolved when reader comes back online');
        return; // Return early without making API call
      }

      // Manual Resolve --> UnAuthorizedEnter/Exit
      // Automatic Resolve --> OFFLINE, TEMPERATURE

      // For other alert types, proceed with manual resolution
      await api.put(`/api/alert/resolve/${item.id}`);

      // Update the local state
      const index = alertItems.value.findIndex(alert => alert.id === item.id);
      if (index !== -1) {
        alertItems.value[index].alertStatus = 'RESOLVED';
      }

      showSuccess(t('alert_resolved_success'));
    }
    // No action for RESOLVED status as button would be disabled

  } catch (error) {
    console.error('Error updating alert status:', error);
    showError(t('error_updating_alert_status'));
  }
};

// Fetch Alert Summary
const alertSummary = ref (null);

const fetchAlertSummary = async () => {

  try {

    const response = await api.get(`/api/alert/summary`);
    console.log('Alert Summary : ', response.data);
    alertSummary.value = response.data;
  } catch (error) {
    console.error(error);

  } finally {

  }

}
const alertSummaryText = computed(() => {
  if (!alertSummary.value) return "";

  const s = alertSummary.value;

  return `${t('alert_summary_total_summary')}: ${s.totalAlert}, ` +
      `${t('temperature_alert_summary')}: ${s.totalTemperatureAlert}${s.totalUnResolvedTemperatureAlert > 0 ? ` (${s.totalUnResolvedTemperatureAlert})` : ''}, ` +
      `${t('unauthorized_entry_alert_summary')}: ${s.totalUnAuthorizedEnter}${s.totalUnResolvedUnAuthorizedEnter > 0 ? ` (${s.totalUnResolvedUnAuthorizedEnter})` : ''}, ` +
      `${t('unauthorized_exit_alert_summary')}: ${s.totalUnAuthorizedExit}${s.totalUnResolvedUnAuthorizedExit > 0 ? ` (${s.totalUnResolvedUnAuthorizedExit})` : ''}, ` +
      `${t('offline_alert_summary')}: ${s.totalOffLineAlert}${s.totalUnResolvedOffLineAlert > 0 ? ` (${s.totalUnResolvedOffLineAlert})` : ''}`;
});


watch(selectedSupplyType, (newVal) => {
  console.log("Selected Supply Type ID:", newVal);
});
// Initialize
onMounted(async () => {
  //await fetchAlertTypes();
  await fetchSupplyTypes();
  await fetchOrganizationHierarchy();
  await fetchAlerts();
  await fetchAlertSummary();
})

</script>

<style scoped>
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
/* Core functionality styles */
:deep(.v-data-table__wrapper) {
  overflow-x: auto;
}
.cursor-pointer {
  cursor: pointer;
}
:deep(.v-data-table-footer__items-per-page .v-select) {
  min-width: 120px;
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
</style>
