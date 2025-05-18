<!-- DashboardDialog.vue -->
<template>
  <v-dialog v-model="showDialog" max-width="1200" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">{{ title }}</span>
        <v-btn icon="mdi-close" size="small" @click="showDialog = false"></v-btn>
      </v-card-title>
      <v-card-text>
        <!-- Loading State -->
        <div v-if="loading && !dataTable.items.length" class="d-flex justify-center align-center py-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <!-- Error State -->
        <v-alert v-else-if="error" type="error" class="mb-4">
          {{ error }}
          <div class="d-flex justify-end mt-2">
            <v-btn color="error" variant="text" @click="fetchData">
              {{ $t('retry') }}
            </v-btn>
          </div>
        </v-alert>

        <!-- Empty State -->
        <div v-else-if="!loading && dataTable.totalItems === 0" class="d-flex flex-column align-center justify-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-database-off</v-icon>
          <div class="text-h6 text-grey-darken-1">{{ $t('dashboard.dialog.noData') }}</div>
        </div>

        <!-- Table with Data -->
        <template v-else>
          <!-- Search Field -->
          <v-text-field
              v-model="dataTable.search"
              :label="$t('search')"
              prepend-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              class="mb-4"
              @update:model-value="debouncedSearch"
          ></v-text-field>

          <v-data-table-server
              v-model:items-per-page="dataTable.itemsPerPage"
              v-model:page="dataTable.page"
              :headers="headers"
              :items="dataTable.items"
              :items-length="dataTable.totalItems"
              :loading="loading"
              :item-key="getItemKey"
              class="elevation-1"
              @update:options="handleTableOptionsChange"
          >

            <!-- Reader status -->
            <template v-if="isReaderType" v-slot:item.status="{ item }">
              <v-chip
                  :color="(item.raw && item.raw.status === 'ONLINE') ? 'green' : 'red'"
                  size="small"
                  text-color="white"
                  class="px-3"
              >
                {{ item.raw && item.raw.status === 'ONLINE' ? 'ONLINE' : 'OFFLINE' }}
              </v-chip>
            </template>

            <template v-if="isSupplyType" v-slot:item.trackingStatus="{ item }">
              <v-chip
                  :color="item.trackingStatus ? getTrackingStatusColor(item.trackingStatus) : 'grey'"
                  size="small"
                  text-color="white"
                  class="px-3"
              >
                {{ t(`tracking_statuses.${item.trackingStatus}`) }}
              </v-chip>
            </template>

            <template v-if="isTagType" v-slot:item.usageStatus="{ item }">
              <v-chip
                  :color="item.usageStatus ? getUsageStatusColor(item.usageStatus) : 'grey'"
                  size="small"
                  text-color="white"
                  class="px-3"
              >
                {{ t(`rfid_tag_usage_statues.${item.usageStatus}`) }}
              </v-chip>
            </template>


          </v-data-table-server>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="showDialog = false">{{ $t('close') }}</v-btn>

        <!-- Export Button -->
        <v-btn
            color="success"
            variant="text"
            :disabled="dataTable.totalItems === 0"
            @click="exportData"
            class="ml-2"
        >
          <v-icon left class="mr-1">mdi-file-export</v-icon>
          {{ $t('dashboard.dialog.export') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/axiostoastapi.js';
import { showError, showSuccess } from '@/utils/snackbar';

const { t } = useI18n();

const props = defineProps({
  modelValue: Boolean,
  type: String, // readerOnline, readerOffline, activeSupplies, allReadersByOrg
  rootOrgId: { type: String, required: false }
});

const emit = defineEmits(['update:modelValue']);

// Dialog state
const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// Data fetching state
const loading = ref(false);
const error = ref(null);

// Server-side table data
const dataTable = ref({
  items: [],
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  search: '',
  totalItems: 0
});

// For debouncing search
let searchTimeout = null;

// Dialog type computed properties
const isReaderType = computed(() =>
    ['readerOnline', 'readerOffline', 'allReadersByOrg'].includes(props.type)
);

const isSupplyType = computed(() =>
    ['activeSupplies', 'inactiveSupplies', 'lostSupplies'].includes(props.type)
);

const isTagType = computed(() =>
    ['tagInUsing', 'tagInRemaining', 'tagDamaged'].includes(props.type)
);

const isAllReadersType = computed(() => props.type === 'allReadersByOrg');

// Dynamic title based on dialog types
const title = computed(() => {
  switch (props.type) {
    case 'readerOnline': return t('dashboard.dialog.onlineReaders');
    case 'readerOffline': return t('dashboard.dialog.offlineReaders');
    case 'allReadersByOrg': return t('dashboard.dialog.allReaders');
    case 'activeSupplies': return t('dashboard.dialog.activeSupplies');
    case 'inactiveSupplies': return t('dashboard.dialog.inactiveSupplies');
    case 'lostSupplies': return t('dashboard.dialog.lostSupplies');
    case 'tagInUsing': return t('dashboard.dialog.tagsInUse');
    case 'tagInRemaining': return t('dashboard.dialog.remainingTags');
    case 'tagDamaged': return t('dashboard.dialog.damagedTags');
    default: return t('dashboard.dialog.details');
  }
});

// Dynamic headers based on dialog type
const headers = computed(() => {
  if (isReaderType.value || isAllReadersType.value) {
    return [
      { title: '#', key: 'index', width: 70 },
      { title: t('dashboard.dialog.serialNumber'), key: 'readerSerialNumber', sortable: true },
      { title: t('dashboard.dialog.role'), key: 'role', sortable: true },
      { title: t('dashboard.dialog.status'), key: 'status', sortable: true, align: 'center' },
      { title: t('dashboard.dialog.ipAddress'), key: 'ipAddress', sortable: true },
      { title: t('dashboard.dialog.notes'), key: 'notes' }
    ];
  } else if (isSupplyType.value) {
    return [
      { title: '#', key: 'index', width: 70 },
      { title: t('dashboard.dialog.supplyNumber'), key: 'supplyNumber', sortable: true },
      { title: t('dashboard.dialog.supplyName'), key: 'supplyName', sortable: true },
      { title: t('dashboard.dialog.trackingStatus'), key: 'trackingStatus', sortable: true },
      { title: t('dashboard.dialog.rfidTag'), key: 'rfidTag.rfidNumber', sortable: true }
    ];
  } else if (isTagType.value) {
    return [
      { title: '#', key: 'index', width: 70 },
      { title: t('dashboard.dialog.rfidNumber'), key: 'rfidNumber', sortable: true },
      { title: t('dashboard.dialog.usageStatus'), key: 'usageStatus', sortable: true }
    ];
  }
  return [
    { title: '#', key: 'index', width: 70 },
    { title: t('dashboard.dialog.identifier'), key: 'value', sortable: true }
  ];
});
// Helper function for tracking status colors
const getTrackingStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE': return 'green';
    case 'INACTIVE': return 'orange';
    case 'LOST': return 'red';
    default: return 'grey';
  }
};
const getUsageStatusColor = (status) => {
  switch (status) {
    case 'USING': return 'green';
    case 'READY': return 'blue-lighten-3';
    case 'USED': return 'grey-darken-2';
    case 'DAMAGED': return 'red-lighten-1';
    default: return 'grey';
  }
};

