<template>
  <v-container fluid class="rfid-management-page pa-4">
    <!-- Header -->
    <v-card class="mb-4 header-card" elevation="2">
      <HeaderCommon :title="t('rfid_management_page')" />
    </v-card>

    <!-- Search Filters -->
    <v-card class="mb-3 search-card-compact" elevation="1">
      <v-card-title class="py-2 filter-header-compact">
        <v-icon size="small" class="me-1">mdi-magnify</v-icon>
        {{ t("search") }}
      </v-card-title>
      <v-card-text class="py-2">
        <v-row dense>
          <!-- Text Search -->
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchText"
              :label="t('type_to_search')"
              prepend-inner-icon="mdi-tag-search"
              clearable
              hide-details
              variant="outlined"
              density="compact"
              class="search-field-compact"
            ></v-text-field>
          </v-col>

          <!-- Date Range -->
          <v-col cols="12" md="2">
            <v-text-field
              v-model="startDate"
              :label="t('start_date')"
              type="date"
              prepend-inner-icon="mdi-calendar-start"
              clearable
              :rules="[(v) => validateStartDateRule(v, endDate)]"
              hide-details="auto"
              variant="outlined"
              density="compact"
              class="date-field-compact"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="endDate"
              :label="t('end_date')"
              prepend-inner-icon="mdi-calendar-end"
              type="date"
              clearable
              :rules="[(v) => validateEndDateRule(v, startDate)]"
              hide-details="auto"
              variant="outlined"
              density="compact"
              class="date-field-compact"
            ></v-text-field>
          </v-col>

          <!-- Status -->
          <v-col cols="12" md="2">
  <v-select
    v-model="selectedStatus"
    :items="statuses"
    :label="t('device_status')"
    prepend-inner-icon="mdi-tag-check"
    clearable
    hide-details
    variant="outlined"
    density="compact"
    class="status-field-compact"
    :class="{ 'status-from-dashboard': isFilterFromDashboard }"
  ></v-select>
