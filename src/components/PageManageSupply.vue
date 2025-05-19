<!-- PageManagementSupply.vue -->

<template>
  <v-container fluid>
    <v-row>
      <!-- Header Section -->
      <v-col cols="12">
        <v-card class="mb-4">
          <HeaderCommon :title="t('supply_management')" />
        </v-card>
      </v-col>

      <!-- Search Section -->
      <v-col cols="12">
        <v-card class="mb-3 search-card" elevation="1">
          <v-card-title class="py-2 filter-header">
            <v-icon size="small" class="me-1">mdi-magnify</v-icon>
            {{ t("search") }}
          </v-card-title>
          <v-card-text class="py-2">
            <v-row dense>
              <!-- Text Search -->
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="searchData.searchText"
                  :label="t('type_to_search')"
                  prepend-inner-icon="mdi-text-search"
                  clearable
                  hide-details
                  variant="outlined"
                  density="compact"
                  class="search-field"
                ></v-text-field>
              </v-col>

              <!-- Date Range -->
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="searchData.startDate"
                  :label="t('start_date')"
                  type="date"
                  prepend-inner-icon="mdi-calendar-start"
                  clearable
                  hide-details
                  variant="outlined"
                  density="compact"
                  class="date-field"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="searchData.endDate"
                  :label="t('end_date')"
                  type="date"
                  prepend-inner-icon="mdi-calendar-end"
                  clearable
                  hide-details
                  variant="outlined"
                  density="compact"
                  class="date-field"
                ></v-text-field>
              </v-col>

              <!-- Supply Type Dropdown -->
              <v-col cols="12" md="2">
                <v-select
                  v-model="searchData.supplyType"
                  :items="supplyTypesOptions"
                  :label="t('supply_type')"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-tag-multiple"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="select-field"
                  :rules="[(value) => gatewayValidationRule(value, t)]"
                ></v-select>
              </v-col>

              <!-- Organization -->
              <v-col cols="12" md="3">
                <v-select
                  v-model="searchData.organizationId"
                  :items="organizationsSearchOptions"
                  :label="t('select_organization')"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-office-building-outline"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="select-field"
                  @update:model-value="
                    handleOrganizationChange($event, 'search')
                  "
                ></v-select>
              </v-col>

              <!-- Armory -->
              <v-col cols="12" md="3">
                <v-select
                  v-model="searchData.armoryId"
                  :items="armoriesSearchOptions"
                  :label="t('select_armory')"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-shield-outline"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="select-field"
                  @update:model-value="handleArmoryChange($event, 'search')"
                ></v-select>
              </v-col>

              <!-- Building -->
              <v-col cols="12" md="3">
                <v-select
                  v-model="searchData.buildingId"
                  :items="buildingsSearchOptions"
                  :label="t('select_building')"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-domain"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="select-field"
                  @update:model-value="handleBuildingChange($event, 'search')"
                ></v-select>
              </v-col>

              <!-- Floor -->
              <v-col cols="12" md="3">
                <v-select
                  v-model="searchData.floorId"
                  :items="floorsSearchOptions"
                  :label="t('select_floor')"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-floor-plan"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="select-field"
                  @update:model-value="handleFloorChange($event, 'search')"
                ></v-select>
              </v-col>

              <!-- Zone -->
              <v-col cols="12" md="3">
                <v-select
                  v-model="searchData.zoneId"
                  :items="zonesSearchOptions"
                  :label="t('select_zone')"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-map-marker-radius"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="select-field"
                  @update:model-value="handleZoneChange($event, 'search')"
                ></v-select>
              </v-col>

              <!-- Room -->
              <v-col cols="12" md="3">
                <v-select
                  v-model="searchData.roomId"
                  :items="roomsSearchOptions"
                  :label="t('select_room')"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-door"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="select-field"
                  @update:model-value="handleRoomChange($event, 'search')"
                ></v-select>
              </v-col>

              <!-- Partition -->
              <v-col cols="12" md="3">
                <v-select
                  v-model="searchData.partitionId"
                  :items="partitionsSearchOptions"
                  :label="t('select_partition')"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-view-grid-outline"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="select-field"
                  @update:model-value="handlePartitionChange($event, 'search')"
                ></v-select>
              </v-col>

              <!-- Shelf -->
              <v-col cols="12" md="3">
                <v-select
                  v-model="searchData.shelfId"
                  :items="shelveSearchOptions"
                  :label="t('select_shelf')"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-bookshelf"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="select-field"
                  @update:model-value="handleShelfChange($event, 'search')"
                ></v-select>
              </v-col>

              <!-- Slot -->
              <v-col cols="12" md="3">
                <v-select
                  v-model="searchData.slotId"
                  :items="slotsSearchOptions"
                  :label="t('select_slot')"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-view-grid"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="select-field"
                  @update:model-value="handleSlotChange($event, 'search')"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Search and Clear Buttons -->
            <v-row class="mt-3">
              <v-col cols="6" md="12"></v-col>
              <v-col cols="6" md="12"  class="d-flex justify-end">
                <v-btn
                  color="primary" 
                  size="small"
                  @click="handleSearch"
                  class="search-button"
                  elevation="2"
                  prepend-icon="mdi-magnify"
                >
                  {{ t("search") }}
                </v-btn>
                <v-btn
                  color="grey-darken-1"
                  variant="outlined"
                  size="small"
                  @click="clearSearch"
                  class="clear-button"
                  prepend-icon="mdi-eraser"
                >
                  {{ t("clear_search") }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Report and Export Buttons Section -->
      <v-col cols="12">
        <div
          class="d-flex justify-space-between align-center mb-3 action-bar-compact flex-wrap"
        >
          <!-- Export Report Section -->
          <div class="export-container mb-2 mb-md-0">
            <span class="export-label">
              <v-icon size="small" class="export-icon"
                >mdi-export-variant</v-icon
              >
              {{ t("export_report") }}
            </span>
            <div class="export-buttons-wrapper">
              <v-btn
                v-for="format in ['CSV', 'HTML', 'PDF', 'EXCEL']"
                :key="format"
                variant="outlined"
                color="secondary"
                size="small"
                class="export-btn"
                @click="exportReport(format)"
              >
                <v-icon size="small" class="export-btn-icon"
                  >mdi-file-{{ format.toLowerCase() }}</v-icon
                >
                <span class="export-btn-text">{{ format }}</span>
              </v-btn>
            </div>
          </div>

          <!-- Data Export and Add Buttons -->
          <div class="d-flex align-center flex-wrap">
            <div class="export-container me-0 me-md-3 mb-2 mb-md-0">
              <span class="export-label">
                <v-icon size="small" class="export-icon"
                  >mdi-database-export</v-icon
                >
                {{ t("export_data") }}
              </span>
              <div class="export-buttons-wrapper">
                <v-btn
                  variant="outlined"
                  color="secondary"
                  size="small"
                  class="export-btn export-json-btn"
                  @click="exportData('JSON')"
                >
                  <v-icon size="small" class="export-btn-icon"
                    >mdi-code-json</v-icon
                  >
                  <span class="export-btn-text">JSON</span>
                </v-btn>
              </div>
            </div>

            <!-- Add Button -->
            <div class="add-btn-wrapper">
              <v-btn
                v-if="isAdmin"
                color="primary"
                size="small"
                elevation="1"
                @click="handleAddSupply"
                class="add-button-compact"
              >
                <v-icon size="small" class="me-1">mdi-plus-circle</v-icon>
                {{ t("add") }}
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>

      <!-- Table Section -->
      <v-col cols="12">
        <v-sheet class="pa-3 elevation-1">
          <div class="scrollable-table">
            <v-data-table-server
              v-model:page="tableOptions.page"
              v-model:items-per-page="tableOptions.itemsPerPage"
              :headers="visibleHeaders"
              :items="filteredTableItems"
              :items-length="filteredTotalRecords"
              :loading="loading"
              :search="search"
              :items-per-page-options="defaultItemsPerPageOptions"
              :items-per-page-text="itemsPerPageText"
              @update:options="handleUpdateOptions"
              class="custom-table"
            >
              <!-- Column visibility toggle -->
              <template v-slot:top>
                <v-select
                  v-model="visibleColumns"
                  :items="allHeaders"
                  item-title="title"
                  item-value="key"
                  :label="t('select_visible_columns')"
                  multiple
                  chips
                ></v-select>
              </template>

              <!-- Expandable rows and other slots -->

              <!-- Expandable rows -->
              <template v-slot:expanded-row="{ columns, item }">
                <tr @click="handleRowClick($event, { item })">
                  <td :colspan="columns.length">
                    <v-card flat>
                      <v-card-text>
                        <v-row>
                          <v-col
                            cols="4"
                            v-for="(value, key) in item.raw"
                            :key="key"
                          >
                            <strong>{{ key }}:</strong> {{ value }}
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </td>
                </tr>
              </template>

              <!-- Translated template for trackingStatus -->
              <template v-slot:item.trackingStatus="{ item }">
                <span
                  :class="[
                    'status-chip',
                    `status-${item.trackingStatus.toLowerCase()}`,
                  ]"
                >
                  {{
                    t(`tracking_statuses.${item.trackingStatus.toUpperCase()}`)
                  }}
                </span>
              </template>

              <!-- Translated template for requisitionStatus -->
              <template v-slot:item.requisitionStatus="{ item }">
                <span
                  :class="[
                    'status-chip',
                    `status-${item.requisitionStatus.toLowerCase()}`,
                  ]"
                >
                  {{ t(`requisition_statuses.${item.requisitionStatus}`) }}
                </span>
              </template>

              <!-- Actions column template for main table -->
              <template v-slot:item.actions="{ item }">
                <div class="d-flex gap-2">
                  <!-- Only show action buttons if supply type is not Gateway -->

                  <!--<template v-if="item.supplyType !== 'Gateway'">-->

                  <v-btn
                    v-if="isAdmin"
                    icon
                    variant="text"
                    size="small"
                    color="red"
                    @click="handleTransfer(item)"
                  >
                    <v-icon>mdi-transfer</v-icon>
                    <v-tooltip activator="parent">
                      {{ t("transfer_item") }}
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="red"
                    @click="handleGotoLocation(item)"
                  >
                    <v-icon>mdi-map-marker-radius</v-icon>
                    <v-tooltip activator="parent">
                      {{ t("view_location") }}
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="blue"
                    @click="handleSeeDetailsSupply(item)"
                  >
                    <v-icon>mdi-clipboard-search-outline</v-icon>
                    <v-tooltip activator="parent">
                      {{ t("view_details") }}
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    v-if="isAdmin"
                    icon
                    variant="text"
                    size="small"
                    color="primary"
                    @click="handleEditSupply(item)"
                  >
                    <v-icon>mdi-pencil-outline</v-icon>
                    <v-tooltip activator="parent">
                      {{ t("edit_item") }}
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    v-if="isAdmin"
                    icon
                    variant="text"
                    size="small"
                    color="error"
                    @click="handleDeleteSupply(item)"
                  >
                    <v-icon>mdi-delete-outline</v-icon>
                    <v-tooltip activator="parent">
                      {{ t("delete_item") }}
                    </v-tooltip>
                  </v-btn>

                  <!-- </template> -->

                  <!-- Optional: Show a message or disabled icon for Gateway items -->
                  <!--
                  <template v-else>
                    <span class="text-caption text-grey">
                      {{ t('actions_disabled_for_gateway') }}
                    </span>
                  </template>-->
                </div>
              </template>

              <template v-slot:item.receivedDate="{ item }">
                {{ formatDate(item.receivedDate) }}
              </template>
            </v-data-table-server>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Import Dialog -->
    <v-dialog v-model="dialogs.import" width="1000">
      <v-card>
        <v-card-title class="text-center">{{ t("add_supply") }}</v-card-title>
        <v-card-text>
          <!-- Template Download Section -->
          <div class="text-center mb-4">
            {{ t("download_template_to_system") }}
          </div>

          <!-- Template File Link -->
          <div class="text-center mb-4">
            <v-btn variant="text" color="primary" @click="downloadTemplate">
              Templated_form.xlsx
            </v-btn>
          </div>

          <!-- Guide Line Text -->
          <div class="text-center mb-6">{{ t("download_guide_line") }}</div>

          <!-- Import File Section -->
          <div class="d-flex align-center mb-4">
            <div class="mr-2">Import files</div>
            <v-text-field
              v-model="selectedFileName"
              readonly
              hide-details
              class="flex-grow-1"
            ></v-text-field>
            <v-btn color="primary" class="ml-2" @click="selectFile">
              {{ t("select_file") }}
            </v-btn>
            <input
              type="file"
              ref="fileInput"
              class="d-none"
              accept=".xlsx,.xls"
              @change="handleFileSelect"
            />
          </div>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            color="grey"
            variant="outlined"
            @click="dialogs.import = false"
          >
            {{ t("cancel_button") }}
          </v-btn>
          <v-btn
            color="primary"
            class="ml-2"
            @click="importFile"
            :disabled="!selectedFile"
          >
            {{ t("save_button") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

  <!-- Supply Details -->

  <SupplyDetailsDialog
    v-if="dialogs.details"
    v-model="dialogs.details"
    :supply="selectedSupply"
    :rootOrganizationId="selectedOrganizationId"
    :lowestOrganizationId="lowestOrganizationId"
  />

  <!-- Location Dialog -->
  <LocationDialog
    v-model="dialogs.location"
    v-if="selectedOrganizationId !== null"
    :organizationId="selectedOrganizationId"
  />

  <!-- Delete Confirm Dialog-->
  <v-dialog v-model="dialogs.confirmDelete" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">{{ t("confirm_delete") }}</v-card-title>
      <v-card-text>
        <div class="text-body-1">
          <div class="mb-2">
            {{ t("supply_number") }}: {{ dialogs.deleteItem?.supplyNumber }}
          </div>
          <div>{{ t("rfid_tag") }}: {{ dialogs.deleteItem?.rfidTag }}</div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="dialogs.confirmDelete = false">{{
          t("cancel")
        }}</v-btn>
        <v-btn color="error" @click="confirmDeleteSupply">{{
          t("delete")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Add/Edit Supply Dialog -->
  <v-dialog
    v-if="dialogs.add"
    v-model="dialogs.add"
    max-width="1200px"
    @click:outside="closeDialog"
  >
    <v-card>
      <v-card-title class="text-h5">
        {{ dialogs.mode === "edit" ? t("edit_supply") : t("add_supply") }}
      </v-card-title>

      <v-card-text>
        <v-container>
          <!-- Supply Image Preview Section -->
          <v-row>
            <v-col cols="12" md="6">
              <div class="image-preview d-flex align-center justify-center">
                <v-img
                  v-if="imagePreview"
                  :src="imagePreview"
                  height="200"
                  contain
                  class="mb-2 cursor-pointer"
                  @click="dialogs.imagePreview = true"
                  style="background-color: #e8e8e7"
                />
                <div
                  v-else
                  class="image-placeholder d-flex align-center justify-center"
                >
                  <span class="text-h6 text-grey-darken-1">{{
                    t("image_area")
                  }}</span>
                </div>
              </div>
              <v-btn color="primary" class="mt-2" @click="triggerImageUpload">
                {{ t("choose_image") }}
              </v-btn>
              <input
                ref="fileInputRef"
                type="file"
                class="d-none"
                accept="image/*"
                @change="handleImageUpload"
                style="display: none"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.requisitionStatus"
                :items="requisitionStatusOptions"
                :label="t('requisition_status')"
                :rules="[requiredRule]"
                variant="outlined"
                density="comfortable"
                :readonly="dialogs.mode === 'add'"
                :disabled="dialogs.mode === 'add'"
                :hint="dialogs.mode === 'add' ? t('auto_set_to_available') : ''"
                persistent-hint
              ></v-select>
            </v-col>
          </v-row>

          <v-form ref="form" v-model="valid">
            <!-- Supply Details Section -->
            <v-row>
              <v-col cols="6">
                <div class="text-h6 mb-0">{{ t("supply_details") }}</div>
              </v-col>

              <v-col cols="6" v-if="dialogs.mode === 'edit'">
                <div class="text-caption text-red mb-0 text-center">
                  {{ t("rfid_tag_reuse_warning") }}
                </div>
              </v-col>

              <v-col cols="6" v-if="dialogs.mode === 'add'">
                <div class="text-caption text-red mb-0 text-right">
                  {{ t("click_to_scan") }}
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.supplyNumber"
                  :label="t('supply_number')"
                  :rules="[requiredRule, maxLength(100)]"
                  required
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Modify RFID TAG START -->

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.rfidTagId"
                  :label="t('rfid_tag')"
                  :rules="[requiredRule, rfidNumberRule]"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  :append-icon="'mdi-qrcode'"
                  @click:append="scanRFID"
                ></v-text-field>
              </v-col>

              <!-- RFID Tag Selector Table -->
              <v-col cols="12">
                <v-card class="mt-2 mb-4">
                  <v-card-title class="d-flex align-center">
                    <span>{{ t("select_rfid_tag") }}</span>
                    <v-spacer></v-spacer>
                    <v-text-field
                      v-model="rfidSearchQuery"
                      :label="t('search_rfid_tags')"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      class="ml-4"
                      style="max-width: 300px"
                      append-inner-icon="mdi-magnify"
                      clearable
                      @update:model-value="handleRfidSearch"
                    ></v-text-field>
                  </v-card-title>

                  <v-data-table
                    class="custom-table elevation-1"
                    :headers="rfidTagHeaders"
                    :items="readyRfidTags"
                    :loading="loadingTags"
                    :items-per-page="tagItemsPerPage"
                    :items-per-page-options="[]"
                    density="compact"
                    fixed-header
                    height="300px"
                    hover
                    @click:row="(event, row) => selectRfidTag(row)"
                  >
                    <!-- Custom template for tag number to highlight matching search text -->
                    <template v-slot:item.rfidNumber="{ item }">
                      <div class="font-weight-medium">
                        {{ item.rfidNumber }}
                      </div>
                    </template>

                    <!-- Custom templates for other columns -->
                    <template v-slot:item.rfidType="{ item }">
                      {{ item.rfidType.typeName }}
                    </template>

                    <template v-slot:item.rfidSize="{ item }">
                      {{ item.rfidSize.sizeName }}
                    </template>

                    <!-- No results message -->
                    <template v-slot:no-data>
                      <div class="pa-4 text-center">
                        {{ t("no_ready_rfid_tags_found") }}
                      </div>
                    </template>
                  </v-data-table>

                  <!-- Pagination for tag table -->
                  <div class="d-flex justify-center pa-2">
                    <v-pagination
                      v-model="tagPage"
                      :length="tagTotalPages"
                      @update:model-value="fetchReadyRfidTags"
                      :disabled="loadingTags"
                      total-visible="5"
                    ></v-pagination>
                  </div>
                </v-card>
              </v-col>

              <!-- Modify RFID TAG END -->

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.supplyName"
                  :label="t('supply_name')"
                  :rules="[requiredRule, maxLength(100)]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.supplyModel"
                  :label="t('supply_model')"
                  :rules="[requiredRule, maxLength(100)]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-combobox
                  v-model="formData.supplyType"
                  :items="supplyTypesOptions"
                  :label="t('supply_type')"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  required
                  :rules="[
                    requiredRule,
                    (value) => gatewayValidationRule(value, t),
                  ]"
                ></v-combobox>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.quantity"
                  :label="t('quantity')"
                  type="number"
                  :rules="[requiredRule, positiveNumberRule]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-combobox
                  v-model="formData.unitOfMeasure"
                  :items="unitOptions"
                  :label="t('unit')"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  required
                  :rules="[requiredRule]"
                ></v-combobox>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.receivedDate"
                  :label="t('received_date')"
                  type="datetime-local"
                  :rules="[requiredRule]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Received By -->
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.receivedBy"
                  :label="t('received_by')"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Tracking Status -->
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.trackingStatus"
                  :items="trackingStatusOptions"
                  :label="t('tracking_status')"
                  :rules="[requiredRule]"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.transferDate"
                  :label="t('transfer_date')"
                  type="datetime-local"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Transfer By -->
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.transferBy"
                  :label="t('transfer_by')"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Location Section -->
            <v-row>
              <v-col cols="12">
                <div class="text-h6 mb-4">{{ t("location_installation") }}</div>
              </v-col>

              <!-- Replace all the v-select organization hierarchy with: -->
              <OrganizationHierarchySelect
                v-model="formData"
                :organization-hierarchy="organizationHierarchy"
                context="dialog"
                :hide-details="false"
                @hierarchy-change="handleHierarchyChange"
              />
            </v-row>

            <!-- Map Section -->
            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-1 mb-2">{{ t("location_map") }}</div>
                <v-sheet
                  class="map-preview-area d-flex align-center justify-center position-relative"
                  color="grey-lighten-3"
                  rounded
                  height="600px"
                  width="100%"
                >
                  <v-img
                    v-if="selectedMapPicture?.imagePath || mapPreview"
                    :src="mapPreview || selectedMapPicture.imagePath"
                    contain
                    height="100%"
                    width="100%"
                    @click="handleMapClick"
                    @load="adjustMapMarkerPosition"
                    class="cursor-pointer"
                  />
                  <!-- Map Marker -->
                  <v-icon
                    v-if="mapCoordinates"
                    color="red"
                    size="48"
                    class="position-absolute"
                    :style="getMapMarkerStyle"
                  >
                    mdi-map-marker
                  </v-icon>
                  <!-- No Map Available Text -->
                  <div
                    v-if="!selectedMapPicture?.imagePath && !mapPreview"
                    class="text-grey position-absolute w-100 text-center"
                    style="
                      top: 50%;
                      transform: translateY(-50%);
                      font-size: 1.2rem;
                    "
                  >
                    {{ t("no_map_available") }}
                  </div>
                </v-sheet>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="formData.latitude"
                  :label="t('latitude')"
                  type="number"
                  step="0.000001"
                  variant="outlined"
                  density="comfortable"
                  disabled
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  v-model="formData.longitude"
                  :label="t('longitude')"
                  type="number"
                  step="0.000001"
                  variant="outlined"
                  density="comfortable"
                  disabled
                ></v-text-field>
              </v-col>

              <!-- X-Y Coordinates Location marker for reference but not dynamic -->
              <!-- Real location is based on Reader's detection of RFID -->
              <v-col cols="12" md="3">
                <v-text-field
                  :model-value="mapCoordinates?.x ?? ''"
                  :label="t('x-coordinate-map')"
                  type="number"
                  step="0.000001"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  :rules="[() => requiredCoordinateRule(mapCoordinates?.x, t)]"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  :model-value="mapCoordinates?.y ?? ''"
                  :label="t('y-coordinate-map')"
                  type="number"
                  step="0.000001"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  :rules="[() => requiredCoordinateRule(mapCoordinates?.y, t)]"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <div class="d-flex">
          <v-btn
            color="error"
            variant="outlined"
            @click="closeDialog"
            class="me-4"
          >
            {{ t("cancel") }}
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            @click="handleSubmit"
            :disabled="!valid || !isOrganizationSelected()"
            class="me-6"
          >
            {{ dialogs.mode === "edit" ? t("update") : t("save") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- RFID Scanning Dialog -->
  <v-dialog v-model="isScanning" persistent max-width="400">
    <v-card>
      <v-card-title class="text-center pa-4">
        {{ t("scan_rfid") }}
      </v-card-title>

      <v-card-text class="text-center pa-4">
        <v-icon size="64" color="primary" class="mb-4 animate-pulse"
          >mdi-nfc</v-icon
        >

        <div class="text-body-1 mb-4">
          {{ t("place_rfid_tag") }}
        </div>

        <v-progress-circular
          indeterminate
          color="primary"
          class="mb-4"
        ></v-progress-circular>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="error" variant="outlined" @click="isScanning = false">
          {{ t("cancel") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <MapViewer
    v-if="showMapViewerDialog"
    :isVisible="showMapViewerDialog"
    :propsSupplyId="propsSupplyId"
    :propsSupplyNumber="propsSupplyNumber"
    :propsRfidNumber="propsRfidNumber"
    :propsReaderSerialNumber="propsReaderSerialNumber"
    :propsReaderData="propsReaderData"
    :propsCallerType="'armory'"
    @close="handleMapViewerClose"
  />

  <RelocateSupplyDialog
    v-if="selectedSupplyForRelocation"
    :show="showRelocateDialog"
    :supply="selectedSupplyForRelocation"
    :organization-hierarchy="organizationHierarchy"
    @close="showRelocateDialog = false"
    @relocated="handleRelocated"
    @canceled="handleRelocated"
  />
</template>

<script setup>
import HeaderCommon from "@/components/HeaderCommon.vue";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import api from "@/axiostoastapi.js";
import { useI18n } from "vue-i18n";
import { useTokenStore } from "@/stores/token.js";
import SupplyDetailsDialog from "@/components/SupplyDetailsDialog.vue";
import LocationDialog from "@/components/LocationDialog.vue";
import {
  maxLength,
  requiredRule,
  positiveNumberRule,
  rfidNumberRule,
  gatewayValidationRule,
  requiredCoordinateRule,
} from "@/utils/validationRules";
import OrganizationHierarchySelect from "@/components/OrganizationHierarchySelect.vue";
import MapViewer from "@/components/MapViewer.vue";
import RelocateSupplyDialog from "@/components/RelocateSupplyDialog.vue";
import { hasAdminAccess } from "@/utils/permissions";
import {
  showSuccess,
  showError,
  showWarning,
  showNotification,
} from "@/utils/snackbar.js";

const showGateways = ref(false);
const showMapViewer = ref(false);
const handleMapViewerClose = () => {
  console.log("Map viewer closed");
  closeViewer();
};
const closeViewer = () => {
  showMapViewerDialog.value = false;
};

const showMapViewerDialog = ref(false);
const propsSupplyId = ref(null);
const propsRfidNumber = ref(null);
const propsSupplyNumber = ref(null);
const propsReaderSerialNumber = ref(null);
const propsReaderData = ref(null);

const supplyCoordinates = ref(null);
const isSearchActive = ref(false);
const tokenStore = useTokenStore();
const username = tokenStore.getUsername();
const isAdmin = computed(() => hasAdminAccess());

// Dialog states
const dialogs = ref({
  installation: false,
  add: false,
  import: false,
  details: false,
  confirmDelete: false,
  mode: "add", // Will be either 'add' or 'edit'
  deleteItem: null,
  location: false,
});
const { t, locale } = useI18n();
const tableOptions = ref({
  page: 1,
  itemsPerPage: 25,
  sortBy: [],
  sortDesc: false,
});
const items = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const search = ref("");

const defaultItemsPerPageOptions = [5, 10, 25, 50];
const itemsPerPageText = "Items per page:";

const allHeaders = computed(() => [
  { title: t("index"), key: "index", sortable: false },
  { title: t("column_rfid_tag"), key: "rfidTag", sortable: true },
  { title: t("column_supply_number"), key: "supplyNumber", sortable: true },
  { title: t("column_supply_name"), key: "supplyName", sortable: true },
  { title: t("column_supply_model"), key: "supplyModel", sortable: true },
  { title: t("column_supply_type"), key: "supplyType", sortable: true },
  { title: t("column_quantity"), key: "quantity", sortable: true },
  { title: t("column_unit"), key: "unit", sortable: true },
  { title: t("column_organization"), key: "organization", sortable: false },
  { title: t("column_armory"), key: "armory", sortable: false },
  { title: t("column_building"), key: "building", sortable: false },
  { title: t("column_floor"), key: "floor", sortable: false },
  { title: t("column_zone"), key: "zone", sortable: false },
  { title: t("column_room"), key: "room", sortable: false },
  { title: t("column_partition"), key: "partition", sortable: false },
  { title: t("column_shelf"), key: "shelf", sortable: false },
  { title: t("column_slot"), key: "slot", sortable: false },
  { title: t("column_received_date"), key: "receivedDate", sortable: true },
  { title: t("column_status"), key: "trackingStatus", sortable: true },
  {
    title: t("column_requisition_status"),
    key: "requisitionStatus",
    sortable: true,
  },
  { title: t("column_actions"), key: "actions", sortable: false },
]);
const visibleColumns = ref([
  "index",
  "rfidTag",
  "supplyNumber",
  "supplyName",
  "supplyModel",
  "supplyType",
  "quantity",
  "unit",
  "organization",
  "receivedDate",
  "trackingStatus",
  "requisitionStatus",
  "actions",
]);

const visibleHeaders = computed(() => {
  return allHeaders.value.filter((header) =>
    visibleColumns.value.includes(header.key)
  );
});
// Add this computed property
const tableItems = computed(() => {
  return items.value.map((item, index) => ({
    ...item,
    // These will now be reactive to locale changes
    organization: getTranslation(
      item.raw.hierarchyTranslations,
      "ORGANIZATION"
    ),
    armory: getTranslation(item.raw.hierarchyTranslations, "ARMORY"),
    building: getTranslation(item.raw.hierarchyTranslations, "BUILDING"),
    floor: getTranslation(item.raw.hierarchyTranslations, "FLOOR"),
    zone: getTranslation(item.raw.hierarchyTranslations, "ZONE"),
    room: getTranslation(item.raw.hierarchyTranslations, "ROOM"),
    partition: getTranslation(item.raw.hierarchyTranslations, "PARTITION"),
    shelf: getTranslation(item.raw.hierarchyTranslations, "SHELF"),
    slot: getTranslation(item.raw.hierarchyTranslations, "SLOT"),
  }));
});

// Fetch supplies with debounce
const fetchSupplies = async () => {
  loading.value = true;
  try {
    const params = {
      page: tableOptions.value.page - 1, // Backend uses 0-based pagination
      itemsPerPage: tableOptions.value.itemsPerPage,
      sortBy: tableOptions.value.sortBy[0]?.key || "supply_number",
      sortDesc: tableOptions.value.sortBy[0]?.order === "desc",
    };

    console.log("Fetch Supply Parameters:", params);
    //const response = await api.get('/api/supply/all', { params });
    const response = await api.get("/api/supply/all/access", { params });
    console.log("Supply Response:", response.data);
    console.log("Raw API Supply response array [0]:", response.data.content[0]);
    showSuccess(t("fetch_supply_successfully"));
    // Map data to table format
    items.value = response.data.content.map((item, index) => ({
      index:
        (tableOptions.value.page - 1) * tableOptions.value.itemsPerPage +
        index +
        1,
      id: item.id,
      rfidTag: item.rfidTagId || "-",
      supplyNumber: item.supplyNumber,
      supplyName: item.supplyName,
      supplyModel: item.supplyModel,
      supplyType: item.supplyType,
      quantity: item.quantity,
      unit: item.unitOfMeasure,
      // Get translations using the helper function
      organization: getTranslation(item.hierarchyTranslations, "ORGANIZATION"),
      armory: getTranslation(item.hierarchyTranslations, "ARMORY"),
      building: getTranslation(item.hierarchyTranslations, "BUILDING"),
      floor: getTranslation(item.hierarchyTranslations, "FLOOR"),
      zone: getTranslation(item.hierarchyTranslations, "ZONE"),
      room: getTranslation(item.hierarchyTranslations, "ROOM"),
      partition: getTranslation(item.hierarchyTranslations, "PARTITION"),
      shelf: getTranslation(item.hierarchyTranslations, "SHELF"),
      slot: getTranslation(item.hierarchyTranslations, "SLOT"),
      receivedDate: item.receivedDate ? formatDate(item.receivedDate) : "-",
      trackingStatus: formatStatus(item.trackingStatus),
      //requisitionStatus: formatStatus(item.requisitionStatus),
      requisitionStatus: item.requisitionStatus,
      raw: item, // Keep raw data for expanded view
    }));

    totalRecords.value = response.data.totalElements;
  } catch (error) {
    console.error("Error fetching supplies:", error);
    showError(t("error_loading_supplies"));
  } finally {
    loading.value = false;
  }
};
// Helper functions
const getTranslation = (translations, type) => {
  if (!translations || !translations[type]) return "-";
  return locale.value === "th"
    ? translations[type].th || translations[type].en || "-"
    : translations[type].en || translations[type].th || "-";
};
const formatDate = (dateString) => {
  if (!dateString) return "-"; // Return dash for null/empty values

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-"; // Return dash for invalid dates

    return date.toLocaleString(locale.value, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "-";
  }
};
const formatStatus = (status) => {
  if (!status) return "-";
  return status.toLowerCase().replace(/_/g, " ");
};
const filteredTableItems = computed(() => {
  return tableItems.value.filter(
    (item) => showGateways.value || item.supplyType !== "Gateway"
  );
});
const filteredTotalRecords = computed(() => {
  if (showGateways.value) {
    return totalRecords.value;
  } else {
    const nonGatewayCount = tableItems.value.filter(
      (item) => item.supplyType !== "Gateway"
    ).length;
    const nonGatewayRatio =
      tableItems.value.length > 0
        ? nonGatewayCount / tableItems.value.length
        : 1;
    return Math.round(totalRecords.value * nonGatewayRatio);
  }
});

// Handle table options update
const handleUpdateOptions = (newOptions) => {
  console.log("Table options updated:", newOptions);
  tableOptions.value = {
    page: newOptions.page,
    itemsPerPage: newOptions.itemsPerPage,
    sortBy: newOptions.sortBy,
    sortDesc: newOptions.sortDesc,
  };
  // Call the appropriate fetch method based on search state
  if (isSearchActive.value) {
    fetchFilteredSupplies();
  } else {
    fetchSupplies();
  }
};
// need button
const clearSearch = () => {
  // Reset all search fields
  searchData.value = {
    searchText: "",
    startDate: null,
    endDate: null,
    readerStatus: null,
    supplyType: null, // Add this line for Supply Type Search
    organizationId: null, // Level 1
    armoryId: null, // Level 2
    buildingId: null, // Level 3
    floorId: null, // Level 4
    zoneId: null, // Level 5
    roomId: null, // Level 6
    partitionId: null, // Level 7
    shelfId: null, // Level 8
    slotId: null, // Level 9
  };

  // Turn off search mode
  isSearchActive.value = false;

  // Reset to first page
  tableOptions.value.page = 1;

  // Fetch all supplies (no filters)
  fetchSupplies();
};

// Handle row click for expansion
const handleRowClick = (event, { item }) => {
  console.log("Row clicked:", item);
};

const searchData = ref({
  searchText: "",
  startDate: null,
  endDate: null,
  readerStatus: null,
  supplyType: null, // Add this line for Supply Type Search
  organizationId: null, // Level 1
  armoryId: null, // Level 2
  buildingId: null, // Level 3
  floorId: null, // Level 4
  zoneId: null, // Level 5
  roomId: null, // Level 6
  partitionId: null, // Level 7
  shelfId: null, // Level 8
  slotId: null, // Level 9
});
// Fetch 9 levels and populate to template for user to select filter
// UUIDs are required to be pass for get Supply
const organizationHierarchy = ref([]);
const fetchOrganizationHierarchy = async () => {
  try {
    const response = await api.get("/api/organization-hierarchies/9levels");
    // Log response data only
    console.log("Fetch full organization:", response.data);
    showSuccess(t("fetch_organization_successfully"));
    organizationHierarchy.value = response.data;
  } catch (error) {
    showError(t("error_loading_organizations"));
  }
};
const findChildren = (parentId, expectedLevel) => {
  if (!parentId) return [];
  const searchChildren = (nodes) => {
    for (const node of nodes) {
      if (node.id === parentId) {
        if (node.children?.length) {
          const groupedByType = node.children.reduce((acc, child) => {
            if (!acc[child.levelType]) acc[child.levelType] = [];
            acc[child.levelType].push(child);
            return acc;
          }, {});

          return groupedByType[expectedLevel] || [];
        }
      } else if (node.children?.length) {
        const result = searchChildren(node.children);
        if (result.length > 0) return result;
      }
    }
    return [];
  };
  return searchChildren(organizationHierarchy.value);
};

const organizationsSearchOptions = computed(() => {
  return organizationHierarchy.value
    .filter((org) => org.levelType === "ORGANIZATION")
    .map((org) => ({
      value: org.id,
      title: locale.value === "th" ? org.translations.th : org.translations.en,
    }));
});
const armoriesSearchOptions = computed(() => {
  if (!searchData.value.organizationId) return [];
  return findChildren(searchData.value.organizationId, "ARMORY").map(
    (armory) => ({
      value: armory.id,
      title:
        locale.value === "th" ? armory.translations.th : armory.translations.en,
    })
  );
});
const buildingsSearchOptions = computed(() => {
  const parentId = searchData.value.armoryId || searchData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "BUILDING").map((building) => ({
    value: building.id,
    title:
      locale.value === "th"
        ? building.translations.th
        : building.translations.en,
  }));
});
const floorsSearchOptions = computed(() => {
  const parentId =
    searchData.value.buildingId ||
    searchData.value.armoryId ||
    searchData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "FLOOR").map((floor) => ({
    value: floor.id,
    title:
      locale.value === "th" ? floor.translations.th : floor.translations.en,
  }));
});
const zonesSearchOptions = computed(() => {
  const parentId =
    searchData.value.floorId ||
    searchData.value.buildingId ||
    searchData.value.armoryId ||
    searchData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "ZONE").map((zone) => ({
    value: zone.id,
    title: locale.value === "th" ? zone.translations.th : zone.translations.en,
  }));
});
const roomsSearchOptions = computed(() => {
  const parentId =
    searchData.value.zoneId ||
    searchData.value.floorId ||
    searchData.value.buildingId ||
    searchData.value.armoryId ||
    searchData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "ROOM").map((room) => ({
    value: room.id,
    title: locale.value === "th" ? room.translations.th : room.translations.en,
  }));
});
const partitionsSearchOptions = computed(() => {
  const parentId =
    searchData.value.roomId ||
    searchData.value.zoneId ||
    searchData.value.floorId ||
    searchData.value.buildingId ||
    searchData.value.armoryId ||
    searchData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "PARTITION").map((room) => ({
    value: room.id,
    title: locale.value === "th" ? room.translations.th : room.translations.en,
  }));
});
const shelveSearchOptions = computed(() => {
  const parentId =
    searchData.value.partitionId ||
    searchData.value.roomId ||
    searchData.value.zoneId ||
    searchData.value.floorId ||
    searchData.value.buildingId ||
    searchData.value.armoryId ||
    searchData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "SHELF").map((shelf) => ({
    value: shelf.id,
    title:
      locale.value === "th" ? shelf.translations.th : shelf.translations.en,
  }));
});
const slotsSearchOptions = computed(() => {
  const parentId =
    searchData.value.shelfId ||
    searchData.value.partitionId ||
    searchData.value.roomId ||
    searchData.value.zoneId ||
    searchData.value.floorId ||
    searchData.value.buildingId ||
    searchData.value.armoryId ||
    searchData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "SLOT").map((slot) => ({
    value: slot.id,
    title: locale.value === "th" ? slot.translations.th : slot.translations.en,
  }));
});

