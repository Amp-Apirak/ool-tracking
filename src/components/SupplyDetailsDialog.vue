<!-- SupplyDetailsDialog.vue -->

<template>
  <v-dialog v-model="show" width="60%" persistent scrollable @click:outside="closeDialog">
    <v-card v-if="show && supply">
      <!-- Fixed header -->
      <v-toolbar
          flat
          color="primary"
          style="position: sticky; top: 0; z-index: 1000;"
      >
        <v-toolbar-title class="text-h5 white--text">
          {{ t('supply_details') }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Scrollable content -->
      <v-card-text style="height: calc(90vh - 120px); overflow-y: auto;">
        <!-- Section 1: Supply Info -->
        <v-card class="mb-4" v-if="supply">
          <v-row>

            <v-col cols="3">
              <div class="d-flex flex-column h-100">
                <div class="flex-grow-1 d-flex justify-center align-center">
                  <v-img
                      :src="imagePreview || '/placeholder.png'"
                      height="200"
                      max-height="100%"
                      max-width="100%"
                      contain
                      class="image-container"
                  />
                </div>
                <div class="status-chip mt-auto" :class="`status-${supply?.trackingStatus?.toLowerCase()}`">
                  {{ supply?.trackingStatus }}
                </div>
              </div>
            </v-col>

            <!-- Data Section -->
            <v-col cols="9">
              <v-table>
                <tbody>
                <!-- Group 1: Basic Info -->
                <tr>
                  <td class="label-column">{{ t('supply_number') }}</td>
                  <td class="data-column">{{ supply?.supplyNumber || '-' }}</td>
                  <td class="label-column">{{ t('received_date') }}</td>
                  <td class="data-column">{{ formatDate(supply?.receivedDate) }}</td>
                </tr>

                <!-- Group 2: Identification -->
                <tr>
                  <td class="label-column">{{ t('rfid_tag') }}</td>
                  <td class="data-column">{{ supply?.rfidTagId || '-' }}</td>
                  <td class="label-column">{{ t('organization') }}</td>
                  <td class="data-column">{{ getTranslation(supply?.hierarchyTranslations?.ORGANIZATION) || '-' }}</td>
                </tr>

                <!-- Group 3: Location -->
                <tr>
                  <td class="label-column">{{ t('armory') }}</td>
                  <td class="data-column">{{ getTranslation(supply?.hierarchyTranslations?.ARMORY) || '-' }}</td>
                  <td class="label-column">{{ t('building') }}</td>
                  <td class="data-column">{{ getTranslation(supply?.hierarchyTranslations?.BUILDING) || '-' }}</td>
                </tr>

                <!-- Group 4: Detailed Location -->
                <tr>
                  <td class="label-column">{{ t('floor') }}</td>
                  <td class="data-column">{{ getTranslation(supply?.hierarchyTranslations?.FLOOR) || '-' }}</td>
                  <td class="label-column">{{ t('room') }}</td>
                  <td class="data-column">{{ getTranslation(supply?.hierarchyTranslations?.ROOM) || '-' }}</td>
                </tr>

                <!-- Group 5: Storage Location -->
                <tr>
                  <td class="label-column">{{ t('partition') }}</td>
                  <td class="data-column">{{ getTranslation(supply?.hierarchyTranslations?.PARTITION) || '-' }}</td>
                  <td class="label-column">{{ t('shelf') }}</td>
                  <td class="data-column">{{ getTranslation(supply?.hierarchyTranslations?.SHELF) || '-' }}</td>
                </tr>

                <!-- Group 6: Item Details -->
                <tr>
                  <td class="label-column">{{ t('slot') }}</td>
                  <td class="data-column">{{ getTranslation(supply?.hierarchyTranslations?.SLOT) || '-' }}</td>
                  <td class="label-column">{{ t('quantity') }}</td>
                  <td class="data-column">{{ supply?.quantity || '-' }}</td>
                </tr>

                <!-- Group 7: Additional Info -->
                <tr>
                  <td class="label-column">{{ t('unit') }}</td>
                  <td class="data-column">{{ supply?.unitOfMeasure || '-' }}</td>
                  <td class="label-column">{{ t('requisition_status') }}</td>
                  <td class="data-column">{{ supply?.requisitionStatus || '-' }}</td>
                </tr>
                </tbody>
              </v-table>
            </v-col>

          </v-row>

        </v-card>

        <!-- Section 2: Tabs -->
        <v-container fluid class="px-0">
          <SupplyDetailsTabs
              :supply="supply"
              :status="supply?.trackingStatus"
              :rootOrganizationId="props.rootOrganizationId"
              :lowestOrganizationId="props.lowestOrganizationId"
          />
        </v-container>

        <!-- Section 3: Movement History -->
        <v-card class="mt-4">
          <v-card-title>{{ t('movement_history') }}</v-card-title>
          <v-data-table-server
              v-model:page="movementOptions.page"
              v-model:items-per-page="movementOptions.itemsPerPage"
              :headers="movementHeaders"
              :items="movementItems"
              :items-length="totalMovements"
              :items-per-page-options="[5, 10, 25]"
              items-per-page-text="Items per page"
              :loading="loadingMovements"
              @update:options="handleMovementOptionsUpdate"
              class="elevation-1 custom-table"
          >
            <!-- Format Timestamp -->
            <template v-slot:item.timestamp="{ item }">
              {{ item.timestamp ? formatDate(item.timestamp) : 'N/A' }}
            </template>

            <!-- Format Locations -->
            <template v-slot:item.fromLocationName="{ item }">
              {{ item.fromLocationName ? item.fromLocationName : 'Unknown' }}
            </template>

            <template v-slot:item.toLocationName="{ item }">
              {{ item.toLocationName ? item.toLocationName : 'Unknown' }}
            </template>

            <template v-slot:item.remarks="{ item }">
              {{ item.remarks ? item.remarks : '-' }}
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="primary"
                  @click="handleViewMovement(item)">
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </template>

          </v-data-table-server>
        </v-card>
      </v-card-text>

      <!-- Fixed footer -->
      <v-card-actions style="position: sticky; bottom: 0; z-index: 1000; background: white;">
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeDialog">
          {{ t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogs.movementDetails" max-width="600px">
    <v-card>
      <v-card-title>{{ t('movement_details') }}</v-card-title>
      <v-card-text>
        <p><strong>{{ t('supply_number') }}:</strong> {{ selectedMovement?.supplyNumber }}</p>
        <p><strong>{{ t('from_location') }}:</strong> {{ selectedMovement?.fromLocationName }}</p>
        <p><strong>{{ t('to_location') }}:</strong> {{ selectedMovement?.toLocationName }}</p>
        <p><strong>{{ t('timestamp') }}:</strong> {{ selectedMovement?.timestamp }}</p>
        <p><strong>{{ t('remarks') }}:</strong> {{ selectedMovement?.remarks }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn text="" @click="dialogs.movementDetails = false">{{ t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup>
import SupplyDetailsTabs from '@/components/SupplyDetailsTabs.vue';
import api from "@/axiostoastapi.js";
import {ref, computed, watch} from 'vue';
import { useI18n } from 'vue-i18n';
import {formatDate} from "@/utils/dateFormatterLocale.js"

const imagePreview = ref(null);
const { t,locale } = useI18n();
const props = defineProps({
  modelValue: Boolean,
  supply: Object,
  rootOrganizationId: String,      // New prop for root organization UUID
  lowestOrganizationId: String     // New prop for lowest organization UUID
});
const emit = defineEmits(['update:modelValue']);

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const getTranslation = (translationObj) => {
  if (!translationObj) return '-';
  return locale.value === 'th' ?
      translationObj.th || translationObj.en || '-' :
      translationObj.en || translationObj.th || '-';
};

// Movement history table state
const movementItems = ref([]);
const totalMovements = ref(0);
const loadingMovements = ref(false);
const movementOptions = ref({
  itemsPerPage: 5,
  page: 1,
  sortBy: [],
  sortDesc: false
});
// Handle movement table options update
const handleMovementOptionsUpdate = async (options) => {
  loadingMovements.value = true;
  console.log('get movement: ',options);
  console.log('get movement supply ID: ',props.supply.id)
  try {
    const response = await api.get(`/api/supply-movement/${props.supply.id}`, {
      params: {
        page: options.page - 1,
        itemsPerPage: options.itemsPerPage,
        sortBy: options.sortBy[0]?.key || 'timestamp',
        sortDesc: options.sortBy[0]?.order === 'desc'
      }
    });

    console.log('Get Movement response: ', response);

    movementItems.value = response.data.content;
    totalMovements.value = response.data.totalElements;
  } catch (error) {
    console.error('Error fetching movement history:', error);
  } finally {
    loadingMovements.value = false;
  }
};
const movementHeaders = [
  { title: t('supply_number'), key: 'supplyNumber', sortable: true },
  { title: t('from_location'), key: 'fromLocationName', sortable: true },
  { title: t('to_location'), key: 'toLocationName', sortable: true },
  { title: t('movement_type'), key: 'movementType', sortable: true },
  { title: t('timestamp'), key: 'timestamp', sortable: true },
  { title: t('remarks'), key: 'remarks', sortable: false },
  { title: t('actions'), key: 'actions', sortable: false },
];
const selectedMovement = ref(null);
const dialogs = ref({ movementDetails: false });

const handleViewMovement = (item) => {
  console.log('Viewing movement:', item);
  selectedMovement.value = item;
  dialogs.value.movementDetails = true;
};

const fetchSupplyImage = async (supplyId) => {
  if (!supplyId) {
    console.warn("No supplyId provided for image fetching.");
    imagePreview.value = null;
    return;
  }

  console.log('Fetch image for Supply ID: ',supplyId);
  try {
    const response = await api.get(`/api/supply/image/${supplyId}`);

    if (response.status === 200 && response.data) {
      imagePreview.value = response.data; // Set Base64 image for preview
    } else {
      console.warn("No image found for supply:", supplyId);
      imagePreview.value = null; // Reset preview if not found
    }
  } catch (error) {
    console.error("Error fetching supply image:", error);
    imagePreview.value = null;
  }
};

const closeDialog = () => {
  emit('update:modelValue', false);
};
// Fetch initial data when supply changes
watch(() => props.supply, () => {
  if (props.supply) {
    handleMovementOptionsUpdate(movementOptions.value);
    fetchSupplyImage(props.supply.id);
  }
}, { immediate: true });
</script>

<style scoped>
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* Ensures the entire image is visible without cropping */
  overflow: hidden;
}
/* Table Styles */
:deep(.v-table) {
  background-color: transparent !important;
}

/* Column Styles */
:deep(.label-column) {
  width: 15%;
  font-weight: 500 !important;
  color: rgba(0, 0, 0, 0.7) !important;
  background-color: #f5f5f5 !important;
}

:deep(.data-column) {
  width: 35%;
}

:deep(td) {
  height: 40px !important;
  padding: 8px 16px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
}

/* Status Chip Styles */
.status-chip {
  margin-top: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.875rem;
}
.status-active {
  background-color: #4CAF50;
  color: white;
}
.v-dialog {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.v-card {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.v-toolbar {
  flex-shrink: 0;
}
.v-card-text {
  flex-grow: 1;
  overflow-y: auto;
  padding-bottom: 80px; /* Space for fixed footer */
}
.v-card-actions {
  flex-shrink: 0;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1); /* Optional: adds shadow to footer */
}
.status-chip {
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}
.status-active {
  background-color: #4CAF50;
  color: white;
}
.status-inactive {
  background-color: #9E9E9E;
  color: white;
}
.px-0 {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
:deep(.custom-table) {
  background-color: #ffffff !important;
}
:deep(.custom-table th) {
  color: rgba(2, 2, 2, 0.9) !important;
  background-color: #a6d6d6 !important;
  font-weight: bold;
  white-space: nowrap;
}
:deep(.custom-table tbody tr:hover td) {
  background: #ccccca;
}
.cursor-pointer {
  cursor: pointer;
}
:deep(.v-data-table-footer__items-per-page .v-select) {
  min-width: 120px;
}
:deep(.v-data-table-footer__items-per-page) {
  min-width: 150px !important;
}
</style>