</v-col>

          <!-- Search Button -->
          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn
              color="primary"
              size="small"
              elevation="1"
              @click="handleSearch"
              class="search-button-compact"
            >
              <v-icon size="small" class="me-1">mdi-magnify</v-icon>
              {{ t("search") }}
            </v-btn>
          </v-col>

          <!-- Clear Search Button -->
          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn
              color="secondary"
              size="small"
              variant="outlined"
              @click="clearSearch"
              class="clear-button-compact"
            >
              <v-icon size="small" class="me-1">mdi-eraser</v-icon>
              {{ t("clear_search") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ส่วนของปุ่ม Export และ Add ที่ปรับปรุงใหม่ -->
    <div
      class="d-flex justify-space-between align-center mb-3 action-bar-compact"
    >
      <!-- Export Buttons -->
      <div class="export-container">
    <span class="export-label">
      <v-icon size="small" class="export-icon">mdi-export-variant</v-icon>
      {{ t("export_data") }}
    </span>
    <v-btn
      v-for="format in ['CSV']"
      :key="format"
      variant="outlined"
      color="secondary"
      size="small"
      class="export-btn"
      @click="exportData(format)"
    >
      <v-icon size="small" class="export-btn-icon">mdi-file-{{ format.toLowerCase() }}</v-icon>
      <span class="export-btn-text">{{ format }}</span>
    </v-btn>
  </div>

      <!-- Add Button -->
      <div>
        <v-btn
          color="primary"
          size="small"
          elevation="1"
          @click="showAddDialog"
          class="add-button-compact"
        >
          <v-icon size="small" class="me-1">mdi-plus-circle</v-icon>
          {{ t("add") }}
        </v-btn>
      </div>
    </div>

    <!-- Data Table -->
    <v-card class="data-table-card" elevation="2">
      <v-data-table-server
        v-model:page="tableOptions.page"
        v-model:items-per-page="tableOptions.itemsPerPage"
        :headers="headers"
        :items="devices"
        :items-length="totalRecords"
        :loading="loading"
        @update:options="handleUpdateOptions"
        :items-per-page-options="defaultItemsPerPageOptions"
        :items-per-page-text="itemsPerPageText"
        class="data-table"
      >
        <!-- Loading Overlay -->
        <template v-slot:loading>
          <v-skeleton-loader
            type="table-row-divider@6"
            class="mx-auto"
          ></v-skeleton-loader>
        </template>

        <!-- Dynamic Date Column -->
        <template v-slot:item.createdAt="{ item }">
          <span class="date-column">{{ formatDate(item.createdAt) }}</span>
        </template>

        <template v-slot:item.lastSeen="{ item }">
          <span class="date-column">{{ formatDate(item.lastSeen) }}</span>
        </template>

        <!-- Sequential Number Column -->
        <template v-slot:item.index="{ item, index }">
          <div class="index-column">
            {{
              (tableOptions.page - 1) * tableOptions.itemsPerPage + index + 1
            }}
          </div>
        </template>

        <!-- Status Chip -->
        <template v-slot:item.usageStatus="{ item }">
          <v-chip
            :color="getStatusChipColor(item.usageStatus)"
            size="small"
            class="status-chip"
          >
            {{ t(item.usageStatus.toLowerCase()) }}
          </v-chip>
        </template>

        <!-- Actions column template for main table -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2 justify-center">
            <v-btn
              icon
              variant="text"
              size="small"
              color="orange"
              @click="setTagToDamaged(item)"
              :disabled="item.usageStatus === 'DAMAGED'"
              class="action-button"
            >
              <v-icon>mdi-close-thick</v-icon>
              <v-tooltip activator="parent">
                {{ t("set_to_damaged") }}
              </v-tooltip>
            </v-btn>

            <v-btn
              icon
              variant="text"
              size="small"
              color="success"
              @click="setTagFromUsedToReady(item)"
              :disabled="item.usageStatus !== 'USED'"
              class="action-button"
            >
              <v-icon>mdi-refresh</v-icon>
              <v-tooltip activator="parent">
                {{ t("set_to_ready") }}
              </v-tooltip>
            </v-btn>

            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              @click="handleEditMainTag(item)"
              class="action-button"
            >
              <v-icon>mdi-pencil-outline</v-icon>
              <v-tooltip activator="parent">{{ t("edit") }}</v-tooltip>
            </v-btn>

            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="handleDeleteMainTag(item)"
              class="action-button"
            >
              <v-icon>mdi-delete-outline</v-icon>
              <v-tooltip activator="parent">{{ t("delete") }}</v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- Empty State Template -->
        <template v-slot:no-data>
          <div
            class="d-flex flex-column align-center justify-center pa-5 empty-state"
          >
            <v-icon size="64" color="grey-lighten-1"
              >mdi-tag-off-outline</v-icon
            >
            <div class="text-h6 mt-4 grey--text text--darken-1">
              {{ t("no_tags_found") || "No RFID tags found" }}
            </div>
            <div class="text-subtitle-1 mt-2 text-center grey--text">
              {{
                t("try_different_search_or_add") ||
                "Try a different search criteria or add new RFID tags"
              }}
            </div>
            <v-btn color="primary" class="mt-4" @click="showAddDialog">
              <v-icon left class="me-2">mdi-plus-circle</v-icon>
              {{ t("add_rfid_tag") }}
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Dialogs -->
    <!-- Add One Tag Dialog ที่ปรับให้เล็กลงแล้ว -->
    <v-dialog
      v-model="dialogs.add"
      width="1000"
      class="dialog-card compact-dialog"
    >
      <v-card v-if="dialogs.add">
        <v-card-title class="text-center dialog-header-compact">
          <v-icon size="small" class="me-2">mdi-tag-plus</v-icon>
          {{ t("add_rfid_tag") }}
        </v-card-title>
        <v-card-text class="pa-3">
          <!-- RFID Input Section -->
          <v-row dense>
            <v-col cols="12" md="12" class="d-flex align-center">
              <v-text-field
                v-model="currentRfid"
                :label="t('column_product_code')"
                class="flex-grow-1 rfid-input-compact"
                :rules="[
                  (v) => !!v || t('field_required'),
                  rfidTagValidationRule,
                ]"
                @input="handleRfidInput"
                hide-details="auto"
                variant="outlined"
                density="compact"
                bg-color="white"
                prepend-inner-icon="mdi-barcode"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="3">
              <v-autocomplete
                v-model="currentSize"
                :items="rfidSize"
                :label="t('size')"
                variant="outlined"
                density="compact"
                bg-color="white"
                :rules="[(v) => !!v || t('size_required')]"
                required
                hide-details
                allow-input
                clearable
                class="flex-grow-1 size-input-compact"
                :custom-filter="() => true"
                @update:search="onSizeSearch"
                prepend-inner-icon="mdi-ruler"
              ></v-autocomplete>
            </v-col>

            <!-- Type Selector with manual input -->
            <v-col cols="12" md="7">
              <v-autocomplete
                v-model="currentType"
                :items="rfidType"
                :label="t('tag_type')"
                variant="outlined"
                density="compact"
                bg-color="white"
                :rules="[(v) => !!v || t('type_required')]"
                required
                hide-details
                allow-input
                clearable
                class="flex-grow-1 type-input-compact"
                :custom-filter="() => true"
                @update:search="onTypeSearch"
                prepend-inner-icon="mdi-tag-multiple"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" md="2">
              <v-btn
                color="primary"
                @click="addToTagsList"
                :disabled="!isValidRfid"
                block
                size="small"
                density="compact"
                class="add-to-list-button-compact"
              >
                <v-icon size="small" class="me-1">mdi-plus</v-icon>
                {{ t("add") }}
              </v-btn>
            </v-col>
          </v-row>

          <!-- Tags Table -->
          <v-card class="mt-3 tags-table-card" outlined>
            <v-data-table
              :headers="[
                { title: t('no'), align: 'start', key: 'index', width: '50px' },
                { title: t('supply_code'), key: 'rfidNumber', align: 'start' },
                {
                  title: t('size'),
                  key: 'rfidSize',
                  align: 'start',
                  width: '80px',
                },
                { title: t('tag_type'), key: 'rfidType', align: 'start' },
                {
                  title: t('column_actions'),
                  key: 'actions',
                  align: 'center',
                  sortable: false,
                  width: '100px',
                },
              ]"
              :items="
                tagsList.map((tag, index) => ({ ...tag, index: index + 1 }))
              "
              class="elevation-0 tags-table compact-table"
              :no-data-text="t('no_tags_added')"
              density="compact"
            >
              <template v-slot:item.rfidNumber="{ item }">
                <span class="tag-text" :title="item.rfidNumber">{{
                  item.rfidNumber
                }}</span>
              </template>

              <template v-slot:item.rfidSize="{ item }">
                <span class="tag-text" :title="item.rfidSize">{{
                  item.rfidSize
                }}</span>
              </template>

              <template v-slot:item.rfidType="{ item }">
                <span class="tag-text" :title="item.rfidType">{{
                  item.rfidType
                }}</span>
              </template>

              <template v-slot:item.actions="{ item }">
                <div class="d-flex justify-center gap-1">
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="x-small"
                    color="primary"
                    @click="editTag(item.index - 1)"
                    class="action-button-compact"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="x-small"
                    color="error"
                    @click="removeTag(item.index - 1)"
                    class="action-button-compact"
                  ></v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-3 dialog-actions-compact">
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="outlined"
            size="small"
            density="compact"
            @click="closeAddDialog"
            class="me-2 cancel-button-compact"
          >
            <v-icon size="small" class="me-1">mdi-close</v-icon>
            {{ t("cancel_button") }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            density="compact"
            @click="saveTags"
            :disabled="tagsList.length === 0"
            :loading="loading"
            class="save-button-compact"
          >
            <v-icon size="small" class="me-1">mdi-content-save</v-icon>
            {{ t("save_button") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Tag Dialog -->
    <v-dialog
      v-model="dialogs.edit"
      width="600"
      class="dialog-card compact-dialog"
    >
      <v-card v-if="dialogs.edit">
        <v-card-title class="text-center dialog-header-compact">
          <v-icon size="small" class="me-2">mdi-pencil</v-icon>
          {{ t("edit_rfid_tag") }}
        </v-card-title>
        <v-card-text class="pa-3">
          <!-- RFID Input Section -->
          <v-row dense>
            <v-col cols="12" md="12">
              <v-text-field
                v-model="editingTag.rfidNumber"
                :label="t('track_rfid_no')"
                :rules="[
                  (v) => !!v || t('field_required'),
                  rfidTagValidationRule,
                ]"
                @input="handleEditRfidInput"
                hide-details="auto"
                variant="outlined"
                density="compact"
                bg-color="white"
                disabled
                prepend-inner-icon="mdi-barcode"
                class="rfid-input-compact"
              ></v-text-field>
            </v-col>

            <!-- Size Selector with Auto Complete -->
            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="editingTag.rfidSize"
                :items="rfidSize"
                :label="t('size')"
                variant="outlined"
                density="compact"
                bg-color="white"
                hide-details
                allow-input
                clearable
                :custom-filter="() => true"
                @update:search="onEditSizeSearch"
                class="size-input-compact"
                prepend-inner-icon="mdi-ruler"
              ></v-autocomplete>
            </v-col>

            <!-- Type Selector with Auto Complete -->
            <v-col cols="12" md="8">
              <v-autocomplete
                v-model="editingTag.rfidType"
                :items="rfidType"
                :label="t('tag_type')"
                variant="outlined"
                density="compact"
                bg-color="white"
                hide-details
                allow-input
                clearable
                :custom-filter="() => true"
                @update:search="onEditTypeSearch"
                class="type-input-compact"
                prepend-inner-icon="mdi-tag-multiple"
              ></v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-3 dialog-actions-compact">
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="outlined"
            size="small"
            density="compact"
            @click="closeEditDialog"
            class="me-2 cancel-button-compact"
          >
            <v-icon size="small" class="me-1">mdi-close</v-icon>
            {{ t("cancel_button") }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            density="compact"
            @click="updateTag"
            :loading="loading"
            class="save-button-compact"
          >
            <v-icon size="small" class="me-1">mdi-content-save</v-icon>
            {{ t("save_button") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog
      v-model="confirmDialog.show"
      max-width="500px"
      class="confirm-dialog"
    >
      <v-card>
        <v-card-title class="text-center confirm-header">
          <v-icon :color="confirmDialog.color" size="28" class="me-2">{{
            confirmDialog.icon
          }}</v-icon>
          {{ confirmDialog.title }}
        </v-card-title>
        <v-card-text class="text-center py-4">
          {{ confirmDialog.message }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="confirmDialog.show = false"
          >
            {{ t("cancel") }}
          </v-btn>
          <v-btn
            :color="confirmDialog.color"
            variant="elevated"
            @click="confirmDialog.action"
          >
            {{ confirmDialog.confirmText }}
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/axiostoastapi.js";
import HeaderCommon from "@/components/HeaderCommon.vue";
import {
  rfidTagValidationRule,
  validateStartDateRule,
  validateEndDateRule,
} from "@/utils/validationRules.js";
import { useTokenStore } from "@/stores/token";
import { formatDate } from "@/utils/dateFormatterLocale";
import { showSuccess, showError } from "@/utils/snackbar.js";

// ดึงข้อมูลผู้ใช้
const router = useRouter();
const tokenStore = useTokenStore();
const username = tokenStore.getUsername();
const { t, locale } = useI18n();

// ตัวแปรสำหรับ Confirmation Dialog
const confirmDialog = reactive({
  show: false,
  title: "",
  message: "",
  action: () => {},
  confirmText: "",
  color: "primary",
  icon: "mdi-alert",
});

// Table state
const devices = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const defaultItemsPerPageOptions = [5, 10, 25, 50, 100];
const itemsPerPageText = ref(t("items_per_page"));

// Dropdown options
const organizations = ref([]);
const armories = ref([]);
const zones = ref([]);

const statuses = computed(() => [
  { value: "READY", title: t("status_ready") },
  { value: "USING", title: t("status_using") },
  { value: "USED", title: t("status_used") },
  { value: "DAMAGED", title: t("status_damaged") },
]);

// Dialog states
const dialogs = ref({
  installation: false,
  add: false,
  import: false,
  edit: false,
});

// Table options
const tableOptions = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  sortDesc: false,
});

// Search filters
const searchText = ref("");
const startDate = ref("");
const endDate = ref("");
const selectedOrg = ref(null);
const selectedArmory = ref(null);
const selectedZone = ref(null);
const selectedStatus = ref(null);

const selectedBuilding = ref(null);
const buildings = ref([]);
const selectedFloor = ref(null);
const floors = ref([]);
const selectedRoom = ref(null);
const rooms = ref([]);

// Import Dialog
const selectedFile = ref(null);
const selectedFileName = ref("");
const fileInput = ref(null);
const downloadTemplate = () => {
  const basePath = import.meta.env.VITE_APP_BASE_PATH || "";
  const templateUrl = `${basePath}/templates/excel/template_rfid_tags_form.xlsx`;
  window.open(templateUrl, "_blank");
};

// ADD TAG
const currentRfid = ref("");
const currentSize = ref(""); // Initialize empty
const currentType = ref(""); // Initialize empty

// Update the initializeDefaults function
const initializeDefaults = () => {
  // Set defaults after data is loaded
  currentSize.value = rfidSize.value?.[0] || "";
  currentType.value = rfidType.value?.[0] || "";
};

const tagsList = ref([]);
const isValidRfid = computed(() => {
  return currentRfid.value && rfidTagValidationRule(currentRfid.value) === true;
});

const handleRfidInput = (event) => {
  if (event?.target?.value) {
    currentRfid.value = event.target.value.toUpperCase();
  }
};

const addToTagsList = () => {
  if (!isValidRfid.value) return;
  if (!currentSize.value || !currentType.value) {
    showError(t("size_and_type_required") || "กรุณาระบุขนาดและประเภท");
    return;
  }

  if (tagsList.value.some((tag) => tag.rfidNumber === currentRfid.value)) {
    showError(t("rfid_already_exists"));
    return;
  }

  tagsList.value.push({
    rfidNumber: currentRfid.value,
    rfidSize: currentSize.value,
    rfidType: currentType.value,
    usageStatus: "READY",
    createdBy: username,
  });

  // Reset only RFID field, keep size and type selections
  currentRfid.value = "";
};

// Remove from Add Dialog
const removeTag = (index) => {
  confirmDialog.show = true;
  confirmDialog.title = t("confirm_delete") || "ยืนยันการลบ";
  confirmDialog.message =
    t("confirm_delete_tag_message") || "คุณต้องการลบ Tag นี้หรือไม่?";
  confirmDialog.confirmText = t("delete") || "ลบ";
  confirmDialog.color = "error";
  confirmDialog.icon = "mdi-delete";
  confirmDialog.action = () => {
    tagsList.value.splice(index, 1);
    confirmDialog.show = false;
  };
};

// Edit from Add Dialog
const editTag = (index) => {
  const tagToEdit = tagsList.value[index];
  editingTag.value = {
    originalRfidNumber: tagToEdit.rfidNumber,
    rfidNumber: tagToEdit.rfidNumber,
    rfidSize: tagToEdit.rfidSize,
    rfidType: tagToEdit.rfidType,
    usageStatus: "READY",
    createdBy: username,
  };
  // Store the index for updating after edit
  editingTag.value.tagListIndex = index;
  // Open edit dialog
  dialogs.value.edit = true;
};

const closeAddDialog = () => {
  dialogs.value.add = false;
  tagsList.value = [];
  currentRfid.value = "";
  // Reset to first options
  currentSize.value = rfidSize.value?.[0] || "";
  currentType.value = rfidType.value?.[0] || "";
};

// Custom search handling for size autocomplete
const onSizeSearch = (val) => {
  // When user types something not in the list, use it as the value
  if (val && !rfidSize.value.includes(val)) {
    currentSize.value = val;
  }
};

// Custom search handling for type autocomplete
const onTypeSearch = (val) => {
  // When user types something not in the list, use it as the value
  if (val && !rfidType.value.includes(val)) {
    currentType.value = val;
  }
};

// Custom search handling for edit size autocomplete
const onEditSizeSearch = (val) => {
  // When user types something not in the list, use it as the value
  if (val && !rfidSize.value.includes(val)) {
    editingTag.value.rfidSize = val;
  }
};

// Custom search handling for edit type autocomplete
const onEditTypeSearch = (val) => {
  // When user types something not in the list, use it as the value
  if (val && !rfidType.value.includes(val)) {
    editingTag.value.rfidType = val;
  }
};

const saveTags = async () => {
  if (tagsList.value.length === 0) return;

  try {
    loading.value = true;
    // Create array of all tags with correct format
    const tagsData = tagsList.value.map((tag) => ({
      rfidNumber: tag.rfidNumber,
      rfidSize: tag.rfidSize || "",
      rfidType: tag.rfidType || "",
      usageStatus: "READY",
      createdBy: username,
    }));
    await api.post("/api/rfid_tags/list", tagsData);
    showSuccess(t("tags_saved_successfully"));
    closeAddDialog();
    await fetchAllTagsWithLastSeen();
  } catch (error) {
    showError(t("error_saving_tags"));
    console.error("Error saving tags:", error);
  } finally {
    loading.value = false;
  }
};
// END ADD TAG

// SIZES and TYPES
const rfidType = ref([]);
const rfidSize = ref([]);

const getTypes = async () => {
  try {
    loading.value = true;
    const response = await api.get("/api/rfid_tags/types");
    rfidType.value = response.data;
    initializeDefaults(); // Set defaults after data is loaded
  } catch (error) {
    console.error("Error fetching RFID types:", error);
  } finally {
    loading.value = false;
  }
};

const getSizes = async () => {
  try {
    loading.value = true;
    const response = await api.get("/api/rfid_tags/sizes");
    rfidSize.value = response.data;
    initializeDefaults(); // Set defaults after data is loaded
  } catch (error) {
    console.error("Error fetching RFID tags:", error);
  } finally {
    loading.value = false;
  }
};

const importFile = async () => {
  if (!selectedFile.value) return;
  if (!isFileValid(selectedFile.value)) return;

  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    formData.append("username", username); // Add the username to the form data

    // Send POST request to backend
    const response = await api.post("/api/rfid_tags/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Handle the response
    const { data } = response;
    // Check if the response is a success or contains errors
    if (response.status === 200) {
      // If success, display success message with details from the backend response
      showSuccess(t("file_saved_successfully") + ": " + data);
    } else if (response.status === 400) {
      // If bad request, display warning with error message from backend
      showError(t("error_during_import") + ": " + data);
    } else {
      // For unexpected errors, show a general failure message
      showError(t("unexpected_error") + ": " + data);
    }
    dialogs.value.import = false;
    selectedFile.value = null;
    selectedFileName.value = "";
    await fetchAllTagsWithLastSeen();
  } catch (error) {
    console.error(error);
    showError(t("failed_to_save_file"));
  }
};

const isFileValid = (file) => {
  // Check file type
  const validTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (!validTypes.includes(file.type)) {
    showError(t("please_upload_an_excel_file"));
    return false;
  }
  // Check file size (e.g., max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    showError(t("file_size_should_be_less_than_5MB"));
    return false;
  }
  return true;
};

const selectFile = () => {
  fileInput.value.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    selectedFileName.value = file.name;
  }
};

// Table headers
const headers = computed(() => [
  {
    title: t("column_order"),
    key: "index",
    sortable: false,
    align: "center",
    width: "80px",
  }, // For sequential number
  {
    title: t("column_product_code"),
    key: "rfidNumber",
    sortable: true,
    align: "center",
  },
  { title: t("size"), key: "rfidSize", sortable: true, align: "center" },
  { title: t("tag_type"), key: "rfidType", sortable: true, align: "center" },
  {
    title: t("created_date"),
    key: "createdAt",
    sortable: true,
    align: "center",
  }, // Created At
  { title: t("created_by"), key: "createdBy", sortable: true, align: "center" }, // Fixed from rfidType to createdBy
  {
    title: t("device_status"),
    key: "usageStatus",
    sortable: true,
    align: "center",
  }, // Fixed from createdBy to usageStatus
  {
    title: t("last_seen_datetime"),
    key: "lastSeen",
    sortable: true,
    align: "center",
  },
  {
    title: t("reader_SN"),
    key: "readerNumber",
    sortable: true,
    align: "center",
  },
  {
    title: t("column_actions"),
    key: "actions",
    sortable: false,
    align: "center",
    width: "150px",
  },
]);

// Dialog handlers
const showInstallationDialog = (item) => {
  dialogs.value.installation = true;
};

const showAddDialog = () => {
  dialogs.value.add = true;
};

const showImportDialog = () => {
  dialogs.value.import = true;
};

// EDIT DIALOG
const editingTag = ref({
  originalRfidNumber: "",
  rfidNumber: "",
  rfidSize: "",
  rfidType: "",
  usageStatus: "",
  createdBy: "",
  tagListIndex: undefined,
});

const handleEditMainTag = (item) => {
  editingTag.value = {
    originalRfidNumber: item.rfidNumber,
    rfidNumber: item.rfidNumber,
    rfidSize: item.rfidSize || "",
    rfidType: item.rfidType || "",
    usageStatus: item.usageStatus,
    createdBy: item.createdBy,
  };
  dialogs.value.edit = true;
};

const handleEditRfidInput = (event) => {
  if (event?.target?.value) {
    editingTag.value.rfidNumber = event.target.value.toUpperCase();
  }
};

// Handle both Edit from row selected and Add dialog
const updateTag = async () => {
  if (
    !editingTag.value.rfidNumber ||
    !rfidTagValidationRule(editingTag.value.rfidNumber)
  ) {
    showError(t("invalid_rfid"));
    return;
  }

  try {
    loading.value = true;

    // Check if we're editing from the add dialog (has tagListIndex)
    if (typeof editingTag.value.tagListIndex !== "undefined") {
      // Update the tag in tagsList
      tagsList.value[editingTag.value.tagListIndex] = {
        rfidNumber: editingTag.value.rfidNumber,
        rfidSize: editingTag.value.rfidSize,
        rfidType: editingTag.value.rfidType,
        usageStatus: "READY",
        createdBy: username,
      };
      showSuccess(t("tag_updated_successfully"));
      console.log("Edit Tag API NOT CALL !!!!!!!!!!");
      closeEditDialog();
      return; // Exit early since we don't need to make API call
    }
    console.log("Edit Tag API CALL !!!!!!!!!!");

    // Send both original and new tag data
    await api.put(`/api/rfid_tags/${editingTag.value.originalRfidNumber}`, {
      originalRfidNumber: editingTag.value.originalRfidNumber,
      rfidNumber: editingTag.value.rfidNumber,
      rfidSize: editingTag.value.rfidSize || "",
      rfidType: editingTag.value.rfidType || "",
      usageStatus: editingTag.value.usageStatus,
      createdBy: editingTag.value.createdBy,
    });
    showSuccess(t("tag_updated_successfully"));
    closeEditDialog();
    await fetchAllTagsWithLastSeen();
  } catch (error) {
    showError(t("error_updating_tag"));
    console.error("Error updating tag:", error);
  } finally {
    loading.value = false;
  }
};

const closeEditDialog = () => {
  dialogs.value.edit = false;
  editingTag.value = {
    originalRfidNumber: "",
    rfidNumber: "",
    rfidSize: "",
    rfidType: "",
    usageStatus: "",
    createdBy: "",
    tagListIndex: undefined,
  };
};

// Update the delete handler
const handleDeleteMainTag = async (item) => {
  confirmDialog.show = true;
  confirmDialog.title = t("confirm_delete") || "ยืนยันการลบ";
  confirmDialog.message =
    t("confirm_delete_tag_message", { rfid: item.rfidNumber }) ||
    `คุณต้องการลบ RFID ${item.rfidNumber} หรือไม่?`;
  confirmDialog.confirmText = t("delete") || "ลบ";
  confirmDialog.color = "error";
  confirmDialog.icon = "mdi-delete";
  confirmDialog.action = async () => {
    try {
      loading.value = true;
      await api.delete(`/api/rfid_tags/${item.rfidNumber}`);
      showSuccess(t("tag_deleted_successfully"));
      await fetchAllTagsWithLastSeen();
    } catch (error) {
      showError(t("error_deleting_tag"));
      console.error("Error deleting tag:", error);
    } finally {
      loading.value = false;
      confirmDialog.show = false;
    }
  };
};

// MAIN TABLE END

// Export data on the table begin
const exportDataAllTags = async (format) => {
  console.log(format);
  try {
    loading.value = true;

    // Construct the base URL and format parameter
    let endpoint = "/api/rfid_tags/export";
    let params = { format: format.toLowerCase() };

    // Make API call with responseType blob to handle file download
    const response = await api.get(endpoint, {
      params,
      responseType: "blob", // Important for handling file downloads
    });

    // Create a file URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Set the filename with current date
    const currentDate = new Date().toISOString().split("T")[0];
    const extension =
      format.toLowerCase() === "excel" ? "xlsx" : format.toLowerCase();
    link.download = `rfid_tags_${currentDate}.${extension}`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showSuccess(t("export_successful"));
  } catch (error) {
    console.error("Error exporting data:", error);
    showError(t("export_failed"));
  } finally {
    loading.value = false;
  }
};

// Export limited to search filter
const exportData = async (format) => {
  console.log(format);
  try {
    loading.value = true;

    // Construct the base URL and format parameter
    let endpoint = "/api/rfid_tags/export";

    // Include all the current search parameters
    let params = {
      format: format.toLowerCase(),
      searchText: searchText.value || undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
      status: selectedStatus.value || undefined,
    };

    // Remove undefined parameters to keep the request clean
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );

    // Make API call with responseType blob to handle file download
    const response = await api.get(endpoint, {
      params,
      responseType: "blob", // Important for handling file downloads
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    const currentDate = new Date().toISOString().split("T")[0];
    const extension =
      format.toLowerCase() === "excel" ? "xlsx" : format.toLowerCase();
    link.download = `rfid_tags_${currentDate}.${extension}`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showSuccess(t("export_successful"));
  } catch (error) {
    console.error("Error exporting data:", error);
    showError(t("export_failed"));
  } finally {
    loading.value = false;
  }
};

const getStatusChipColor = (status) => {
  const colors = {
    READY: "blue",
    USING: "success",
    USED: "grey-darken-1",
    DAMAGED: "error",
  };
  return colors[status] || "grey";
};

const handleUpdateOptions = (newOptions) => {
  const sortByObject =
    newOptions.sortBy.length > 0
      ? newOptions.sortBy[0]
      : { key: "", order: "" };
  tableOptions.value = {
    page: newOptions.page,
    itemsPerPage: newOptions.itemsPerPage,
    sortBy: sortByObject.key || "",
    sortDesc: sortByObject.order === "desc",
  };
  fetchAllTagsWithLastSeen();
};

const handleSearch = () => {
  tableOptions.value.page = 1;
  fetchAllTagsWithLastSeen();
};

const clearSearch = () => {
  searchText.value = "";
  startDate.value = "";
  endDate.value = "";
  selectedStatus.value = null;
  tableOptions.value.page = 1;
  fetchAllTagsWithLastSeen();

  // Add confetti effect for visual feedback
  showSuccess(t("search_cleared") || "ล้างการค้นหาเรียบร้อย");
};

const fetchAllTagsWithLastSeen = async () => {
  loading.value = true;
  try {
    const params = {
      page: tableOptions.value.page - 1,
      itemsPerPage: tableOptions.value.itemsPerPage,
      sort: tableOptions.value.sortBy || "usageStatus",
      direction: tableOptions.value.sortDesc ? "ASC" : "DESC",
      searchText: searchText.value || "",
      startDate: startDate.value || "",
      endDate: endDate.value || "",
      status: selectedStatus.value || "",
    };
    console.log("Fetch parameter: ", params);

    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );
    console.log("Fetch parameter removed: ", params);
    const response = await api.get("/api/rfid_tags/last_seen", { params });
    console.log(response);
    devices.value = response.data.content;
    totalRecords.value = response.data.totalElements;
  } catch (error) {
    console.error("Error fetching devices:", error);
    showError(t("error_loading_tags") || "เกิดข้อผิดพลาดในการโหลดข้อมูล RFID");
  } finally {
    loading.value = false;
  }
};

const setTagFromUsedToReady = async (item) => {
  confirmDialog.show = true;
  confirmDialog.title = t("confirm_change_status") || "ยืนยันการเปลี่ยนสถานะ";
  confirmDialog.message =
    t("confirm_set_to_ready_message", { rfid: item.rfidNumber }) ||
    `คุณต้องการเปลี่ยนสถานะ RFID ${item.rfidNumber} เป็น READY หรือไม่?`;
  confirmDialog.confirmText = t("confirm") || "ยืนยัน";
  confirmDialog.color = "success";
  confirmDialog.icon = "mdi-refresh";
  confirmDialog.action = async () => {
    loading.value = true;
    try {
      const response = await api.put(
        `/api/rfid_tags/set_ready/${item.rfidNumber}`
      );
      showSuccess(t("rfid_status_updated_successfully"));
      console.log(response);
    } catch (error) {
      console.error("Error setting RFID tag to READY:", error);
      showError(error.response?.data || t("error_updating_tag"));
    } finally {
      loading.value = false;
      confirmDialog.show = false;
      await fetchAllTagsWithLastSeen();
    }
  };
};

const setTagToDamaged = async (item) => {
  confirmDialog.show = true;
  confirmDialog.title = t("confirm_change_status") || "ยืนยันการเปลี่ยนสถานะ";
  confirmDialog.message =
    t("confirm_set_to_damaged_message", { rfid: item.rfidNumber }) ||
    `คุณต้องการเปลี่ยนสถานะ RFID ${item.rfidNumber} เป็น DAMAGED หรือไม่?`;
  confirmDialog.confirmText = t("confirm") || "ยืนยัน";
  confirmDialog.color = "error";
  confirmDialog.icon = "mdi-close-thick";
  confirmDialog.action = async () => {
    loading.value = true;
    try {
      const response = await api.put(
        `/api/rfid_tags/set_damaged/${item.rfidNumber}`
      );
      showSuccess(t("rfid_status_updated_successfully"));
      console.log(response);
    } catch (error) {
      console.error("Error setting RFID tag to DAMAGED:", error);
      showError(error.response?.data || t("error_updating_tag"));
    } finally {
      loading.value = false;
      confirmDialog.show = false;
      await fetchAllTagsWithLastSeen();
    }
  };
};

onMounted(async () => {
  // Apply smooth page transition
  document.body.classList.add("page-transition");
  setTimeout(() => {
    document.body.classList.remove("page-transition");
  }, 300);

  // อ่านพารามิเตอร์ status จาก URL
  const status = router.currentRoute.value.query.status;
  if (status) {
    // ตั้งค่าตัวกรองสถานะโดยอัตโนมัติ
    selectedStatus.value = status;
    // แสดง toast แจ้งเตือนว่ามีการกรองข้อมูลโดยอัตโนมัติ
    showSuccess(t('filter_applied_automatically') || `กรองข้อมูลสถานะ ${status} โดยอัตโนมัติ`);
    
    // เรียกค้นหาทันทีหลังจากตั้งค่าตัวกรอง
    await handleSearch();
  }

  await fetchAllTagsWithLastSeen();
  await getSizes();
  await getTypes();
  currentSize.value = rfidSize.value?.[0] || "";
  currentType.value = rfidType.value?.[0] || "";
});

// ฟังก์ชันเพื่อตรวจสอบว่าตัวกรองถูกเลือกจาก Dashboard หรือไม่
const isFilterFromDashboard = computed(() => {
  return !!router.currentRoute.value.query.status;
});
</script>

<style scoped>
/* หลักการออกแบบทั่วไป */
.rfid-management-page {
  background-color: #f8f9fa;
  min-height: calc(100vh - 64px);
}

/* สไตล์สำหรับการ์ด */
.header-card,
.search-card,
.data-table-card,
.tags-table-card,
.dialog-card {
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

.search-card:hover,
.data-table-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
  transform: translateY(-2px);
}

/* ส่วนหัว */
.gradient-header {
  background: linear-gradient(135deg, #0288d1 0%, #01579b 100%);
  color: white;
  height: 64px;
  padding: 0 24px;
}

/* ส่วนค้นหา */
.filter-header {
  background-color: #f0f4f8;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  color: #37474f;
  font-weight: 600;
}

.search-field :deep(.v-field__field),
.date-field :deep(.v-field__field),
.status-field :deep(.v-field__field) {
  min-height: 44px;
}

.search-field :deep(.v-field),
.date-field :deep(.v-field),
.status-field :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.search-field:hover :deep(.v-field),
.date-field:hover :deep(.v-field),
.status-field:hover :deep(.v-field) {
  background-color: #f5f7fa;
}

.search-button,
.clear-button,
.add-button,
.export-button {
  height: 44px;
  border-radius: 8px !important;
  letter-spacing: 0.5px;
  font-weight: 500;
  text-transform: none;
  transition: all 0.2s ease;
}

.search-button {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%) !important;
  color: white !important;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1) !important;
}

.search-button:hover {
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-1px);
}