const handleOrganizationChange = async (newValue, source) => {
  console.log(`Organization changed in: ${source}, New Value: ${newValue}`);
  if (source === "search") {
    console.log(`Searching for ${newValue}`);
    searchData.value.armoryId = null;
    searchData.value.buildingId = null;
    searchData.value.floorId = null;
    searchData.value.zoneId = null;
    searchData.value.roomId = null;
    searchData.value.partitionId = null;
    searchData.value.shelfId = null;
    searchData.value.slot = null;
  }
};
const handleArmoryChange = async (newValue, source) => {
  if (source === "search") {
    console.log(`Searching for ${newValue}`);
    searchData.value.buildingId = null;
    searchData.value.floorId = null;
    searchData.value.zoneId = null;
    searchData.value.roomId = null;
    searchData.value.zoneId = null;
    searchData.value.roomId = null;
    searchData.value.partitionId = null;
    searchData.value.shelfId = null;
    searchData.value.slot = null;
  }
};
const handleBuildingChange = async (newValue, source) => {
  if (source === "search") {
    console.log(`Searching for ${newValue}`);
    searchData.value.floorId = null;
    searchData.value.zoneId = null;
    searchData.value.roomId = null;
    searchData.value.zoneId = null;
    searchData.value.roomId = null;
    searchData.value.partitionId = null;
    searchData.value.shelfId = null;
    searchData.value.slot = null;
  }
};
const handleFloorChange = async (newValue, source) => {
  if (source === "search") {
    console.log(`Searching for ${newValue}`);
    searchData.value.zoneId = null;
    searchData.value.roomId = null;
    searchData.value.zoneId = null;
    searchData.value.roomId = null;
    searchData.value.partitionId = null;
    searchData.value.shelfId = null;
    searchData.value.slot = null;
  }
};
const handleZoneChange = (newValue, source) => {
  if (source === "search") {
    console.log(`Searching for ${newValue}`);
    searchData.value.roomId = null;
    searchData.value.partitionId = null;
    searchData.value.shelfId = null;
    searchData.value.slot = null;
  }
};
const handleRoomChange = (newValue, source) => {
  if (source === "search") {
    console.log(`Searching for ${newValue}`);
    searchData.value.partitionId = null;
    searchData.value.shelfId = null;
    searchData.value.slot = null;
  }
};
const handlePartitionChange = (newValue, source) => {
  if (source === "search") {
    console.log(`Searching for ${newValue}`);
    searchData.value.shelfId = null;
    searchData.value.slot = null;
  }
};
const handleShelfChange = (newValue, source) => {
  if (source === "search") {
    console.log(`Searching for ${newValue}`);
    searchData.value.slot = null;
  }
};
const handleSlotChange = (newValue, source) => {
  if (source === "search") {
    console.log(`Searching for ${newValue}`);
  }
};
const handleSearch = () => {
  console.log(
    `Searching for Organization UUID:`,
    searchData.value.organizationId
  );
  console.log(`Searching for Armory UUID:`, searchData.value.armoryId);
  console.log(`Searching for Building UUID:`, searchData.value.buildingId);
  console.log(`Searching for Floor UUID:`, searchData.value.floorId);
  console.log(`Searching for Zone UUID:`, searchData.value.zoneId);
  console.log(`Searching for Room UUID:`, searchData.value.roomId);
  console.log(`Searching for Partition UUID:`, searchData.value.partitionId);
  console.log(`Searching for Slot UUID:`, searchData.value.slotId);
  console.log(`Searching for Text:`, searchData.value.searchText);
  console.log(`Searching for Start Date:`, searchData.value.startDate);
  console.log(`Searching for End Date:`, searchData.value.endDate);
  tableOptions.value.page = 1; // Reset to the first page for new search
  fetchFilteredSupplies();
};