// Debounced search function
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    dataTable.value.page = 1; // Reset to first page on search
    fetchData();
  }, 500);
};

// Handle table options change (sorting, pagination)
const handleTableOptionsChange = (options) => {
  // Update local state
  dataTable.value.itemsPerPage = options.itemsPerPage;
  dataTable.value.page = options.page;
  dataTable.value.sortBy = options.sortBy;

  // Fetch data with new options
  fetchData();
};

// Export table data to CSV - will export ALL data, not just current page
const exportData = async () => {
  if (dataTable.value.totalItems === 0) return;

  try {
    // Show loading indicator
    loading.value = true;

    // Get all data for export (override page size)
    let endpoint = getEndpointForType();
    let params = {
      page: 0,
      size: dataTable.value.totalItems,
      search: dataTable.value.search
    };

    const response = await api.get(endpoint, { params });
    const exportData = response.data.content || [];

    // Process for readers if needed
    if (isReaderType.value) {
      exportData.forEach(item => {
        item.status = props.type === 'readerOnline' ? 'ONLINE' : 'OFFLINE';
      });
    }

    // Create CSV content
    const headerNames = headers.value
        .filter(h => h.key !== 'index') // Exclude index column
        .map(h => t(`dashboard.dialog.${h.key}`)); // Use translated header names

    const csvContent = [
      // Add headers row
      headerNames.join(','),
      // Add data rows
      ...exportData.map((item, index) => {
        return headers.value
            .filter(h => h.key !== 'index') // Exclude index column
            .map(h => {
              // Get the value and wrap in quotes if it's a string
              const value = item[h.key];
              return typeof value === 'string' ? `"${value}"` : value;
            })
            .join(',');
      })
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${title.value}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess(t('dashboard.dialog.exportSuccess'));
  } catch (err) {
    console.error('Error exporting data:', err);
    showError(t('dashboard.dialog.exportError'));
  } finally {
    loading.value = false;
  }
};

// Get the appropriate API endpoint based on the dialog type
const getEndpointForType = () => {
  switch (props.type) {
    case 'readerOnline': return '/api/dashboard/readerOnline';
    case 'readerOffline': return '/api/dashboard/readerOffline';
    case 'allReadersByOrg': return '/api/dashboard/readers/org';
    case 'activeSupplies': return '/api/dashboard/activeSupplies';
    case 'inactiveSupplies': return '/api/dashboard/inactiveSupplies';
    case 'lostSupplies': return '/api/dashboard/lostSupplies';
    case 'tagInUsing': return '/api/dashboard/inUsingRfidTags';
    case 'tagInRemaining': return '/api/dashboard/onlineRfidTags';
    case 'tagDamaged': return '/api/dashboard/offlineRfidTags';
    default: throw new Error('Invalid dialog type');
  }
};
// เพิ่มฟังก์ชันเพื่อกำหนด item-key ตามประเภทของ dialog
const getItemKey = computed(() => {
  if (isReaderType.value) {
    return 'readerSerialNumber';
  } else if (isSupplyType.value) {
    return 'supplyNumber';
  } else if (isTagType.value) {
    return 'rfidNumber';
  }
  return 'index'; // default fallback
});
// Fetch data from the API
const fetchData = async () => {
  if (!showDialog.value) return;

  loading.value = true;
  error.value = null;

  try {
    console.log("Current dialog type:", props.type); // Log ประเภทของ dialog

    // Get endpoint and set up parameters
    const endpoint = getEndpointForType();
    const params = {
      page: dataTable.value.page - 1,
      size: dataTable.value.itemsPerPage,
      search: dataTable.value.search || null
    };

    // FIX: Ensure rootOrgId is injected into params BEFORE request
    if (props.type === 'allReadersByOrg') {
      if (!props.rootOrgId) {
        error.value = "Missing rootOrgId for allReadersByOrg";
        return;
      }
      params.rootOrgId = props.rootOrgId;
    }
    // Add sorting if present
    if (dataTable.value.sortBy && dataTable.value.sortBy.length > 0) {
      const sortItem = dataTable.value.sortBy[0];
      params.sort = `${sortItem.key},${sortItem.order}`;
    }

    console.log("API request:", endpoint, params);

    const response = await api.get(endpoint, { params });
    console.log("API response:", response.data);

    // Process the data according to type
    let responseData = response.data.content || [];

    // แก้ไขการแปลงข้อมูลตามประเภท dialog
    if (isReaderType.value) {
      // กำหนด status ตามประเภท dialog ที่เปิด
      const statusValue = props.type === 'readerOnline' ? 'ONLINE' : 'OFFLINE';
      console.log(`Setting status to ${statusValue} for readers`);

      responseData = responseData.map(item => ({
        ...item,
        status: statusValue
      }));
    }

    // เพิ่ม id หรือ key ที่ไม่ซ้ำกัน
    responseData = responseData.map((item, index) => {
      const indexValue = (dataTable.value.page - 1) * dataTable.value.itemsPerPage + index + 1;
      return {
        ...item,
        index: indexValue,
        id: item.readerSerialNumber || item.supplyNumber || item.rfidNumber || `item-${indexValue}`
      };
    });

    console.log("Transformed items:", responseData);

    // Update table data
    dataTable.value.items = responseData;
    dataTable.value.totalItems = response.data.totalElements || 0;
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = t('dashboard.dialog.fetchError');
    showError(t('dashboard.dialog.fetchError'));
  } finally {
    loading.value = false;
  }
};

// Watch for dialog open/close to fetch data
watch(() => showDialog.value, (newVal) => {
  if (newVal) {
    // Reset state when opening dialog
    dataTable.value.page = 1;
    dataTable.value.search = '';
    dataTable.value.sortBy = [];
    dataTable.value.itemsPerPage = 10;
    fetchData();
  }
});

// Watch for type changes to refetch data
watch(() => props.type, () => {
  if (showDialog.value) {
    // Reset state when type changes
    dataTable.value.page = 1;
    dataTable.value.search = '';
    dataTable.value.sortBy = [];
    dataTable.value.itemsPerPage = 10;
    fetchData();
  }
});

onMounted(() => {
  if (showDialog.value) {
    fetchData();
  }
});
</script>

<style scoped>
/* Custom table styles */
:deep(.v-table) {
  background-color: #ffffff !important;
}

:deep(.v-table th) {
  color: rgba(0, 0, 0, 0.9) !important;
  background-color: #e0f2f1 !important;
  font-weight: bold;
  white-space: nowrap;
}

/* Hover effect */
:deep(.v-table tbody tr:hover td) {
  background: #f5f5f5 !important;
}

/* Alternating row colors */
:deep(.v-table tbody tr:nth-child(even)) {
  background-color: #fafafa;
}

/* Custom dialog transitions */
:deep(.v-dialog) {
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
</style>