.clear-button {
  border: 1px solid #cfd8dc !important;
  color: #546e7a !important;
}

.clear-button:hover {
  background-color: #f5f7fa !important;
  transform: translateY(-1px);
}

/* แถบกิจกรรม */
.action-bar {
  padding: 8px 16px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.export-label {
  color: #e65100;
  font-weight: 500;
}

.export-button {
  color: #e65100 !important;
  border-color: #e65100 !important;
}

.export-button:hover {
  background-color: rgba(230, 81, 0, 0.05) !important;
  transform: translateY(-1px);
}

.add-button {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%) !important;
  color: white !important;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1) !important;
  padding: 0 24px !important;
}

.add-button:hover {
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-1px);
}

/* ตาราง RFID */
.data-table {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  white-space: nowrap;
}

:deep(.data-table th) {
  background: linear-gradient(to right, #eceff1, #cfd8dc) !important;
  font-weight: 600 !important;
  color: #37474f !important;
  letter-spacing: 0.5px;
  white-space: nowrap;
  padding: 14px 16px !important;
  text-transform: none !important;
  font-size: 14px !important;
}

:deep(.data-table td) {
  padding: 12px 16px !important;
  font-size: 14px;
  transition: background-color 0.3s;
}

:deep(.data-table tbody tr:hover td) {
  background-color: rgba(0, 0, 0, 0.03) !important;
}

:deep(.v-data-table__wrapper) {
  border-radius: 8px;
  overflow: hidden;
}

.index-column {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eff6ff;
  color: #1976d2;
  font-weight: 600;
  margin: 0 auto;
}

.date-column {
  font-family: "Roboto Mono", monospace;
  color: #607d8b;
  white-space: nowrap;
}

/* Status Chips */
.status-chip {
  min-width: 80px;
  border-radius: 50px !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 4px 12px !important;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-transform: capitalize;
  white-space: nowrap;
}

/* Action Buttons */
.action-button {
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  background-color: rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Add Dialog */
.dialog-header {
  background: linear-gradient(135deg, #0288d1 0%, #01579b 100%);
  color: white;
  padding: 24px !important;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.dialog-actions {
  background-color: #f8f9fa;
}

.rfid-input :deep(.v-field__field),
.size-input :deep(.v-field__field),
.type-input :deep(.v-field__field) {
  min-height: 46px;
}

.add-to-list-button {
  height: 46px;
  border-radius: 8px !important;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.tags-table {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
}

:deep(.tags-table th) {
  background: linear-gradient(to right, #e3f2fd, #bbdefb) !important;
  font-weight: 600 !important;
  color: #1565c0 !important;
  padding: 12px 16px !important;
  font-size: 13px !important;
}

:deep(.tags-table tbody tr:hover) {
  background-color: rgba(33, 150, 243, 0.05) !important;
}

.save-button,
.cancel-button {
  height: 44px;
  min-width: 120px;
  border-radius: 8px !important;
  letter-spacing: 0.5px;
  text-transform: none;
  font-weight: 500;
}

/* Confirm Dialog */
.confirm-dialog :deep(.v-card) {
  border-radius: 16px;
  overflow: hidden;
}

.confirm-header {
  padding: 24px 16px 16px !important;
  font-weight: 600;
}

/* Empty State */
.empty-state {
  min-height: 300px;
  background-color: #fafafa;
  border-radius: 8px;
}

/* Skeleton Loader */
:deep(.v-skeleton-loader) {
  border-radius: 8px;
}

/* Animation for page transition */
.page-transition {
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Adjustments */
@media (max-width: 960px) {
  .action-bar {
    flex-direction: column;
    gap: 16px;
  }

  .search-button,
  .clear-button {
    width: 100%;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}

/* สร้างเอฟเฟค hover ให้กับแถวในตาราง */
:deep(.v-data-table__tr:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  position: relative;
  transition: all 0.2s ease;
}

/* สไตล์ pagination */
:deep(.v-data-table-footer) {
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

:deep(.v-data-table-footer__items-per-page) {
  margin-right: 24px;
}

:deep(.v-data-table-footer__items-per-page .v-select) {
  min-width: 100px;
}

:deep(.v-data-table-footer__items-per-page .v-select .v-field) {
  border-radius: 8px;
  min-height: 40px;
}

:deep(.v-data-table-footer__pagination .v-btn) {
  border-radius: 50%;
  min-width: 36px;
  width: 36px;
  height: 36px;
}

/* สไตล์สำหรับส่วนค้นหาที่กระชับ */
.search-card-compact {
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05) !important;
}

.filter-header-compact {
  background-color: #f5f7fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #37474f;
  font-weight: 500;
  font-size: 0.95rem !important;
  padding: 8px 16px !important;
}

.search-field-compact :deep(.v-field__field),
.date-field-compact :deep(.v-field__field),
.status-field-compact :deep(.v-field__field) {
  min-height: 36px;
}

.search-field-compact :deep(.v-field),
.date-field-compact :deep(.v-field),
.status-field-compact :deep(.v-field) {
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-button-compact,
.clear-button-compact {
  height: 36px !important;
  border-radius: 6px !important;
  letter-spacing: 0.3px;
  font-weight: 500;
  font-size: 0.875rem !important;
  text-transform: none;
}

.search-button-compact {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%) !important;
  color: white !important;
}

.clear-button-compact {
  border: 1px solid #cfd8dc !important;
  color: #546e7a !important;
}

/* แถบกิจกรรมขนาดกระชับ */
.action-bar-compact {
  padding: 6px 12px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.export-label-compact {
  color: #e65100;
  font-weight: 500;
  font-size: 0.875rem;
}

.export-button-compact {
  color: #e65100 !important;
  border-color: #e65100 !important;
  height: 32px !important;
  font-size: 0.875rem !important;
}

.add-button-compact {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%) !important;
  color: white !important;
  padding: 0 16px !important;
  height: 36px !important;
  font-size: 0.875rem !important;
}

/* ปรับ hover effect ให้เบาลง */
.search-button-compact:hover,
.clear-button-compact:hover,
.export-button-compact:hover,
.add-button-compact:hover {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

/* ปรับแต่งตารางให้กระชับขึ้น */
:deep(.data-table th) {
  padding: 8px 12px !important;
  font-size: 0.875rem !important;
}

:deep(.data-table td) {
  padding: 6px 12px !important;
  font-size: 0.875rem;
}

.index-column {
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
}

/* ปรับขนาด Status Chips */
.status-chip {
  min-width: 70px;
  height: 24px !important;
  font-size: 0.75rem !important;
}

/* Action Buttons */
.action-button {
  width: 30px !important;
  height: 30px !important;
}

/* CSS สำหรับ Dialog เพิ่ม Tag ที่ปรับให้เล็กลง */

/* สไตล์สำหรับ Dialog Header */
.dialog-header-compact {
  background: linear-gradient(135deg, #0288d1 0%, #01579b 100%);
  color: white;
  padding: 12px !important; /* ลดขนาด padding */
  font-weight: 500;
  font-size: 1rem !important; /* ลดขนาดฟอนต์ */
  letter-spacing: 0.3px;
}

/* สไตล์สำหรับช่องกรอกข้อมูล */
.rfid-input-compact :deep(.v-field__field),
.size-input-compact :deep(.v-field__field),
.type-input-compact :deep(.v-field__field) {
  min-height: 40px !important; /* ลดความสูงของช่อง */
  max-height: 36px !important;
}

.rfid-input-compact :deep(.v-field),
.size-input-compact :deep(.v-field),
.type-input-compact :deep(.v-field) {
  border-radius: 4px !important; /* ลดความโค้งของขอบ */
  font-size: 0.85rem !important; /* ลดขนาดฟอนต์ */
}

/* ลดขนาดของไอคอนในช่องกรอกข้อมูล */
.rfid-input-compact :deep(.v-field__prepend-inner .v-icon),
.size-input-compact :deep(.v-field__prepend-inner .v-icon),
.type-input-compact :deep(.v-field__prepend-inner .v-icon) {
  font-size: 18px !important; /* ลดขนาดไอคอน */
  margin-right: 4px !important;
}

/* ปรับขนาดป้ายกำกับ (label) ให้เล็กลง */
.rfid-input-compact :deep(.v-field__input),
.size-input-compact :deep(.v-field__input),
.type-input-compact :deep(.v-field__input) {
  font-size: 0.85rem !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.rfid-input-compact :deep(.v-field__label),
.size-input-compact :deep(.v-field__label),
.type-input-compact :deep(.v-field__label) {
  font-size: 0.85rem !important;
}

/* ปรับขนาดปุ่มเพิ่ม */
.add-to-list-button-compact {
  height: 36px !important;
  font-size: 0.85rem !important;
  border-radius: 4px !important;
  letter-spacing: 0 !important;
}

/* ปรับขนาดตารางใน Dialog */
.tags-table.compact-table :deep(th) {
  font-size: 0.8rem !important;
  padding: 8px !important;
  height: 36px !important;
  white-space: nowrap !important;
}

.tags-table.compact-table :deep(td) {
  font-size: 0.8rem !important;
  padding: 4px 8px !important;
  height: 36px !important;
}

/* ป้องกันข้อความขึ้นบรรทัดใหม่ */
.tag-text {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  display: block;
  max-width: 100%;
}

/* ปรับขนาดปุ่มแก้ไขและลบ */
.action-button-compact {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
}

.action-button-compact :deep(.v-icon) {
  font-size: 14px !important;
}

/* ปรับขนาดปุ่มบันทึกและยกเลิก */
.save-button-compact,
.cancel-button-compact {
  height: 32px !important;
  min-width: 100px !important;
  font-size: 0.85rem !important;
  letter-spacing: 0 !important;
  border-radius: 4px !important;
}

/* ปรับแต่ง Dialog Actions */
.dialog-actions-compact {
  background-color: #f8f9fa;
  padding: 8px 12px !important;
}

/* ปรับแต่ง compact-dialog ทั้งหมด */
.compact-dialog :deep(.v-card) {
  border-radius: 8px !important;
  overflow: hidden;
}

/* ปรับแต่ง dialog-card */
.dialog-card :deep(.v-card) {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.dialog-card :deep(.v-card-text) {
  overflow-y: auto;
}

/* สไตล์สำหรับ scrollbar ในตาราง */
.compact-table :deep(.v-table__wrapper)::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.compact-table :deep(.v-table__wrapper)::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 3px;
}

.compact-table :deep(.v-table__wrapper)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}




/* สไตล์ใหม่สำหรับปุ่ม Export */
.export-container {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  padding: 8px 14px !important;
}

.export-container:hover {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.export-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a494d;
  margin-right: 12px;
  white-space: nowrap;
}

.export-icon {
  color: #4a494d;
  margin-right: 8px;
  opacity: 0.8;
}

.export-btn {
  height: 32px !important;
  padding: 0 16px !important;
  border-radius: 6px !important;
  border: 1px solid #4a494d !important;
  background-color: #ffffff !important;
  color: #4a494d !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  margin-left: 8px !important;
  text-transform: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease !important;
}

.export-btn:hover {
  background-color: #4a494d !important;
  color: white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-1px) !important;
}

.export-btn-icon {
  position: absolute !important;
  left: 12px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-size: 16px !important;
}

.export-btn-text {
  font-size: 0.85rem !important;
  margin-top: 1px !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  text-transform: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.status-from-dashboard :deep(.v-field) {
  background-color: rgba(33, 150, 243, 0.1);
  border: 1px solid #1976d2;
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(33, 150, 243, 0);
  }
}
</style>