const fetchFilteredSupplies = async () => {
  loading.value = true;
  isSearchActive.value = true; // Set flag when search is performed
  try {
    const params = {
      page: tableOptions.value.page - 1, // Backend expects 0-based pagination
      itemsPerPage: tableOptions.value.itemsPerPage,
      sortBy: tableOptions.value.sortBy[0]?.key || "",
      sortDesc: tableOptions.value.sortBy[0]?.order === "desc",
      searchText: searchData.value.searchText || "",
      supplyType: searchData.value.supplyType || null, // Add this line
      organizationId: searchData.value.organizationId || null,
      armoryId: searchData.value.armoryId || null,
      buildingId: searchData.value.buildingId || null,
      floorId: searchData.value.floorId || null,
      zoneId: searchData.value.zoneId || null,
      roomId: searchData.value.roomId || null,
      partitionId: searchData.value.partitionId || null,
      shelfId: searchData.value.shelfId || null,
      slotId: searchData.value.slotId || null,
      startDate: searchData.value.startDate || null,
      endDate: searchData.value.endDate || null,
    };

    console.log("Fetching filtered supplies with params:", params);

    //const response = await api.get('/api/supply/search', { params });
    const response = await api.get("/api/supply/search/supply_type", {
      params,
    });
    console.log("Filtered Supply Response:", response.data);

    items.value = response.data.content.map((item, index) => ({
      index:
        (tableOptions.value.page - 1) * tableOptions.value.itemsPerPage +
        index +
        1,
      id: item.id,
      rfidTag: item.rfidTagId || "-",
      supplyNumber: item.supplyNumber,
      supplyName: item.supplyName,
      supplyModel: item.supplyModel,
      supplyType: item.supplyType,
      quantity: item.quantity,
      unit: item.unitOfMeasure,
      organization: getTranslation(item.hierarchyTranslations, "ORGANIZATION"),
      armory: getTranslation(item.hierarchyTranslations, "ARMORY"),
      building: getTranslation(item.hierarchyTranslations, "BUILDING"),
      floor: getTranslation(item.hierarchyTranslations, "FLOOR"),
      zone: getTranslation(item.hierarchyTranslations, "ZONE"),
      room: getTranslation(item.hierarchyTranslations, "ROOM"),
      partition: getTranslation(item.hierarchyTranslations, "PARTITION"),
      shelf: getTranslation(item.hierarchyTranslations, "SHELF"),
      slot: getTranslation(item.hierarchyTranslations, "SLOT"),
      receivedDate: item.receivedDate ? formatDate(item.receivedDate) : "-",
      trackingStatus: formatStatus(item.trackingStatus),
      //requisitionStatus: formatStatus(item.requisitionStatus),
      requisitionStatus: item.requisitionStatus,
      raw: item,
    }));

    totalRecords.value = response.data.totalElements;
    showSuccess(t("fetch_organization_successfully"));
  } catch (error) {
    console.error("Error fetching filtered supplies:", error);
    showError(t("error_loading_supplies"));
  } finally {
    loading.value = false;
  }
};

// EXPORT

// Get visible table data : Export data based on headers user selected
const getVisibleData = () => {
  const visibleKeys = visibleColumns.value;
  return items.value.map((item) => {
    const visibleData = {};
    visibleKeys.forEach((key) => {
      if (key !== "actions") {
        visibleData[key] = item[key];
      }
    });
    return visibleData;
  });
};

const extensionMap = {
  csv: "csv",
  pdf: "pdf",
  html: "html",
  json: "json",
  excel: "xlsx",
};

const createReportFile = async (format) => {
  const visibleData = getVisibleData();
  console.log("Data to export:", visibleData);

  // Check if there's data to export
  if (!visibleData || visibleData.length === 0) {
    showWarning(t("no_data_to_export"));
    return;
  }

  const normalizedFormat = format.toLowerCase();
  const extension = extensionMap[normalizedFormat] || "dat";
  console.log("Extension: ", extension);
  try {
    const response = await api.post(
      `/api/supply/report/${extension}`,
      visibleData,
      {
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `supply_report.${extension}`);
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error("Error fetching report:", error);
  }
};

const createDataFile = async (format) => {
  const visibleData = getVisibleData();
  console.log("Data to export:", visibleData);

  // Check if there's data to export
  if (!visibleData || visibleData.length === 0) {
    showWarning(t("no_data_to_export"));
    return;
  }
  const normalizedFormat = format.toLowerCase();
  const extension = extensionMap[normalizedFormat] || "dat";

  try {
    const response = await api.post(
      `/api/supply/data/${extension}`,
      visibleData,
      {
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `supply_data.${extension}`);
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const exportReport = async (format) => {
  console.log("Export Supply Report :", format);
  // Create Report based on format (HTML, CSV and PDF) item which is table's data from Backend
  // Get with item's data to backend to generate file.
  await createReportFile(format);
  showSuccess(t("export_successful"));
};

const exportData = async (format) => {
  console.log("Export Supply Data :", format);
  // Export item which is table's data from Backend
  // will csv file need to be created from backend?
  await createDataFile(format);
  showSuccess(t("export_successful"));
};

// Current Location from latest Reader's detection, realtime
const selectedOrganizationId = ref(null); // Initialize with null
const lowestOrganizationId = ref(null); // For the lowest-level organization

// Transfer
const showRelocateDialog = ref(false);
const selectedSupplyForRelocation = ref(null);
const handleTransfer = (item) => {
  console.log("Transfer :", item);
  selectedSupplyForRelocation.value = item.raw;
  showRelocateDialog.value = true;
};
const handleRelocated = async () => {
  showRelocateDialog.value = false;
  await fetchSupplies(); // Refresh Table
};

const handleGotoLocation = async (item) => {
  console.log("Goto Location:", item);

  if (!item.raw) {
    console.warn("Missing raw data structure in item.");
    return;
  }

  // Temporarily hide dialog while loading reader data
  showMapViewerDialog.value = false;

  try {
    // Fetch the latest reader that detected this supply using the existing DTO
    const response = await api.get(
      `/api/rfid_readers/latest-detection/${item.raw.rfidTagId}`
    );
    console.log("Latest reader detection:", response.data);

    // Set up props for the map viewer
    await nextTick(() => {
      propsSupplyId.value = item.raw.id;
      propsSupplyNumber.value = item.raw.supplyNumber;
      propsRfidNumber.value = item.raw.rfidTagId;

      // Set reader serial number if available
      if (response.data && response.data.readerSerialNumber) {
        propsReaderSerialNumber.value = response.data.readerSerialNumber;
        propsReaderData.value = response.data;
        console.log("Sending to MapViewer:", {
          supplyId: propsSupplyId.value,
          supplyNumber: propsSupplyNumber.value,
          rfidNumber: propsRfidNumber.value,
          readerSerialNumber: propsReaderSerialNumber.value,
          readerData: propsReaderData.value,
        });
      } else {
        propsReaderSerialNumber.value = "";
        propsReaderData.value = null;
        showWarning(t("no_recent_reader_detection"));
      }

      // Show the map viewer with the reader information
      showMapViewerDialog.value = true;
    });
  } catch (error) {
    console.error("Error fetching latest reader information:", error);
    showError(t("error_fetching_reader_information"));

    // Show map viewer without reader information as fallback
    await nextTick(() => {
      propsSupplyId.value = item.raw.id;
      propsSupplyNumber.value = item.raw.supplyNumber;
      propsRfidNumber.value = item.raw.rfidTagId;
      propsReaderSerialNumber.value = "";
      propsReaderData.value = null;
      showMapViewerDialog.value = true;
    });
  }
};

const findRootOrganization = (organizationName) => {
  for (const org of organizationHierarchy.value) {
    if (
      org.levelType === "ORGANIZATION" &&
      (org.translations.en === organizationName ||
        org.translations.th === organizationName)
    ) {
      return org;
    }
  }
  console.warn("Root organization not found for:", organizationName);
  return null; // Return null if not found
};

// Helper function to find the lowest level ID in the hierarchy

// Support both supply items, organizations including lowercase and uppercase
const findLowestLevelId = (item) => {
  console.log("Find Lowest Level ID:", item);

  let isAllOrganizationsNull = true;

  // Check if the input is from the list view (has translations)
  if (item.slot !== undefined || item.organization !== undefined) {
    const levelChecks = [
      { type: "SLOT", translation: item.slot },
      { type: "SHELF", translation: item.shelf },
      { type: "PARTITION", translation: item.partition },
      { type: "ROOM", translation: item.room },
      { type: "ZONE", translation: item.zone },
      { type: "FLOOR", translation: item.floor },
      { type: "BUILDING", translation: item.building },
      { type: "ARMORY", translation: item.armory },
      { type: "ORGANIZATION", translation: item.organization },
    ];

    for (const check of levelChecks) {
      if (check.translation && check.translation !== "-") {
        console.log(
          `Trying to find ${check.type} for translation: "${check.translation}"`
        );
        isAllOrganizationsNull = false;
        const foundId = findIdByTranslationAndType(
          check.translation,
          check.type
        );
        if (foundId) {
          console.log(`Lowest Level Found for ${check.type}: ${foundId}`);
          return foundId;
        }
      }
    }
  }
  // Check if the input is from the form (has IDs)
  else if (item.slotId !== undefined || item.organizationId !== undefined) {
    const levelOrder = [
      "slotId",
      "shelfId",
      "partitionId",
      "roomId",
      "zoneId",
      "floorId",
      "buildingId",
      "armoryId",
      "organizationId",
    ];

    for (const key of levelOrder) {
      if (item[key]) {
        console.log(`Found direct ID for ${key}: ${item[key]}`);
        return item[key];
      }
    }
  }

  // If no valid organization-level ID was found
  if (isAllOrganizationsNull) {
    console.warn(
      "No organization-related fields were provided. All organizations are null."
    );
  } else {
    console.warn(
      "No valid organization ID found despite some levels being present."
    );
  }
  return null;
};

const findIdByTranslationAndType = (translationName, type) => {
  console.log(`Searching for ${type} with translation: "${translationName}"`);

  if (
    !organizationHierarchy.value ||
    organizationHierarchy.value.length === 0
  ) {
    console.warn("Organization hierarchy is not available or empty.");
    return null;
  }

  const traverseHierarchy = (nodes) => {
    for (const node of nodes) {
      console.log(
        `Checking node: ${node.translations[locale.value]} (type: ${
          node.levelType
        })`
      );
      if (
        node.levelType === type &&
        node.translations[locale.value] === translationName
      ) {
        console.log(
          `Match found for ${type}: ${translationName}, ID: ${node.id}`
        );
        return node.id;
      }
      if (node.children) {
        const found = traverseHierarchy(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const result = traverseHierarchy(organizationHierarchy.value);
  if (!result) {
    console.warn(
      `No match found for ${type} with translation: "${translationName}"`
    );
  }
  return result;
};

// Delete Supply

const handleDeleteSupply = (item) => {
  dialogs.value.deleteItem = item;
  dialogs.value.confirmDelete = true;
};

const confirmDeleteSupply = async () => {
  try {
    console.log(
      "Confirming Delete Supply:",
      dialogs.value.deleteItem.supplyNumber
    );
    console.log("Confirming Delete Supply ID:", dialogs.value.deleteItem.id);
    // Add your API call here
    await api.delete(`/api/supply/${dialogs.value.deleteItem.id}`);

    // Show success message
    showSuccess(t("supply_deleted_successfully"));

    // Refresh the table
    await fetchSupplies();
  } catch (error) {
    console.error("Error deleting supply:", error);
    showError(t("error_deleting_supply"));
  } finally {
    // Close dialog
    dialogs.value.confirmDelete = false;
    dialogs.value.deleteItem = null;
  }
};

// Import for test, may be removed and use REST API

const showImportDialog = () => {
  selectedFile.value = null;
  selectedFileName.value = "";
  dialogs.value.import = true;
};
// Import Dialog
const selectedFile = ref(null);
const selectedFileName = ref("");
const fileInput = ref(null);
const downloadTemplate = () => {
  const templateUrl = "/templates/excel/template_supply_form.xlsx";
  window.open(templateUrl, "_blank");
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
const importFile = async () => {
  if (!selectedFile.value) return;
  if (!isFileValid(selectedFile.value)) {
    return;
  }

  try {
    const importFormData = new FormData(); // More explicit naming
    importFormData.append("file", selectedFile.value);
    importFormData.append("username", username);
    const response = await api.post("/api/supply/import-file", importFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);
    dialogs.value.import = false;
    selectedFile.value = null;
    selectedFileName.value = "";
    showSuccess(response.data);
  } catch (error) {
    showError(t("failed_to_save_file"));
  } finally {
    dialogs.value.import = false;
    selectedFile.value = null;
    selectedFileName.value = "";
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
  // Check file extension as well
  const validExtensions = [".xlsx", ".xls"];
  const fileExtension = file.name
    .toLowerCase()
    .slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2);
  if (
    !validTypes.includes(file.type) &&
    !validExtensions.includes(`.${fileExtension}`)
  ) {
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

// Supply Details
const selectedSupply = ref(null);
// Show supply details data

const handleSeeDetailsSupply = async (item) => {
  console.log("Raw supply data:", item.raw);
  // Find the root organization UUID for this item
  const rootOrganization = findRootOrganization(item.organization);
  if (!rootOrganization) {
    console.error("Root organization not found for:", item.organization);
    showError(t("error_finding_root_organization"));
    return;
  }

  console.log("Root Organization UUID:", rootOrganization.id);
  const lowestOrganization = findLowestLevelId(item);
  if (lowestOrganization) {
    console.log("Lowest Organization UUID:", lowestOrganization);
  } else {
    console.warn("No lowest level ID found.");
  }

  // Open the dialog and pass the root organization UUID
  selectedOrganizationId.value = rootOrganization.id;
  lowestOrganizationId.value = lowestOrganization;

  // Set the selected supply and open the dialog
  selectedSupply.value = item.raw;
  dialogs.value.details = true;
};

// Add / Edit Dialog ----------------------------------------------------

// Function to check if at least one organization level is selected
const isOrganizationSelected = () => {
  return !!formData.value.organizationId; // Just check the top-level organization
};

const fetchSupplyImage = async (supplyId) => {
  try {
    const response = await api.get(`/api/supply/image/${supplyId}`);

    console.log("Fetch Supply Image from supplyId: ", supplyId);
    if (response.status === 200) {
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

// Function to fetch supply coordinates
const fetchSupplyCoordinates = async (supplyId) => {
  if (!supplyId) {
    console.warn("Cannot fetch coordinates: No supply ID provided");
    return;
  }

  try {
    console.log("Fetching coordinates for supply:", supplyId);
    const response = await api.get(`/api/supply-coordinates/${supplyId}`);

    if (response.status === 200 && response.data) {
      console.log("Supply coordinates retrieved:", response.data);

      // Store the coordinates in your component state
      supplyCoordinates.value = {
        x: response.data.x,
        y: response.data.y,
      };

      // If you have a map component, update it with the coordinates
      updateMapWithCoordinates(response.data.x, response.data.y);
    } else if (response.status === 204) {
      console.log("No coordinates found for this supply");
      supplyCoordinates.value = null;
    }
  } catch (error) {
    console.error("Error fetching supply coordinates:", error);
    supplyCoordinates.value = null;
  }
};
// Function to update the map with coordinates
const updateMapWithCoordinates = (x, y) => {
  console.log("Updating map marker coordinates:", x, y);

  // Update the mapCoordinates ref directly
  mapCoordinates.value = { x, y };

  // Log to confirm the update
  console.log("mapCoordinates updated:", mapCoordinates.value);
};

// Edit Supply data

// Supply data not reactive in template due to Vuetify characteristic
// We need to trigger the form to recognize supply data
const handleEditSupply = (item) => {
  console.log("Edit Supply:", item.supplyNumber);
  console.log("Original item data:", item);

  dialogs.value.mode = "edit";

  // Format with timezone consideration and space instead of 'T'
  const formatDateWithTimezone = (dateString) => {
    if (!dateString || dateString === "") return null;

    const date = new Date(dateString);
    return date.toLocaleString("sv", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    }); // No need to replace space with 'T' anymore
  };

  const formattedReceivedDate = formatDateWithTimezone(item.raw.receivedDate);
  const formattedTransferDate = formatDateWithTimezone(item.raw.transferDate);

  // Convert hierarchyTranslations from object to string before lookup
  const getTranslationText = (translationObject) => {
    if (!translationObject || typeof translationObject !== "object")
      return null;
    return translationObject[locale.value] || translationObject["en"]; // Default to English if locale missing
  };

  // Load all data into formData
  formData.value = {
    // Supply data
    id: item.raw.id,
    supplyNumber: item.raw.supplyNumber,
    supplyName: item.raw.supplyName,
    rfidTagId: item.raw.rfidTagId,
    supplyType: item.raw.supplyType,
    supplyModel: item.raw.supplyModel,
    quantity: item.raw.quantity,
    unitOfMeasure: item.raw.unitOfMeasure,
    receivedDate: formattedReceivedDate,
    receivedBy: item.raw.receivedBy,
    transferDate: formattedTransferDate,
    transferBy: item.raw.transferBy,
    trackingStatus: item.raw.trackingStatus,
    requisitionStatus: item.raw.requisitionStatus,

    // Organization hierarchy from raw data
    // Convert translation object to string before lookup
    organizationId: item.raw.hierarchyTranslations?.ORGANIZATION
      ? findIdByTranslationAndType(
          getTranslationText(item.raw.hierarchyTranslations.ORGANIZATION),
          "ORGANIZATION"
        )
      : null,
    armoryId: item.raw.hierarchyTranslations?.ARMORY
      ? findIdByTranslationAndType(
          getTranslationText(item.raw.hierarchyTranslations.ARMORY),
          "ARMORY"
        )
      : null,
    buildingId: item.raw.hierarchyTranslations?.BUILDING
      ? findIdByTranslationAndType(
          getTranslationText(item.raw.hierarchyTranslations.BUILDING),
          "BUILDING"
        )
      : null,
    floorId: item.raw.hierarchyTranslations?.FLOOR
      ? findIdByTranslationAndType(
          getTranslationText(item.raw.hierarchyTranslations.FLOOR),
          "FLOOR"
        )
      : null,
    zoneId: item.raw.hierarchyTranslations?.ZONE
      ? findIdByTranslationAndType(
          getTranslationText(item.raw.hierarchyTranslations.ZONE),
          "ZONE"
        )
      : null,
    roomId: item.raw.hierarchyTranslations?.ROOM
      ? findIdByTranslationAndType(
          getTranslationText(item.raw.hierarchyTranslations.ROOM),
          "ROOM"
        )
      : null,
    partitionId: item.raw.hierarchyTranslations?.PARTITION
      ? findIdByTranslationAndType(
          getTranslationText(item.raw.hierarchyTranslations.PARTITION),
          "PARTITION"
        )
      : null,
    shelfId: item.raw.hierarchyTranslations?.SHELF
      ? findIdByTranslationAndType(
          getTranslationText(item.raw.hierarchyTranslations.SHELF),
          "SHELF"
        )
      : null,
    slotId: item.raw.hierarchyTranslations?.SLOT
      ? findIdByTranslationAndType(
          getTranslationText(item.raw.hierarchyTranslations.SLOT),
          "SLOT"
        )
      : null,
  };

  // First show the dialog
  dialogs.value.add = true;

  // Fetch supply image if available
  fetchSupplyImage(item.raw.id);

  // Use setTimeout to ensure dialog is fully rendered
  setTimeout(() => {
    // Simulate a change to make Vue treat all properties as reactive
    // by making a small modification to each supply field
    const keys = Object.keys(formData.value);
    keys.forEach((key) => {
      // Only simulate changes for supply data fields, not hierarchy
      if (
        [
          "supplyNumber",
          "supplyName",
          "rfidTagId",
          "supplyType",
          "supplyModel",
          "quantity",
          "unitOfMeasure",
          "receivedDate",
          "receivedBy",
          "transferDate",
          "transferBy",
          "trackingStatus",
          "requisitionStatus",
        ].includes(key)
      ) {
        const currentValue = formData.value[key];
        // Temporary change the value
        formData.value[key] = null;
        // Restore the original value immediately
        formData.value[key] = currentValue;
      }
    });

    console.log("Supply data reactivity enforced");

    // Now trigger the hierarchy change with the lowest level
    const lowestLevelId = findLowestLevelId(formData.value);

    console.log("LOWEST ID from handleEditDialog: ", lowestLevelId);
    if (lowestLevelId) {
      console.log(
        "Triggering hierarchy change for lowest level:",
        lowestLevelId
      );
      // Fetch the map based on the lowest level
      fetchImageByOrganizationId(lowestLevelId);

      // Fetch supply coordinates to mark on the Map
      fetchSupplyCoordinates(item.raw.id);
    } else if (formData.value.organizationId) {
      // Fallback to organization if no lower level found
      console.log(
        "No lower level found, using organization:",
        formData.value.organizationId
      );
      handleHierarchyChange({
        level: "ORGANIZATION",
        value: formData.value.organizationId,
        context: "dialog",
      });
      // Still try to fetch coordinates even with organization level
      fetchSupplyCoordinates(item.raw.id);
    }
  }, 100);

  // Fetch RFID tags for the selector table
  fetchReadyRfidTags();
};

// Add one Supply
const handleAddSupply = async () => {
  console.log("Add Supply:", dialogs.value.add);
  dialogs.value.mode = "add";
  // Format current date for datetime-local input
  const now = new Date();
  // Format: YYYY-MM-DDThh:mm (critical to use 'T' as separator)
  const formattedDate = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  console.log("Setting received date format:", formattedDate);

  // Reset form data to initial state
  formData.value = {
    supplyNumber: "",
    supplyName: "",
    rfidTagId: "",
    supplyType: null,
    quantity: 1,
    unitOfMeasure: "",
    receivedDate: "",
    receivedBy: "",
    trackingStatus: "",
    requisitionStatus: "AVAILABLE", // Set default to AVAILABLE
    image: null,
    // Organization hierarchy
    organizationId: null,
    armoryId: null,
    buildingId: null,
    floorId: null,
    zoneId: null,
    roomId: null,
    partitionId: null,
    shelfId: null,
    slotId: null,
    // Location
    latitude: null,
    longitude: null,
  };
  // popup dialog with dialogs.value.mode = 'add'
  dialogs.value.add = true;

  // Fetch RFID tags for the selector table
  await fetchReadyRfidTags();

  const dateInput = document.querySelector('input[type="datetime-local"]');
  if (dateInput) {
    dateInput.value = formattedDate;
    dateInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
};

const supplyTypesOptions = ref([]);
const unitOptions = ref([]);
const trackingStatusOptions = ref([]);
const requisitionStatusOptions = ref([]);

const form = ref(null);
const valid = ref(false);
const imagePreview = ref(null);

const formData = ref({
  // Supply identification
  id: null,
  supplyNumber: "",
  supplyName: "",
  supplyModel: "", // Added
  rfidTagId: "",

  // Supply details
  supplyType: null,
  quantity: 1,
  unitOfMeasure: "",

  // Dates and tracking
  receivedDate: "",
  receivedBy: "",
  transferDate: "",
  transferBy: "",
  trackingStatus: "",
  requisitionStatus: "",

  // Images and maps
  image: null,
  mapCoordinates: null, // Added

  // Organization hierarchy
  organizationId: null,
  armoryId: null,
  buildingId: null,
  floorId: null,
  zoneId: null,
  roomId: null,
  partitionId: null,
  shelfId: null,
  slotId: null,

  // Location
  latitude: null,
  longitude: null,
});

const initialFormData = () => ({
  // Supply identification
  id: null,
  supplyNumber: "",
  supplyName: "",
  supplyModel: "", // Added
  rfidTagId: "",

  // Supply details
  supplyType: null,
  quantity: 1,
  unitOfMeasure: "",

  // Dates and tracking
  receivedDate: "",
  receivedBy: "",
  transferDate: "",
  transferBy: "",
  trackingStatus: trackingStatusOptions.value[0] || "ACTIVE",
  requisitionStatus: requisitionStatusOptions.value[0] || "AVAILABLE",

  // Images and maps
  image: null,
  mapCoordinates: null, // Added

  // Hierarchy fields
  organizationId: null,
  armoryId: null,
  buildingId: null,
  floorId: null,
  zoneId: null,
  roomId: null,
  partitionId: null,
  shelfId: null,
  slotId: null,

  // Location coordinates
  latitude: null,
  longitude: null,
});

// Fetch options
const fetchSupplyTypesAndUnits = async () => {
  try {
    // Fetch only supply type names (without uuid)
    //const typesResponse = await api.get('/api/supply-type/type_name');
    const typesResponse = await api.get(
      "/api/supply-type/type_name/no_gateway"
    );
    console.log("Supply Type Names:", typesResponse.data);

    supplyTypesOptions.value = typesResponse.data
      .filter((typeName) => typeName !== "Gateway")
      .map((typeName) => ({
        value: typeName,
        title: typeName,
      }));

    console.log(
      "Supply Type Options Names after Gateway filtered:",
      supplyTypesOptions.value
    );

    // Fetch units
    const unitsResponse = await api.get("/api/supply/unit-of-measurement");
    console.log("Unit of Measurement:", unitsResponse.data);
    unitOptions.value = unitsResponse.data.map((unit) => ({
      value: unit,
      title: unit,
    }));

    console.log("Unit of Measurement Options:", unitOptions.value);

    // Fetch and map status options using i18n translations
    const trackingResponse = await api.get("/api/supply/tracking-status");
    console.log("Tracking Status:", trackingResponse.data);
    trackingStatusOptions.value = trackingResponse.data.map((status) => ({
      value: status,
      title: t(`tracking_statuses.${status}`),
    }));

    const requisitionResponse = await api.get("/api/supply/requisition-status");
    console.log("Requisition Status:", requisitionResponse.data);
    requisitionStatusOptions.value = requisitionResponse.data.map((status) => ({
      value: status,
      title: t(`requisition_statuses.${status}`),
    }));
  } catch (error) {
    console.error("Error fetching options:", error);
    showError(t("error_loading_options"));
  }
};

// Also update closeDialog function to ensure cleanup
const isClosing = ref(false);
const closeDialog = () => {
  console.log("closeDialog");
  isClosing.value = true;
  console.log("Close Dialog set Closing Flag: ", isClosing.value);

  dialogs.value.add = false;

  if (selectedMapPicture?.value && selectedMapPicture.value.imagePath) {
    URL.revokeObjectURL(selectedMapPicture.value.imagePath);
  }
  if (mapPreview?.value) {
    URL.revokeObjectURL(mapPreview.value);
  }
  // Clear map states
  selectedMapPicture.value = null;
  mapPreview.value = null;
  mapCoordinates.value = null;

  // Clear image preview
  imagePreview.value = null;
  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  // Reset form data related to image
  formData.value.image = null;

  formData.value = initialFormData();
  valid.value = false;
  fetchSupplies();
  fetchOrganizationHierarchy();
  // Use nextTick with callback
  nextTick(() => {
    isClosing.value = false;
    console.log("Close Dialog release Closing Flag: ", isClosing.value);
  });

  // Reset RFID tag table state
  readyRfidTags.value = [];
  rfidSearchQuery.value = "";
  tagPage.value = 1;
};

const handleHierarchyChange = ({ level, value, context }) => {
  console.log("Hierarchy changed in main form:", { level, value, context });
  console.log("Current formData:", formData.value);

  if (context === "dialog") {
    if (level === "ORGANIZATION" && !value) {
      console.log("Organization cleared, removing map");
      mapPreview.value = null;
      selectedMapPicture.value = null;
      mapCoordinates.value = null;
      formData.value.latitude = null;
      formData.value.longitude = null;

      return; // Exit early
    }

    // Instead of updateCoordinates, implement coordinate handling here
    if (value) {
      const node = findNodeById(value);
      if (node) {
        formData.value.latitude = node.latitude;
        formData.value.longitude = node.longitude;
      }
    }

    if (level === "ORGANIZATION" && value) {
      fetchImageByOrganizationId(value);
    }

    console.log("After Fetch Image Value: ", value);
  }
};

// Get Picture by organization id:
const fetchImageByOrganizationId = async (organizationId) => {
  console.log("Fetching image by organizationId:", organizationId);
  try {
    const response = await api.get(
      `/api/organization-maps/org/${organizationId}`,
      {
        responseType: "blob",
      }
    );
    // Convert the binary response to a Blob URL
    const imageUrl = URL.createObjectURL(response.data);
    // Update the map preview with the new image
    mapPreview.value = imageUrl;
    selectedMapPicture.value = {
      imagePath: imageUrl,
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      showWarning(t("no_map_assigned"));
      mapPreview.value = null;
      selectedMapPicture.value = null;
    } else {
      console.error("Error fetching map data:", error);
      showError(t("error_loading_map"));
      mapPreview.value = null;
      selectedMapPicture.value = null;
    }
  }
};

// Helper function to find node by ID
const findNodeById = (id) => {
  const searchNode = (nodes) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children?.length) {
        const found = searchNode(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  return searchNode(organizationHierarchy.value);
};

const isScanning = ref(false);
const scanTimeout = ref(null);

const scanRFID = () => {
  // Show scanning dialog
  isScanning.value = true;

  // Clear any existing timeout
  if (scanTimeout.value) {
    clearTimeout(scanTimeout.value);
  }

  // Auto-close after 30 seconds if no scan is detected
  scanTimeout.value = setTimeout(() => {
    isScanning.value = false;
  }, 30000);
};

// Supply Picture Upload
const fileInputRef = ref(null);
const triggerImageUpload = () => {
  console.log("Image upload triggered");
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    console.error("Invalid file type");
    showError(t("invalid_file_type"));
    return;
  }

  // Validate file size (e.g., 5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    console.error("File too large");
    showError(t("file_too_large", { size: "5MB" }));
    return;
  }

  console.log(`Selected file: ${file.name}`);

  // Check image dimensions
  const img = new Image();
  img.onload = () => {
    // Smaller dimensions for supply images
    if (img.width < 400 || img.height < 300) {
      showError(t("image_too_small", { width: "400px", height: "300px" }));
      return;
    }
    if (img.width > 1200 || img.height > 900) {
      showError(t("image_too_large", { width: "1200px", height: "900px" }));
      return;
    }

    imagePreview.value = img.src;
  };

  img.onerror = () => {
    showError(t("error_loading_image"));
  };
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
    console.log("Image loaded successfully");
  };
  reader.onerror = (e) => {
    console.error("Error reading file:", e);
    // You might want to add a notification here
  };
  reader.readAsDataURL(file);
};
// Map Section of Add/Edit Dialog
const selectedMapPicture = ref(null); // Stores the selected map
const mapPreview = ref(""); // Preview of the uploaded or selected map
const mapCoordinates = ref(null); // Stores the marker coordinates (x, y)

// Default map dimensions (set when the image loads)
const mapWidth = ref(0);
const mapHeight = ref(0);

const adjustMapMarkerPosition = (event) => {
  // Check if event exists and has a target property
  if (event && event.target) {
    const img = event.target;
    mapWidth.value = img.naturalWidth || 0;
    mapHeight.value = img.naturalHeight || 0;
    console.log(
      `🗺️ Map loaded. Dimensions: ${mapWidth.value}x${mapHeight.value}`
    );
  } else {
    // If called without a valid event, try to get the image by other means
    console.log("Map event missing, using alternative method");
    // You might need to add alternative logic here if needed
    mapWidth.value = 0;
    mapHeight.value = 0;
  }
};
// Add a fallback method to ensure dimensions are set
const ensureMapDimensions = () => {
  if (mapWidth.value === 0 || mapHeight.value === 0) {
    // Try to get the image by selector
    const imgElement = document.querySelector(".map-preview-area img");
    if (imgElement && imgElement.complete) {
      mapWidth.value = imgElement.naturalWidth || 0;
      mapHeight.value = imgElement.naturalHeight || 0;
      console.log(
        `🗺️ Dimensions set by fallback: ${mapWidth.value}x${mapHeight.value}`
      );
    }
  }
};
const handleMapClick = (event) => {
  // Ensure dimensions are set
  ensureMapDimensions();

  if (!mapWidth.value || !mapHeight.value) {
    console.warn("Map dimensions not available, using element dimensions");
    // Fallback to element dimensions
    const img = event.target;
    mapWidth.value = img.width || 100;
    mapHeight.value = img.height || 100;
  }

  // Get click position relative to the image
  const rect = event.target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100; // Normalize to %
  const y = ((event.clientY - rect.top) / rect.height) * 100; // Normalize to %
  mapCoordinates.value = { x, y };
  console.log(`Marker set at: X = ${x.toFixed(2)}%, Y = ${y.toFixed(2)}%`);
};

const getMapMarkerStyle = computed(() => {
  if (!mapCoordinates.value) return {};

  return {
    top: `${mapCoordinates.value.y}%`,
    left: `${mapCoordinates.value.x}%`,
    transform: "translate(-50%, -100%)", // Adjusts position correctly
    position: "absolute",
  };
});

const loadMapData = () => {
  if (selectedMapPicture.value) {
    mapPreview.value = selectedMapPicture.value.imagePath;
  }
  console.log("🌍 Loaded map data:", selectedMapPicture.value);
};

// combo box might return object when select from dropdown list
// and return string when manually input
// this function return only String
const getStringValue = (input) => {
  if (!input) return null;
  return typeof input === "object" ? input.title || input.value || null : input;
};

const handleSubmit = async () => {
  // Wait for the next DOM update cycle to ensure form data is current
  await nextTick();
  console.log("FormData after Vue update:", formData.value);

  // Validate form fields
  const { valid } = await form.value.validate();

  if (!valid) {
    showNotification({
      type: "error",
      message: t("please_check_required_fields"),
    });
    return;
  }

  // Additional check for organization selection
  if (!isOrganizationSelected()) {
    showNotification({
      type: "error",
      message: t("please_select_an_organization"),
    });
    return;
  }

  // Prepare data for API submission
  // Prepare payload matching SupplyAddEditDTO structure
  const supplyData = {
    // Main supply data
    id: formData.value.id || null,
    quantity: formData.value.quantity || 1,
    receivedBy: formData.value.receivedBy || "System",
    receivedDate: formData.value.receivedDate || null,
    requisitionStatus: formData.value.requisitionStatus || "AVAILABLE",
    supplyModel: formData.value.supplyModel || "Unknown",
    supplyName: formData.value.supplyName || null,
    supplyNumber: formData.value.supplyNumber || null,
    trackingStatus: formData.value.trackingStatus || "ACTIVE",
    transferBy: formData.value.transferBy || null,
    transferDate: formData.value.transferDate || null,

    // Ensure these are always sent as strings
    supplyType: getStringValue(formData.value.supplyType),
    unitOfMeasure: getStringValue(formData.value.unitOfMeasure),

    // RFID
    rfidTagId: formData.value.rfidTagId || null,

    // Hierarchy location
    organizationId: formData.value.organizationId || null,
    armoryId: formData.value.armoryId || null,
    buildingId: formData.value.buildingId || null,
    floorId: formData.value.floorId || null,
    zoneId: formData.value.zoneId || null,
    roomId: formData.value.roomId || null,
    partitionId: formData.value.partitionId || null,
    shelfId: formData.value.shelfId || null,
    slotId: formData.value.slotId || null,

    // Location coordinates
    latitude: formData.value.latitude || null,
    longitude: formData.value.longitude || null,

    // Maps and images

    //mapCoordinates: mapCoordinates.value || null,
    //mapCoordinates: mapCoordinates.value ? JSON.stringify(mapCoordinates.value) : null,

    x_coordinate: mapCoordinates.value?.x ?? null,
    y_coordinate: mapCoordinates.value?.y ?? null,

    image: imagePreview.value || null,
  };

  try {
    let response;
    if (dialogs.value.mode === "edit") {
      console.log("PUT edited Supply to Backend");
      console.log("PUT edited Supply ID:", supplyData.id);
      console.log("PUT edited Supply Data: ", supplyData);

      // debug to see payload before submit

      response = await api.put(
        `/api/supply/update/${supplyData.id}`,
        supplyData
      );

      // Save Map image with marker

      console.log("PUT edited Supply to Backend Response:", response.data);

      showNotification({
        type: "success",
        message: t("supply_updated_successfully"),
      });
    } else {
      console.log("POST new Supply to Backend");
      console.log("POST new Supply ID:", supplyData.id);
      console.log("POST newSupply Data: ", supplyData);
      // debug to see payload before submit

      response = await api.post("/api/supply/add", supplyData);

      // Save Map image with marker

      console.log("POST new Supply to Backend Response:", response.data);
      showNotification({
        type: "success",
        message: t("supply_added_successfully"),
      });
    }

    closeDialog();
  } catch (error) {
    console.error("Error submitting supply:", error);
    showNotification({
      type: "error",
      message: error.response?.data || t("error_submitting_supply"),
    });
  }
};

// Call this in relevant places
watch(selectedMapPicture, (newMap) => {
  if (newMap) {
    mapPreview.value = newMap.imagePath;
    console.log(`Map changed: ${newMap.imagePath}`);

    // Reset dimensions when map changes
    mapWidth.value = 0;
    mapHeight.value = 0;

    // Try to get dimensions after a short delay
    setTimeout(ensureMapDimensions, 500);
  }
});

watch(
  () => formData.value,
  (newValue) => {
    console.log("Watch new formData changed: ", newValue);
    console.log("Watch check Is Closing Flag: ", isClosing.value);

    if (!isClosing.value) {
      console.log("formData changed in parent:", newValue);
      const lowestLevel = findLowestLevelId(newValue);
      console.log("Lowest Level is: ", lowestLevel);
      // Fetch Organization and Longitude / Latitude
      // populate in Add/Edit Dialog
      if (lowestLevel) {
        fetchImageByOrganizationId(lowestLevel);
      }
    }
  },
  { deep: true }
);

/* Add RFID TAG TABLE FOR SELECT IN ADD/EDIT */
import _ from "lodash";
// RFID Tag Table data
const readyRfidTags = ref([]);
const rfidSearchQuery = ref("");
const loadingTags = ref(false);
const tagPage = ref(1);
const tagTotalPages = ref(1);
const tagTotalItems = ref(0);
const tagItemsPerPage = ref(15);

// RFID Tag Table headers
const rfidTagHeaders = ref([
  {
    title: t("rfid_tag_number"),
    key: "rfidNumber",
    sortable: true,
    width: "40%",
  },
  { title: t("rfid_type"), key: "rfidType", sortable: false, width: "30%" },
  { title: t("rfid_size"), key: "rfidSize", sortable: false, width: "15%" },
  {
    title: t("usage_status"),
    key: "usageStatus",
    sortable: false,
    width: "15%",
  },
]);
// RFID Tag Table methods
const fetchReadyRfidTags = async (page = 1) => {
  loadingTags.value = true;
  tagPage.value = page;
  console.log("API CALLED.", tagPage.value);
  try {
    const response = await api.get("/api/rfid_tags/ready/15/page", {
      params: {
        page: tagPage.value - 1, // Backend uses 0-based indexing
        size: tagItemsPerPage.value,
        query: rfidSearchQuery.value || null,
      },
    });

    console.log("Response:", response);

    // Check if response has the expected structure
    if (response.data.content) {
      // Paginated response format
      readyRfidTags.value = response.data.content;
      tagTotalItems.value = response.data.totalElements;
      tagTotalPages.value = response.data.totalPages;
    } else if (Array.isArray(response.data)) {
      // Direct array format - handle as a single page
      readyRfidTags.value = response.data;
      tagTotalItems.value = response.data.length;
      tagTotalPages.value = 1;
    } else {
      console.error("Unexpected response format:", response.data);
      readyRfidTags.value = [];
      tagTotalItems.value = 0;
      tagTotalPages.value = 1;
    }
  } catch (error) {
    console.error("Error fetching RFID tags:", error);
    showError(t("error_fetching_rfid_tags"));
    readyRfidTags.value = [];
    tagTotalItems.value = 0;
    tagTotalPages.value = 1;
  } finally {
    loadingTags.value = false;
  }
};

const handleRfidSearch = _.debounce(() => {
  tagPage.value = 1; // Reset to first page on new search
  fetchReadyRfidTags(1);
}, 300);

// Select an RFID tag from the table
const selectRfidTag000 = (row) => {
  console.log("Selected row:", row);

  // Access the item property which contains the actual data
  if (row && row.item) {
    console.log("Row item:", row.item);

    // In Vuetify 3, row data might be in item.raw or directly in item
    const tagData = row.item.raw || row.item;

    if (tagData && tagData.rfidNumber) {
      console.log("Found RFID number:", tagData.rfidNumber);
      formData.value.rfidTagId = tagData.rfidNumber;

      // Optional: Scroll to the RFID input field
      nextTick(() => {
        const rfidField = document.querySelector(
          '[label="' + t("rfid_tag") + '"]'
        );
        if (rfidField) {
          rfidField.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    } else {
      console.error("Could not find rfidNumber in:", tagData);
    }
  } else {
    console.error("Row or row.item is undefined:", row);
  }
};
const selectRfidTag = (row) => {
  console.log("Selected row:", row);

  if (!row || !row.item) {
    console.error("Row or row.item is undefined:", row);
    return;
  }

  if (row && row.item) {
    console.log("Row item:", row.item);

    const tagData = row.item;

    if (tagData.rfidNumber) {
      console.log("Found RFID number:", tagData.rfidNumber);
      formData.value.rfidTagId = tagData.rfidNumber;

      nextTick(() => {
        const rfidField = document.querySelector(
          '[label="' + t("rfid_tag") + '"]'
        );
        if (rfidField) {
          rfidField.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    } else {
      console.error("Could not find rfidNumber in:", tagData);
    }
  } else {
    console.error("Row or row.item is undefined:", row);
  }
};

watch(locale, () => {
  trackingStatusOptions.value = trackingStatusOptions.value.map((option) => ({
    value: option.value,
    title: t(`tracking_statuses.${option.value}`),
  }));

  requisitionStatusOptions.value = requisitionStatusOptions.value.map(
    (option) => ({
      value: option.value,
      title: t(`requisition_statuses.${option.value}`),
    })
  );
});

onMounted(() => {
  loadMapData();
});

onMounted(async () => {
  isSearchActive.value = false;
  clearSearch();
  await fetchSupplies();
  await fetchOrganizationHierarchy();
  await fetchSupplyTypesAndUnits();

  // Fetch RFID tags when the component is mounted
  // Note: You might want to remove this if you only want to fetch tags
  // when the dialog opens
  // fetchReadyRfidTags();
});

watch(
  () => dialogs.value.add,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        // Validate the whole form (this will trigger errors + red border)
        form.value?.validate();

        // Mark all inputs as touched (optional, makes red border appear without waiting for interaction)
        const inputs = form.value?.$el.querySelectorAll(".v-input");
        inputs?.forEach((input) => input.classList.add("v-input--dirty"));
      });
    }
  }
);
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

.cursor-pointer {
  cursor: pointer;
}

:deep(.v-data-table-footer__items-per-page .v-select) {
  min-width: 120px;
}
.status-chip {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-active {
  background-color: #4caf50;
  color: white;
}

.status-inactive {
  background-color: #9e9e9e;
  color: white;
}

.status-lost {
  background-color: #f44336;
  color: white;
}

.status-available {
  background-color: #2196f3;
  color: white;
}

.status-requisitioned {
  background-color: #ff9800;
  color: white;
}

.status-in_transit {
  background-color: #9c27b0;
  color: white;
}

.status-delivered {
  background-color: #4caf50;
  color: white;
}

.table-container {
  width: 100%;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}
.image-preview {
  width: 100%;
  height: 250px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e8e8e7;
  margin-bottom: 16px;
  padding: 0;
}
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e8e8e7;
}

/* ----------------------- สไตล์ของ Search Section------------------------- */

.search-card {
  border-radius: 8px !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

.search-card:hover {
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1) !important;
  transform: translateY(-2px);
}

.filter-header {
  background-color: #f0f4f8;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  color: #37474f;
  font-weight: 500;
  font-size: 1rem;
}

.search-field :deep(.v-field__field),
.date-field :deep(.v-field__field),
.select-field :deep(.v-field__field) {
  min-height: 40px;
}

.search-field :deep(.v-field),
.date-field :deep(.v-field),
.select-field :deep(.v-field) {
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  transition: all 0.2s ease;
}

.search-field:hover :deep(.v-field),
.date-field:hover :deep(.v-field),
.select-field:hover :deep(.v-field) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-color: #1976d2;
}

.search-button,
.clear-button {
  height: 36px;
  border-radius: 6px !important;
  font-weight: 500;
  font-size: 0.875rem;
  text-transform: none;
  letter-spacing: 0.3px;
  min-width: 100px;
  transition: all 0.2s ease;
}

.search-button {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%) !important;
  color: white !important;
}

.search-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

.clear-button:hover {
  background-color: #f5f5f5 !important;
  transform: translateY(-1px);
}

/* การตอบสนองต่อขนาดหน้าจอ */
@media (max-width: 960px) {
  .search-button,
  .clear-button {
    width: 100%;
  }
}

/* ----------------------- สไตล์สำหรับ Action Bar และ Export Buttons ------------------------- */
/* สไตล์สำหรับ Action Bar และ Export Buttons */
.action-bar-compact {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  transition: all 0.3s ease;
  row-gap: 12px;
}

.action-bar-compact:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.export-container {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  background-color: #f8f9fa;
  padding: 8px 14px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  min-width: 200px;
  width: 100%;
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
  margin-bottom: 8px;
  white-space: nowrap;
}

.export-icon {
  color: #4a494d;
  margin-right: 8px;
  opacity: 0.8;
}

.export-buttons-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.export-btn {
  height: 32px !important;
  min-width: 70px !important;
  padding: 0 10px !important;
  border-radius: 6px !important;
  border: 1px solid #4a494d !important;
  background-color: #ffffff !important;
  color: #4a494d !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  text-transform: none !important;
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease !important;
  flex: 1;
}

.export-json-btn {
  width: 100% !important;
  min-width: 80px !important;
}

.export-btn:hover {
  background-color: #4a494d !important;
  color: white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-1px) !important;
}

.export-btn-icon {
  font-size: 16px !important;
  margin-right: 6px !important;
}

.export-btn-text {
  font-size: 0.85rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  text-transform: none !important;
  white-space: nowrap;
}

.add-btn-wrapper {
  width: 100%;
}

.add-button-compact {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%) !important;
  color: white !important;
  padding: 0 16px !important;
  height: 36px !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  border-radius: 6px !important;
  text-transform: none !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1) !important;
  width: 100%;
}

.add-button-compact:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15) !important;
}

/* การตอบสนองต่อขนาดหน้าจอที่ปรับปรุงแล้ว */
@media (min-width: 600px) {
  .export-container {
    width: auto;
    flex-direction: row;
    align-items: center;
  }

  .export-label {
    margin-bottom: 0;
    margin-right: 12px;
  }

  .export-buttons-wrapper {
    width: auto;
  }

  .add-btn-wrapper {
    width: auto;
  }

  .add-button-compact {
    width: auto;
  }
}

@media (min-width: 960px) {
  .export-btn {
    min-width: 90px !important;
  }

  .export-json-btn {
    min-width: 90px !important;
  }
}

@media (max-width: 599px) {
  .action-bar-compact {
    padding: 10px;
  }

  .export-container {
    margin-bottom: 10px;
  }

  .export-label {
    width: 100%;
    justify-content: center;
  }

  .export-buttons-wrapper {
    justify-content: center;
  }

  .export-btn {
    flex: 0 0 calc(50% - 4px);
    margin: 0;
  }

  .export-json-btn {
    flex: 0 0 100%;
  }
}

@media (max-width: 400px) {
  .export-btn {
    padding: 0 8px !important;
    min-width: 60px !important;
  }

  .export-btn-icon {
    margin-right: 4px !important;
    font-size: 14px !important;
  }

  .export-btn-text {
    font-size: 0.75rem !important;
  }

  .export-label {
    font-size: 0.85rem;
  }
}
</style>
