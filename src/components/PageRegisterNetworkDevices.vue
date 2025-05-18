<!-- ส่วนของฟอร์มค้นหาที่ปรับปรุงใหม่ -->
<template>
  <v-container fluid class="network-devices-management-page pa-4">
    <!-- ส่วนหัวของหน้า -->
    <v-card class="mb-4 header-card" elevation="2">
      <HeaderCommon :title="t('page_network_device_management')" />
    </v-card>

    <!-- ส่วนตัวกรองค้นหา -->
    <v-card class="mb-3 search-card" elevation="1">
      <v-card-title class="py-2 filter-header">
        <v-icon size="small" class="me-1">mdi-magnify</v-icon>
        {{ t("search") }}
      </v-card-title>
      <v-card-text class="py-2">
        <v-row dense>
          <!-- ช่องค้นหาข้อความ -->
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

          <!-- ตัวเลือกองค์กร -->
          <v-col cols="12" md="3">
            <v-select
              v-model="searchData.organizationId"
              :items="organizationsSearchOptions"
              :label="t('organization')"
              item-title="title"
              item-value="value"
              prepend-inner-icon="mdi-office-building-outline"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              class="select-field"
              @update:model-value="handleOrganizationChange($event, 'search')"
            />
          </v-col>

          <!-- ตัวเลือกคลัง -->
          <v-col cols="12" md="3">
            <v-select
              v-model="searchData.armoryId"
              :items="armoriesSearchOptions"
              :label="t('armory')"
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

          <!-- ตัวเลือกอาคาร -->
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

          <!-- ตัวเลือกชั้น -->
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

          <!-- ตัวเลือกโซน -->
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

          <!-- ตัวเลือกห้อง -->
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

          <!-- ตัวเลือกสถานะ -->
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedStatus"
              :items="statuses"
              :label="t('device_status')"
              prepend-inner-icon="mdi-circle-slice-3"
              clearable
              hide-details
              variant="outlined"
              density="compact"
              class="status-field"
              :class="{ 'status-from-dashboard': isFilterFromDashboard }"
            ></v-select>
          </v-col>
        </v-row>

        <!-- ปุ่มค้นหาและล้างข้อมูล -->
        <v-row class="mt-3">
          <v-col cols="12" class="d-flex justify-end gap-4">
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
              elevation="1"
              prepend-icon="mdi-eraser"
            >
              {{ t("clear_search") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ส่วนของปุ่มAdd -->
    <div class="d-flex justify-end mb-3 action-bar">
      <!-- ปุ่มเพิ่ม -->
      <v-btn
        color="primary"
        size="small"
        elevation="2"
        @click="showAddDialog"
        class="add-button"
        prepend-icon="mdi-plus-circle"
      >
        {{ t("add") }}
      </v-btn>
    </div>

    <!-- ส่วนของตารางข้อมูล -->
    <v-card class="data-table-card mb-4" elevation="2">
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
        class="elevation-0 custom-data-table"
      >
        <!-- แสดงส่วน Loading -->
        <template v-slot:loading>
          <v-skeleton-loader
            type="table-row-divider@6"
            class="ma-4"
          ></v-skeleton-loader>
        </template>

        <!-- คอลัมน์รูปภาพ -->
        <template v-slot:item.image="{ item }">
          <div
            class="d-flex justify-center align-center reader-image-container"
          >
            <v-img
              :src="readerIcon"
              alt="Reader Icon"
              width="80"
              height="80"
              contain
              @click="handleImageIconClick(item)"
              class="reader-image"
            />
          </div>
        </template>

        <!-- คอลัมน์สถานะอุปกรณ์ -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.deviceStatus)"
            size="small"
            variant="elevated"
            class="status-chip"
          >
            {{ item.deviceStatus }}
          </v-chip>
        </template>

        <!-- คอลัมน์รายละเอียดอุปกรณ์ -->
        <template v-slot:item.deviceInfo="{ item }">
          <div class="device-info">
            <div class="device-info-item">
              <v-icon size="small" color="primary" class="me-1"
                >mdi-barcode-scan</v-icon
              >
              <span class="device-info-label"
                >{{ t("reader_serial_number") }}:</span
              >
              <span class="device-info-value">{{
                item.readerSerialNumber
              }}</span>
            </div>
            <div class="device-info-item">
              <v-icon size="small" color="primary" class="me-1"
                >mdi-pound</v-icon
              >
              <span class="device-info-label">{{ t("supply_number") }}:</span>
              <span class="device-info-value">{{ item.supplyNumber }}</span>
            </div>
            <div class="device-info-item">
              <v-icon size="small" color="primary" class="me-1"
                >mdi-tag-text</v-icon
              >
              <span class="device-info-label">{{ t("supply_name") }}:</span>
              <span class="device-info-value">{{ item.supplyName }}</span>
            </div>
            <div class="device-info-item">
              <v-icon size="small" color="primary" class="me-1"
                >mdi-ip-network</v-icon
              >
              <span class="device-info-label">{{ t("ip_address") }}:</span>
              <span class="device-info-value">{{ item.ipAddress }}</span>
            </div>
            <div class="device-info-item">
              <v-icon size="small" color="primary" class="me-1"
                >mdi-devices</v-icon
              >
              <span class="device-info-label">{{ t("device_role") }}:</span>
              <span class="device-info-value">{{ item.deviceRole }}</span>
            </div>
            <div class="device-info-item">
              <v-icon size="small" color="primary" class="me-1"
                >mdi-information-outline</v-icon
              >
              <span class="device-info-label">{{ t("detail_location") }}:</span>
              <span class="device-info-value">{{ item.notes }}</span>
            </div>
          </div>
        </template>

        <!-- คอลัมน์แผนภาพการติดตั้ง -->
        <template v-slot:item.installationDiagram="{ item }">
          <div class="d-flex justify-center align-center h-100">
            <v-btn
              icon
              color="error"
              variant="flat"
              size="large"
              @click="handleInstallationClick(item)"
              class="installation-btn"
            >
              <v-icon>mdi-map-marker-radius</v-icon>
              <div class="pulse-effect"></div>
            </v-btn>
          </div>
        </template>

        <!-- คอลัมน์รายละเอียดจุดติดตั้ง -->
        <template v-slot:item.location="{ item }">
          <div class="location-info">
            <div class="location-info-row">
              <v-icon size="small" color="indigo-darken-1" class="me-1"
                >mdi-office-building</v-icon
              >
              <span class="location-info-label"
                >{{ t("column_organization") }}:</span
              >
              <span class="location-info-value">{{
                getTranslation(item.hierarchyTranslations, "ORGANIZATION")
              }}</span>
            </div>
            <div class="location-info-row">
              <v-icon size="small" color="indigo-darken-1" class="me-1"
                >mdi-shield-home</v-icon
              >
              <span class="location-info-label">{{ t("armory") }}:</span>
              <span class="location-info-value">{{
                getTranslation(item.hierarchyTranslations, "ARMORY")
              }}</span>
            </div>
            <div class="location-info-row">
              <v-icon size="small" color="indigo-darken-1" class="me-1"
                >mdi-domain</v-icon
              >
              <span class="location-info-label">{{ t("building") }}:</span>
              <span class="location-info-value">{{
                getTranslation(item.hierarchyTranslations, "BUILDING")
              }}</span>
            </div>
            <div class="location-info-row">
              <v-icon size="small" color="indigo-darken-1" class="me-1"
                >mdi-stairs</v-icon
              >
              <span class="location-info-label">{{ t("floor") }}:</span>
              <span class="location-info-value">{{
                getTranslation(item.hierarchyTranslations, "FLOOR")
              }}</span>
            </div>
            <div class="location-info-row">
              <v-icon size="small" color="indigo-darken-1" class="me-1"
                >mdi-map</v-icon
              >
              <span class="location-info-label">{{ t("zone") }}:</span>
              <span class="location-info-value">{{
                getTranslation(item.hierarchyTranslations, "ZONE")
              }}</span>
            </div>
            <div class="location-info-row">
              <v-icon size="small" color="indigo-darken-1" class="me-1"
                >mdi-door</v-icon
              >
              <span class="location-info-label">{{ t("room") }}:</span>
              <span class="location-info-value">{{
                getTranslation(item.hierarchyTranslations, "ROOM")
              }}</span>
            </div>
          </div>
        </template>

        <!-- คอลัมน์แสดงปุ่มการทำงาน -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2 justify-center">
            <v-btn
              icon
              variant="flat"
              size="small"
              color="primary"
              @click="editDevice(item)"
              class="action-button"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent">{{ t("edit") }}</v-tooltip>
            </v-btn>

            <v-btn
              icon
              variant="flat"
              size="small"
              color="error"
              @click="deleteDevice(item)"
              class="action-button"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent">{{ t("delete") }}</v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- แสดงข้อความเมื่อไม่มีข้อมูล -->
        <template v-slot:no-data>
          <div
            class="d-flex flex-column align-center justify-center pa-6 empty-state"
          >
            <v-icon size="64" color="grey-lighten-1"
              >mdi-router-network-off</v-icon
            >
            <div class="text-h6 mt-4 text-grey-darken-1">
              {{ t("no_readers_found") || "ไม่พบข้อมูลเครื่องอ่าน RFID" }}
            </div>
            <div class="text-subtitle-1 mt-2 text-center grey--text">
              {{
                t("try_different_search_or_add") ||
                "ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มเครื่องอ่าน RFID ใหม่"
              }}
            </div>
            <v-btn color="primary" class="mt-4" @click="showAddDialog">
              <v-icon left class="me-2">mdi-plus-circle</v-icon>
              {{ t("add_rfid_reader") }}
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- ส่วนของ Add / Edit Device Dialog -->
    <v-dialog
      v-if="dialogs.add"
      v-model="dialogs.add"
      max-width="1200px"
      @click:outside="closeDialog"
      class="device-dialog"
    >
      <v-card class="dialog-card">
        <v-card-title class="dialog-header">
          <v-icon size="24" color="primary" class="me-2">
            {{
              dialogs.mode === "edit" ? "mdi-pencil-circle" : "mdi-plus-circle"
            }}
          </v-icon>
          {{
            dialogs.mode === "edit"
              ? t("edit_rfid_reader")
              : t("add_rfid_reader")
          }}
          <v-spacer></v-spacer>
          <v-btn
            icon
            variant="text"
            size="small"
            @click="closeDialog"
            class="close-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pt-4">
          <v-container>
            <!-- แผนผังเลเอาท์ของชั้น -->
            <v-row>
              <v-col cols="12" class="text-center">
                <div class="section-title mb-2">
                  <v-icon size="small" class="me-1 section-icon"
                    >mdi-floor-plan</v-icon
                  >
                  {{ t("show_floor_plan") }} ({{ t("for_plan") }})
                </div>
                <v-sheet
                  ref="floorPlanSheet"
                  class="map-preview-area floor-plan-container d-flex align-center justify-center position-relative"
                  color="grey-lighten-3"
                  rounded
                  height="500px"
                  width="100%"
                  style="opacity: 0.9"
                >
                  <v-img
                    v-if="selectedFloorPlan?.imagePath || floorPlanPreview"
                    :src="floorPlanPreview || selectedFloorPlan.imagePath"
                    contain
                    height="100%"
                    width="100%"
                    style="opacity: 0.8"
                    class="cursor-pointer"
                    @click="handleFloorPlanClick"
                    @load="adjustFloorPlanMarkerPosition"
                  />
                  <!-- ตัวชี้ตำแหน่งบนแผนผังชั้น -->
                  <v-icon
                    v-if="floorPlanCoordinates"
                    :color="selectedRoleColor"
                    size="48"
                    class="position-absolute marker-pulse"
                    :style="getFloorPlanMarkerStyle()"
                  >
                    mdi-router-wireless
                  </v-icon>
                  <!-- ข้อความเมื่อไม่มีแผนผังชั้น -->
                  <div
                    v-if="!selectedFloorPlan?.imagePath && !floorPlanPreview"
                    class="text-grey position-absolute w-100 text-center no-map-message"
                  >
                    <v-icon size="48" color="grey-lighten-1"
                      >mdi-map-outline</v-icon
                    >
                    <div class="mt-3">{{ t("no_floor_plan_available") }}</div>
                    <div class="text-caption mt-1">
                      {{ t("please_click_on_map_to_set_coordinates") }}
                    </div>
                  </div>
                </v-sheet>
              </v-col>

              <!-- ตำแหน่งละติจูดและลองจิจูด -->
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="formData.latitude"
                  :label="t('latitude')"
                  type="number"
                  step="0.000001"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  prepend-inner-icon="mdi-map-marker-radius"
                  class="coordinate-field"
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
                  hide-details
                  prepend-inner-icon="mdi-map-marker-radius"
                  class="coordinate-field"
                ></v-text-field>
              </v-col>

              <!-- พิกัด X-Y สำหรับแผนผังชั้น -->
              <v-col cols="12" md="3">
                <v-text-field
                  :model-value="
                    floorPlanCoordinates?.x
                      ? floorPlanCoordinates.x.toFixed(2)
                      : ''
                  "
                  :label="t('x-coordinate-floor-plan')"
                  type="number"
                  step="0.000001"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  readonly
                  prepend-inner-icon="mdi-axis-x-arrow"
                  :rules="[
                    () => requiredCoordinateRule(floorPlanCoordinates?.x, t),
                  ]"
                  class="coordinate-field"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  :model-value="
                    floorPlanCoordinates?.y
                      ? floorPlanCoordinates.y.toFixed(2)
                      : ''
                  "
                  :label="t('y-coordinate-floor-plan')"
                  type="number"
                  step="0.000001"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  readonly
                  prepend-inner-icon="mdi-axis-y-arrow"
                  :rules="[
                    () => requiredCoordinateRule(floorPlanCoordinates?.y, t),
                  ]"
                  class="coordinate-field"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <v-form ref="form" v-model="valid">
              <!-- ส่วนข้อมูลอุปกรณ์ -->
              <div class="section-title mb-2">
                <v-icon size="small" class="me-1 section-icon"
                  >mdi-devices</v-icon
                >
                {{ t("device_info") }}
              </div>
              <v-row dense>
                <!-- หมายเลข RFID ไม่จำเป็นสำหรับ RFID Reader -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.rfidNo"
                    :label="t('rfid_no')"
                    :rules="[rfidNumberRule]"
                    variant="outlined"
                    density="comfortable"
                    :disabled="true"
                    prepend-inner-icon="mdi-barcode"
                    hide-details
                    class="mb-3 input-field"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.supplyNumber"
                    :label="t('supply_number')"
                    :rules="[requiredRule, maxLength(100)]"
                    required
                    variant="outlined"
                    density="comfortable"
                    readonly
                    prepend-inner-icon="mdi-pound"
                    hide-details
                    class="mb-3 input-field"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.deviceType"
                    :label="t('device_type')"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    prepend-inner-icon="mdi-gate"
                    hide-details
                    class="mb-3 input-field"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.modelNumber"
                    :label="t('model_number')"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-identifier"
                    hide-details
                    class="mb-3 input-field"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.readerSerialNumber"
                    :label="t('serial_number')"
                    variant="outlined"
                    density="comfortable"
                    :rules="[requiredRule, maxLength(100)]"
                    required
                    prepend-inner-icon="mdi-key-variant"
                    hide-details
                    class="mb-3 input-field"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.macAddress"
                    :label="'MAC Address'"
                    :rules="[macAddressRule]"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-network"
                    hide-details
                    class="mb-3 input-field"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.firmwareVersion"
                    :label="t('firmware_version')"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-update"
                    hide-details
                    class="mb-3 input-field"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.quantity"
                    :label="t('quantity')"
                    type="number"
                    :rules="[requiredRule, positiveNumberRule]"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    prepend-inner-icon="mdi-numeric"
                    hide-details
                    class="mb-3 input-field"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.unit"
                    :label="t('unit')"
                    :items="unitOptions"
                    :rules="[maxLength(100)]"
                    mandatory
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-scale-balance"
                    hide-details
                    class="mb-3 input-field"
                  ></v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.ipAddress"
                    :label="'IP Address'"
                    :rules="[requiredRule, requiredIpAddressRule]"
                    required
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-ip-network"
                    hide-details
                    class="mb-3 input-field"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.role"
                    :label="t('reader_role')"
                    :items="roleOptions"
                    :rules="[requiredRule]"
                    required
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-tie"
                    hide-details
                    class="mb-3 input-field"
                  ></v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.readerName"
                    :label="t('device_name')"
                    :rules="[requiredRule, maxLength(100)]"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-rename"
                    hide-details
                    class="mb-3 input-field"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.note"
                    :label="t('note')"
                    :rules="[requiredRule, maxLength(100)]"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-note-text"
                    hide-details
                    class="mb-3 input-field"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <!-- ส่วนตำแหน่งติดตั้ง -->
              <div class="section-title mb-2">
                <v-icon size="small" class="me-1 section-icon"
                  >mdi-map-marker</v-icon
                >
                {{ t("location_installation") }}
              </div>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.organizationId"
                    :items="organizationOptions"
                    :label="t('organization')"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    prepend-inner-icon="mdi-office-building"
                    hide-details
                    class="mb-3 input-field"
                    @update:model-value="
                      handleOrganizationChange($event, 'dialog')
                    "
                  ></v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.armoryId"
                    :items="armoryOptions"
                    :label="t('armory')"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    prepend-inner-icon="mdi-shield"
                    hide-details
                    class="mb-3 input-field"
                    @update:model-value="handleArmoryChange($event, 'dialog')"
                  ></v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.buildingId"
                    :items="buildingOptions"
                    :label="t('building')"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    prepend-inner-icon="mdi-home-city"
                    hide-details
                    class="mb-3 input-field"
                    @update:model-value="handleBuildingChange($event, 'dialog')"
                  ></v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.floorId"
                    :items="floorOptions"
                    :label="t('floor')"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    prepend-inner-icon="mdi-layers"
                    hide-details
                    class="mb-3 input-field"
                    @update:model-value="handleFloorChange($event, 'dialog')"
                  ></v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.zoneId"
                    :items="zoneOptions"
                    :label="t('zone')"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    prepend-inner-icon="mdi-map"
                    hide-details
                    class="mb-3 input-field"
                    @update:model-value="handleZoneChange($event, 'dialog')"
                  ></v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.roomId"
                    :items="roomOptions"
                    :label="t('room')"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    prepend-inner-icon="mdi-door-sliding"
                    hide-details
                    class="mb-3 input-field"
                    @update:model-value="handleRoomChange($event, 'dialog')"
                  ></v-select>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <!-- แผนที่หลักองค์กร (ส่วน Add / Edit Dialog) -->
              <div class="section-title mb-2">
                <v-icon size="small" class="me-1 section-icon">mdi-map</v-icon>
                {{ t("main_org_map") }}
              </div>
              <v-row>
                <v-col cols="12">
                  <v-sheet
                    ref="mapSheet"
                    class="map-preview-area org-map-container d-flex align-center justify-center position-relative"
                    color="grey-lighten-3"
                    rounded
                    height="500px"
                    width="100%"
                  >
                    <v-img
                      v-if="selectedMapPicture?.imagePath || mapPreview"
                      :src="mapPreview || selectedMapPicture.imagePath"
                      contain
                      height="100%"
                      width="100%"
                      style="opacity: 0.8"
                      class="cursor-pointer"
                      @click="handleMapClick"
                      @load="adjustMapMarkerPosition"
                    />
                    <!-- ตัวชี้ตำแหน่งบนแผนที่ -->
                    <v-icon
                      v-if="mapCoordinates"
                      color="red"
                      size="48"
                      class="position-absolute marker-pulse"
                      :style="getMapMarkerStyle()"
                    >
                      mdi-map-marker
                    </v-icon>
                    <!-- ข้อความเมื่อไม่มีแผนที่ -->
                    <div
                      v-if="!selectedMapPicture?.imagePath && !mapPreview"
                      class="text-grey position-absolute w-100 text-center no-map-message"
                    >
                      <v-icon size="48" color="grey-lighten-1"
                        >mdi-map-outline</v-icon
                      >
                      <div class="mt-3">{{ t("no_map_available") }}</div>
                      <div class="text-caption mt-1">
                        {{ t("please_click_on_map_to_set_coordinates") }}
                      </div>
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
                    prepend-inner-icon="mdi-map-marker-radius"
                    hide-details
                    class="mb-3 coordinate-field"
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
                    prepend-inner-icon="mdi-map-marker-radius"
                    hide-details
                    class="mb-3 coordinate-field"
                  ></v-text-field>
                </v-col>

                <!-- พิกัด X-Y สำหรับแผนที่ -->
                <v-col cols="12" md="3">
                  <v-text-field
                    :model-value="
                      mapCoordinates?.x ? mapCoordinates.x.toFixed(2) : ''
                    "
                    :label="t('x-coordinate-map')"
                    type="number"
                    step="0.000001"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    hide-details
                    prepend-inner-icon="mdi-axis-x-arrow"
                    :rules="[
                      () => requiredCoordinateRule(mapCoordinates?.x, t),
                    ]"
                    class="mb-3 coordinate-field"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field
                    :model-value="
                      mapCoordinates?.y ? mapCoordinates.y.toFixed(2) : ''
                    "
                    :label="t('y-coordinate-map')"
                    type="number"
                    step="0.000001"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    hide-details
                    prepend-inner-icon="mdi-axis-y-arrow"
                    :rules="[
                      () => requiredCoordinateRule(mapCoordinates?.y, t),
                    ]"
                    class="mb-3 coordinate-field"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="outlined"
            @click="closeDialog"
            class="cancel-btn me-3"
            prepend-icon="mdi-close-circle"
          >
            {{ t("cancel") }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="handleSubmit"
            :disabled="!valid"
            class="submit-btn"
            :loading="loading"
            prepend-icon="mdi-content-save"
          >
            {{ dialogs.mode === "edit" ? t("update") : t("save") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ส่วนของ Details Dialog แสดงรายละเอียดอุปกรณ์ -->
    <v-dialog
      v-if="dialogs.details"
      v-model="dialogs.details"
      max-width="1200px"
      @click:outside="closeDetailsDialog"
      class="details-dialog"
    >
      <v-card>
        <v-card-title class="details-header d-flex align-center">
          <v-icon color="primary" size="24" class="me-2"
            >mdi-router-wireless</v-icon
          >
          <span class="text-h6">{{ t("device_details") }}</span>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            size="small"
            @click="closeDetailsDialog"
            variant="text"
          ></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <v-container>
            <!-- ส่วนแผนที่ -->
            <v-row>
              <v-col cols="12">
                <div class="section-title mb-2">
                  <v-icon color="primary" size="20" class="me-2"
                    >mdi-map</v-icon
                  >
                  {{ t("map") }}
                </div>
                <v-sheet
                  ref="detailsMapSheet"
                  class="map-preview-area org-detail-map-container d-flex align-center justify-center position-relative"
                  color="grey-lighten-3"
                  rounded
                  height="600px"
                  width="100%"
                >
                  <v-img
                    v-if="detailsMapPreview"
                    :src="detailsMapPreview"
                    contain
                    height="100%"
                    width="100%"
                    class="cursor-pointer"
                    style="opacity: 0.7"
                    @load="adjustDetailsMapMarker"
                  />
                  <v-icon
                    v-if="detailsMapCoordinates"
                    color="red"
                    size="48"
                    class="position-absolute"
                    :style="getDetailsMapMarkerStyle()"
                  >
                    mdi-map-marker
                  </v-icon>
                  <div
                    v-if="!detailsMapPreview"
                    class="empty-map-placeholder position-absolute w-100 text-center"
                  >
                    <v-icon size="64" color="grey-lighten-1"
                      >mdi-map-outline</v-icon
                    >
                    <div class="mt-2 text-grey-darken-1">
                      {{ t("no_map_available") }}
                    </div>
                  </div>
                </v-sheet>
              </v-col>
            </v-row>

            <!-- ข้อมูลอุปกรณ์ -->
            <v-row class="mt-4">
              <v-col cols="12">
                <div class="section-title mb-2">
                  <v-icon color="primary" size="20" class="me-2"
                    >mdi-information-outline</v-icon
                  >
                  {{ t("device_info") }}
                </div>
                <v-card class="device-info-card" variant="outlined" border>
                  <v-table density="comfortable" class="rounded-lg">
                    <tbody>
                      <tr>
                        <td class="info-label" width="200">
                          {{ t("supply_number") }}
                        </td>
                        <td class="info-value">
                          {{ selectedDevice?.supplyNumber }}
                        </td>
                        <td class="info-label" width="200">
                          {{ t("device_name") }}
                        </td>
                        <td class="info-value">
                          {{ selectedDevice?.supplyName }}
                        </td>
                      </tr>
                      <tr>
                        <td class="info-label">{{ t("organization") }}</td>
                        <td class="info-value">
                          {{ selectedDevice?.organization }}
                        </td>
                        <td class="info-label">{{ t("armory") }}</td>
                        <td class="info-value">{{ selectedDevice?.armory }}</td>
                      </tr>
                      <tr>
                        <td class="info-label">{{ t("building") }}</td>
                        <td class="info-value">
                          {{ selectedDevice?.building }}
                        </td>
                        <td class="info-label">{{ t("floor") }}</td>
                        <td class="info-value">{{ selectedDevice?.floor }}</td>
                      </tr>
                      <tr>
                        <td class="info-label">{{ t("zone") }}</td>
                        <td class="info-value">{{ selectedDevice?.zone }}</td>
                        <td class="info-label">{{ t("room") }}</td>
                        <td class="info-value">{{ selectedDevice?.room }}</td>
                      </tr>
                      <tr>
                        <td class="info-label">{{ t("partition") }}</td>
                        <td class="info-value">
                          {{ selectedDevice?.partition || "-" }}
                        </td>
                        <td class="info-label">{{ t("shelf") }}</td>
                        <td class="info-value">
                          {{ selectedDevice?.shelf || "-" }}
                        </td>
                      </tr>
                      <tr>
                        <td class="info-label">{{ t("slot") }}</td>
                        <td class="info-value" colspan="3">
                          {{ selectedDevice?.slot || "-" }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card>
              </v-col>
            </v-row>

            <!-- แผนผังชั้น -->
            <v-row class="mt-4">
              <v-col cols="12">
                <div class="section-title mb-2">
                  <v-icon color="primary" size="20" class="me-2"
                    >mdi-floor-plan</v-icon
                  >
                  {{ t("floor_plan") }}
                </div>
                <v-sheet
                  ref="detailFloorPlanSheet"
                  class="map-preview-area detail-floor-plan-container d-flex align-center justify-center position-relative"
                  color="grey-lighten-3"
                  rounded
                  height="600px"
                  width="100%"
                >
                  <v-img
                    v-if="detailsFloorPlanPreview"
                    :src="detailsFloorPlanPreview"
                    contain
                    height="100%"
                    width="100%"
                    class="cursor-pointer"
                    style="opacity: 0.7"
                  />
                  <v-icon
                    v-if="detailsFloorPlanCoordinates"
                    :color="detailsRoleColor"
                    size="48"
                    class="position-absolute"
                    :style="{
                      left: `${detailsFloorPlanCoordinates.x}%`,
                      top: `${detailsFloorPlanCoordinates.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    }"
                  >
                    mdi-router-network-wireless
                  </v-icon>
                  <div
                    v-if="!detailsFloorPlanPreview"
                    class="empty-map-placeholder position-absolute w-100 text-center"
                  >
                    <v-icon size="64" color="grey-lighten-1"
                      >mdi-floor-plan</v-icon
                    >
                    <div class="mt-2 text-grey-darken-1">
                      {{ t("no_floor_plan_available") }}
                    </div>
                  </div>
                </v-sheet>
              </v-col>
            </v-row>

            <!-- ตารางประวัติอุปกรณ์ -->
            <v-row class="mt-4">
              <v-col cols="12">
                <div class="section-title mb-2">
                  <v-icon color="primary" size="20" class="me-2"
                    >mdi-history</v-icon
                  >
                  {{ t("device_history") }}
                </div>
                <v-card class="history-card" variant="outlined" border>
                  <v-data-table-server
                    :headers="historyHeaders"
                    :items="deviceHistory"
                    :loading="loading"
                    :items-per-page="historyItemsPerPage"
                    :page="historyPage"
                    :items-length="totalHistoryItems"
                    :items-per-page-options="[5, 10, 25]"
                    @update:options="handleHistoryOptionsUpdate"
                    density="comfortable"
                    hover
                    class="history-table"
                  >
                    <!-- Template สำหรับสถานะ -->
                    <template v-slot:item.alert="{ item }">
                      <v-chip
                        size="small"
                        :color="getAlertChipColor(item.alert)"
                        variant="outlined"
                        class="status-chip"
                      >
                        {{ item.alert }}
                      </v-chip>
                    </template>

                    <!-- Template สำหรับเวลา -->
                    <template v-slot:item.datetime="{ item }">
                      <span class="datetime-column">{{ item.datetime }}</span>
                    </template>

                    <!-- Template สำหรับข้อความ -->
                    <template v-slot:item.notes="{ item }">
                      <span class="notes-column">{{ item.notes || "-" }}</span>
                    </template>

                    <!-- Template สถานะว่างเปล่า -->
                    <template v-slot:no-data>
                      <div
                        class="d-flex flex-column align-center justify-center py-6"
                      >
                        <v-icon size="48" color="grey-lighten-1"
                          >mdi-history-off</v-icon
                        >
                        <div class="text-grey-darken-1 mt-3">
                          {{ t("no_data_available") }}
                        </div>
                      </div>
                    </template>
                  </v-data-table-server>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="details-actions pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="outlined"
            @click="closeDetailsDialog"
            class="details-close-btn"
            prepend-icon="mdi-close-circle"
          >
            {{ t("close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import Dialog -->
    <v-dialog v-model="dialogs.import" max-width="800" class="import-dialog">
      <v-card class="import-card">
        <v-card-title class="import-header">
          <v-icon class="me-2" color="primary">mdi-database-import</v-icon>
          {{ t("add_rfid_reader") }}
        </v-card-title>

        <v-card-text class="import-content pa-4">
          <!-- คำเตือนด้านบน -->
          <v-alert
            type="warning"
            variant="tonal"
            border="start"
            density="compact"
            icon="mdi-information-outline"
            class="mb-4 alert-custom"
          >
            {{ t("feature_not_supported_yet") }}
          </v-alert>

          <!-- ส่วนดาวน์โหลดเทมเพลต -->
          <v-sheet
            color="grey-lighten-4"
            class="rounded-lg pa-4 mb-4 template-section"
          >
            <div class="d-flex flex-column align-center text-center">
              <div class="text-h6 mb-3 primary--text">
                <v-icon class="me-1" color="primary">mdi-file-download</v-icon>
                {{ t("download_template_to_system") }}
              </div>

              <v-btn
                variant="outlined"
                color="primary"
                class="download-btn mb-3"
                @click="downloadTemplate"
                prepend-icon="mdi-microsoft-excel"
              >
                Template_form.xlsx
              </v-btn>

              <div class="text-body-2 text-grey-darken-1">
                {{ t("download_guide_line") }}
              </div>
            </div>
          </v-sheet>

          <!-- ส่วนการนำเข้าไฟล์ -->
          <v-sheet
            color="grey-lighten-4"
            class="rounded-lg pa-4 import-section"
          >
            <div class="text-subtitle-1 mb-3">
              <v-icon class="me-1" color="primary">mdi-file-upload</v-icon>
              {{ t("import_files") }}
            </div>

            <div class="d-flex align-center file-selection-area">
              <v-text-field
                v-model="selectedFileName"
                :placeholder="t('select_file') || 'Select file...'"
                readonly
                variant="outlined"
                density="compact"
                class="flex-grow-1 me-2"
                prepend-inner-icon="mdi-file-document-outline"
                :disabled="true"
              ></v-text-field>

              <v-btn
                color="primary"
                variant="elevated"
                :disabled="true"
                class="select-file-btn"
                @click="selectFile"
                prepend-icon="mdi-file-find"
              >
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

            <!-- ตัวแสดงสถานะไฟล์ -->
            <div v-if="selectedFileName" class="selected-file-info mt-3">
              <v-chip
                size="small"
                color="primary"
                variant="outlined"
                prepend-icon="mdi-microsoft-excel"
              >
                {{ selectedFileName }}
              </v-chip>
            </div>
          </v-sheet>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="dialogs.import = false"
            class="me-3 cancel-btn"
            prepend-icon="mdi-close"
          >
            {{ t("cancel_button") }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="true"
            class="import-btn"
            @click="importFile"
            prepend-icon="mdi-database-import"
            :loading="loading"
          >
            {{ t("save_button") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ส่วนของ Delete Confirm Dialog -->
    <v-dialog
      v-model="dialogs.confirmDelete"
      max-width="500px"
      class="delete-confirm-dialog"
    >
      <v-card class="confirm-dialog-card">
        <v-card-title class="dialog-header">
          <v-icon size="28" color="error" class="me-2">mdi-alert-circle</v-icon>
          {{ t("confirm_delete") }}
        </v-card-title>

        <v-divider class="mx-4"></v-divider>

        <v-card-text class="pt-4 pb-2 text-center">
          <p class="confirm-message mb-0">
            {{
              t("confirm_delete_reader", {
                deviceName: dialogs.deleteItem?.supplyName || "-",
              })
            }}
          </p>
          <div class="device-info-preview mt-4">
            <v-icon size="36" color="grey" class="device-icon mb-2"
              >mdi-router-wireless</v-icon
            >
            <div class="device-name">
              {{ dialogs.deleteItem?.supplyName || "-" }}
            </div>
            <div class="device-serial text-caption">
              {{ t("serial_number") }}:
              {{ dialogs.deleteItem?.readerSerialNumber || "-" }}
            </div>
            <v-chip
              size="small"
              :color="getStatusColor(dialogs.deleteItem?.deviceStatus)"
              class="mt-2"
            >
              {{ dialogs.deleteItem?.deviceStatus || "-" }}
            </v-chip>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 d-flex justify-space-between">
          <v-btn
            color="grey"
            variant="text"
            @click="dialogs.confirmDelete = false"
            class="cancel-btn"
          >
            {{ t("cancel") }}
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="confirmDeleteDevice"
            class="delete-btn"
            :loading="loading"
          >
            <v-icon size="small" class="me-1">mdi-delete</v-icon>
            {{ t("delete") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
/* สไตล์ทั่วไปของหน้า */
.network-devices-management-page {
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

/* สไตล์ของการ์ด */
.header-card,
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

/* ส่วนหัวของตัวกรอง */
.filter-header {
  background-color: #f0f4f8;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  color: #37474f;
  font-weight: 500;
  font-size: 1rem;
}

/* สไตล์ช่องกรอกข้อมูลค้นหา */
.search-field :deep(.v-field__field),
.select-field :deep(.v-field__field),
.status-field :deep(.v-field__field) {
  min-height: 40px;
}

.search-field :deep(.v-field),
.select-field :deep(.v-field),
.status-field :deep(.v-field) {
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  transition: all 0.2s ease;
}

.search-field:hover :deep(.v-field),
.select-field:hover :deep(.v-field),
.status-field:hover :deep(.v-field) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-color: #1976d2;
}

/* สไตล์ปุ่มค้นหาและล้างข้อมูล */
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

/* แถบ action */
.action-bar {
  padding: 8px 12px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

/* ส่วน Export */
.export-container {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 6px 12px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.export-label {
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  font-weight: 500;
  color: #455a64;
  margin-right: 12px;
}

.export-icon {
  color: #455a64;
  margin-right: 8px;
  opacity: 0.8;
}

.export-btn {
  height: 30px !important;
  padding: 0px 12px !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
  font-size: 0.75rem !important;
  text-transform: none !important;
  letter-spacing: 0.3px !important;
  transition: all 0.2s ease !important;
}

.export-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
}

/* ปุ่มเพิ่ม */
.add-button {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%) !important;
  color: white !important;
  height: 36px;
  border-radius: 6px !important;
  font-weight: 500;
  font-size: 0.875rem;
  text-transform: none;
  letter-spacing: 0.3px;
  padding: 0 16px !important;
  transition: all 0.2s ease;
}

.add-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

/* สไตล์สำหรับไฮไลท์ตัวกรองที่ถูกเลือกจาก Dashboard */
.status-from-dashboard :deep(.v-field) {
  background-color: rgba(33, 150, 243, 0.1);
  border: 1px solid #1976d2;
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(33, 150, 243, 0);
  }
}

/* การตอบสนองต่อขนาดหน้าจอ */
@media (max-width: 960px) {
  .export-container {
    flex-wrap: wrap;
  }

  .export-label {
    width: 100%;
    margin-bottom: 8px;
  }

  .export-btn {
    margin-top: 4px;
  }
}

@media (max-width: 600px) {
  .action-bar {
    flex-direction: column;
    gap: 12px;
  }

  .export-container {
    width: 100%;
  }

  .add-button {
    width: 100%;
  }
}


/* เพิ่ม CSS สำหรับข้อความในตาราง */
.device-info-item {
  display: flex;
  align-items: center;
  white-space: nowrap; 
  overflow: hidden;    
  text-overflow: ellipsis; 
}

.device-info-value {
  color: #37474f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; 
}

.location-info-row {
  display: flex;
  align-items: center;
  white-space: nowrap; 
  overflow: hidden;    
  text-overflow: ellipsis; 
}

.location-info-value {
  color: #37474f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; 
}

/* <!------------------------------ Add / Edit Device -------------------------------------> */

/* สไตล์สำหรับตารางข้อมูล */
.data-table-card {
  border-radius: 8px !important;
  overflow: hidden;
  transition: all 0.3s ease;
}

.data-table-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
  transform: translateY(-2px);
}

/* การแต่งตารางข้อมูล */
:deep(.custom-data-table) {
  background-color: white !important;
  border-radius: 8px !important;
}

:deep(.custom-data-table th) {
  background: linear-gradient(to right, #f5f7fa, #e4e7f0) !important;
  color: #37474f !important;
  font-weight: 600 !important;
  white-space: nowrap !important;
  padding: 12px 16px !important;
  font-size: 0.875rem !important;
  letter-spacing: 0.3px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
}

:deep(.custom-data-table td) {
  padding: 12px 16px !important;
  transition: background-color 0.2s ease !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
  font-size: 0.875rem !important;
}

:deep(.custom-data-table tbody tr:hover td) {
  background-color: rgba(25, 118, 210, 0.05) !important;
}

/* สไตล์รูปภาพอุปกรณ์ */
.reader-image-container {
  padding: 8px;
  position: relative;
}

.reader-image {
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background-color: #f9f9f9;
  overflow: hidden;
  cursor: pointer;
}

.reader-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* สไตล์สำหรับ Chip แสดงสถานะ */
.status-chip {
  min-width: 80px;
  font-weight: 600 !important;
  letter-spacing: 0.3px !important;
  border-radius: 50px !important;
  padding: 0 12px !important;
}

/* สไตล์สำหรับรายละเอียดอุปกรณ์ */
.device-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.device-info-item {
  display: flex;
  align-items: center;
}

.device-info-label {
  font-weight: 500;
  color: #546e7a;
  margin-right: 4px;
  white-space: nowrap;
}

.device-info-value {
  color: #37474f;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* สไตล์ปุ่มแผนภาพการติดตั้ง */
.installation-btn {
  position: relative;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 5px rgba(244, 67, 54, 0.2) !important;
}

.installation-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3) !important;
}

.pulse-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

/* สไตล์สำหรับรายละเอียดตำแหน่ง */
.location-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.location-info-row {
  display: flex;
  align-items: center;
}

.location-info-label {
  font-weight: 500;
  color: #546e7a;
  margin-right: 4px;
  white-space: nowrap;
}

.location-info-value {
  color: #37474f;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* สไตล์ปุ่มแก้ไข/ลบ */
.action-button {
  transition: all 0.3s ease !important;
  opacity: 0.8;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
}

.action-button:hover {
  transform: translateY(-2px);
  opacity: 1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

/* สไตล์สำหรับข้อความเมื่อไม่มีข้อมูล */
.empty-state {
  min-height: 300px;
  background-color: #fafafa;
  border-radius: 8px;
  text-align: center;
}

/* แต่งส่วนแสดงผลการแบ่งหน้า */
:deep(.v-data-table-footer) {
  background-color: #f9fafc;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 8px 16px !important;
}

:deep(.v-data-table-footer__pagination) {
  margin-left: auto !important;
}

:deep(.v-data-table-footer__items-per-page) {
  margin-right: 24px !important;
}

:deep(.v-data-table-footer__items-per-page-text) {
  color: #546e7a !important;
  font-size: 0.875rem !important;
}

:deep(.v-data-table-footer__items-per-page .v-select__selection) {
  color: #1976d2 !important;
  font-weight: 500 !important;
}

:deep(.v-data-table-footer__info) {
  color: #546e7a !important;
  font-size: 0.875rem !important;
}

:deep(.v-pagination__item) {
  background-color: transparent !important;
  color: #546e7a !important;
  font-weight: 500 !important;
}

:deep(.v-pagination__item--active) {
  background-color: #1976d2 !important;
  color: white !important;
}

/* สไตล์สำหรับ dialog */
.dialog-card {
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  color: white;
  padding: 16px 24px !important;
  font-size: 1.2rem;
  font-weight: 500;
}

.dialog-actions {
  padding: 16px 24px;
  background-color: #f5f7fa;
}

.section-title {
  font-size: 1rem;
  font-weight: 500;
  color: #37474f;
  display: flex;
  align-items: center;
  padding: 8px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.section-icon {
  color: #1976d2;
  margin-right: 8px;
}

.input-field :deep(.v-field__field) {
  min-height: 44px;
}

.input-field :deep(.v-field) {
  border-radius: 8px;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.input-field:hover :deep(.v-field) {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.coordinate-field :deep(.v-field) {
  background-color: #f5f7fa;
}

.cancel-btn,
.submit-btn {
  min-width: 120px;
  height: 40px;
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: 0.3px;
}

.submit-btn {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
}

.submit-btn:hover:not([disabled]) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

.close-btn {
  margin-right: -8px;
  color: white;
}

.map-preview-area {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.map-preview-area:hover {
  box-shadow: inset 0 1px 8px rgba(0, 0, 0, 0.1);
}

.cursor-pointer {
  cursor: pointer;
}

.no-map-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9e9e9e;
}

.marker-pulse {
  animation: pulse 2s infinite;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.3));
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

/* <!------------------------------ Import Dialog -------------------------------------> */
/* สไตล์สำหรับ Import Dialog */
.import-dialog :deep(.v-card) {
  border-radius: 12px;
  overflow: hidden;
}

.import-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  padding: 16px 20px !important;
  font-weight: 600;
  font-size: 1.2rem;
  color: #37474f;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.import-content {
  background-color: #fcfcfc;
}

.alert-custom {
  border-radius: 8px;
  font-weight: 500;
}

.template-section,
.import-section {
  border: 1px dashed rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.template-section:hover,
.import-section:hover {
  border-color: rgba(25, 118, 210, 0.4);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.download-btn {
  font-weight: 500;
  letter-spacing: 0.3px;
  border-radius: 6px;
  text-transform: none;
  transition: all 0.3s ease;
}

.download-btn:hover {
  background-color: rgba(25, 118, 210, 0.1);
  transform: translateY(-2px);
}

.file-selection-area {
  background-color: white;
  border-radius: 8px;
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.select-file-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.3px;
  border-radius: 6px;
  height: 40px;
}

.selected-file-info {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.cancel-btn,
.import-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.3px;
  border-radius: 6px;
  min-width: 100px;
  height: 40px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.import-btn:not(:disabled) {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.import-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* <!------------------------------ Details Dialog -------------------------------------> */
/* สไตล์สำหรับ Details Dialog */
.details-dialog :deep(.v-card) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15) !important;
}

.details-header {
  background: linear-gradient(to right, #1976d2, #2196f3);
  color: white;
  padding: 16px !important;
  line-height: 1.5;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #1976d2;
  border-left: 3px solid #1976d2;
  padding-left: 12px;
  display: flex;
  align-items: center;
}

.device-info-card,
.history-card {
  border-radius: 8px !important;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.device-info-card:hover,
.history-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  transform: translateY(-2px);
}

.info-label {
  font-weight: 500;
  color: #546e7a;
  background-color: rgba(245, 245, 245, 0.5);
  padding: 12px 16px !important;
  white-space: nowrap;
}

.info-value {
  color: #37474f;
  padding: 12px 16px !important;
}

.map-preview-area {
  border-radius: 8px !important;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.map-preview-area:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.7;
}

.status-chip {
  font-weight: 500;
  font-size: 0.75rem;
  min-width: 85px;
  justify-content: center;
}

.datetime-column {
  font-family: "Roboto Mono", monospace;
  color: #546e7a;
  font-size: 0.85rem;
}

.notes-column {
  font-style: italic;
  color: #607d8b;
}

/* สไตล์สำหรับตาราง History */
.history-table :deep(thead th) {
  background-color: #e3f2fd !important;
  color: #1976d2 !important;
  font-weight: 500 !important;
  text-transform: none !important;
  font-size: 0.875rem !important;
}

.history-table :deep(tbody tr:hover) {
  background-color: rgba(33, 150, 243, 0.05) !important;
}

.details-close-btn {
  border-radius: 6px;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.3px;
  padding: 0 20px;
  height: 38px;
  transition: all 0.2s ease;
}

.details-close-btn:hover {
  background-color: rgba(25, 118, 210, 0.05);
  transform: translateY(-1px);
}

/* <!------------------------------ Delete Confirm Dialog -------------------------------------> */
/* สไตล์สำหรับ Delete Confirm Dialog */
.delete-confirm-dialog :deep(.v-card) {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.dialog-header {
  background-color: #f5f5f5;
  padding: 16px 20px !important;
  font-weight: 500;
  color: #fcf5f5;
  font-size: 1.1rem;
}

.confirm-message {
  font-size: 1rem;
  color: #424242;
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto;
}

.device-info-preview {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin: 0 auto;
  max-width: 300px;
  text-align: center;
  border: 1px solid #e0e0e0;
}

.device-name {
  font-weight: 500;
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 4px;
}

.device-serial {
  color: #757575;
  margin-bottom: 8px;
}

.device-icon {
  opacity: 0.7;
}

.cancel-btn {
  font-weight: 500;
  letter-spacing: 0.3px;
  text-transform: none;
  font-size: 0.9rem;
}

.delete-btn {
  font-weight: 500;
  letter-spacing: 0.3px;
  text-transform: none;
  font-size: 0.9rem;
  box-shadow: 0 3px 5px rgba(244, 67, 54, 0.3) !important;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  box-shadow: 0 5px 10px rgba(244, 67, 54, 0.4) !important;
  transform: translateY(-1px);
}
</style>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/axiostoastapi.js";
import HeaderCommon from "@/components/HeaderCommon.vue";
import {
  maxLength,
  rfidNumberRule,
  requiredRule,
  macAddressRule,
  requiredIpAddressRule,
  positiveNumberRule,
  requiredCoordinateRule,
} from "@/utils/validationRules";
import { getReaderRoleColor } from "@/constants/organizationHierarchy";
import readerIcon from "@/assets/icons/READER.png";
import { showSuccess, showError, showWarning } from "@/utils/snackbar";

const router = useRouter();
const emit = defineEmits(["refresh"]);
const selectedRoleColor = computed(() =>
  getReaderRoleColor(formData.value.role)
);
// Add these refs
const form = ref(null);
const valid = ref(false);
const { t, locale } = useI18n();
// Table state
const devices = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const defaultItemsPerPageOptions = [5, 10, 25, 50, 100];
const itemsPerPageText = ref(t("items_per_page"));

// Location hierarchy selections
const selectedOrganization = ref(null);
const selectedArmory = ref(null);
const selectedRoom = ref(null);
const selectedZone = ref(null);
const selectedBuilding = ref(null);
const selectedFloor = ref(null);
// Search filters
const searchText = ref("");
const startDate = ref("");
const endDate = ref("");
const locations = ref([]);

const selectedStatus = ref(null);
const statuses = ref([
  { value: "ONLINE", title: "Online" },
  { value: "OFFLINE", title: "Offline" },
  { value: "MAINTENANCE", title: "Maintenance" },
]);

// ฟังก์ชันกำหนดสีของ Chip แสดงสถานะ
const getAlertChipColor = (alertType) => {
  switch (alertType) {
    case t("device_connected"):
      return "success";
    case t("device_disconnected"):
      return "error";
    case t("device_maintenance"):
      return "warning";
    default:
      return "grey";
  }
};

// Dialog states
const dialogs = ref({
  installation: false,
  add: false,
  import: false,
  details: false,
  confirmDelete: false,
  mode: "add", // Will be either 'add' or 'edit'
  deleteItem: null,
});
const getDialogMode = () => {
  console.log("Current dialogs state:", dialogs.value); // Debug log

  if (dialogs.value.details === true) {
    console.log("Detected mode: details");
    return "details"; // If details dialog is open, prioritize it
  }

  if (dialogs.value.add === true) {
    if (dialogs.value.mode === "edit") {
      return "edit";
    } else if (dialogs.value.mode === "add") {
      return "add";
    }
  }

  if (dialogs.value.installation === true) {
    console.log("Detected mode: installation");
    return "installation";
  }

  if (dialogs.value.import === true) {
    console.log("Detected mode: import");
    return "import";
  }

  if (dialogs.value.confirmDelete === true) {
    console.log("Detected mode: confirmDelete");
    return "confirmDelete";
  }

  console.warn("Unknown dialog mode detected!");
  return "unknown";
};

// สร้าง function computed สำหรับตรวจสอบว่าตัวกรองถูกเลือกจาก Dashboard หรือไม่
const isFilterFromDashboard = computed(() => {
  return !!router.currentRoute.value.query.status;
});

// คำนวณรายการสถานะสำหรับตัวกรอง - ตัวอย่าง, ปรับตามความเหมาะสม
// const statuses = computed(() => [
//   { value: "ONLINE", title: t("device_connected") || "Online" },
//   { value: "OFFLINE", title: t("device_disconnected") || "Offline" },
//   { value: "MAINTENANCE", title: t("device_maintenance") || "Maintenance" },
// ]);

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
    showSuccess(
      t("filter_applied_automatically") ||
        `กรองข้อมูลสถานะ ${status} โดยอัตโนมัติ`
    );

    // เรียกค้นหาทันทีหลังจากตั้งค่าตัวกรอง
    await handleSearch();
  }

  // โค้ดอื่นๆ ที่ต้องทำเมื่อโหลดหน้า
  await fetchReaders();
  // เรียกฟังก์ชันอื่นๆ ที่จำเป็น
});

// Table options
const tableOptions = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  sortDesc: false,
});

// Import Dialog
const selectedFile = ref(null);
const selectedFileName = ref("");
const fileInput = ref(null);
const downloadTemplate = () => {
  const basePath = import.meta.env.VITE_APP_BASE_PATH || "";
  const templateUrl = `${basePath}/templates/excel/template_readers_form.xlsx`;
  window.open(templateUrl, "_blank");
};

// Location (Organization) for Search
// Almost identical to approach in Reader Add Dialog
// 1. OnMounted trigger to fetch 6levels and store entire organization in const organizationHierarchy = ref([])
//    organizationHierarchy ready for use.
// 2. Handle @update:model-value="handleArmoryChange" --> separated from @update in dialog
// 3. Update :items="armoryOptions" --> separated from @update in dialog
// 4. Pass the selected item to be part of Search payload to fetch Reader.
// 5. Populate fetched reader to table.

const searchData = ref({
  searchText: "",
  startDate: null,
  endDate: null,
  readerStatus: null,

  // Hierarchy fields (Organization → Armory → Building → Floor → Zone → Room)
  organizationId: null, // Level 1
  armoryId: null, // Level 2
  buildingId: null, // Level 3
  floorId: null, // Level 4
  zoneId: null, // Level 5
  roomId: null, // Level 6
});

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

const exportData = async (format) => {
  try {
    // Implement export functionality based on format
    console.log(`Export to ${format} format`);
  } catch (error) {
    showError(t("export_failed"));
  }
};

const importFile = async () => {
  if (!selectedFile.value) return;
  if (!isFileValid(selectedFile.value)) {
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    await api.post("/api/rfid_readers/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    dialogs.value.import = false;
    selectedFile.value = null;
    selectedFileName.value = "";
    showSuccess(t("file_saved_successfully"));
  } catch (error) {
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
  { title: t("image"), key: "image", sortable: false, align: "center" },
  { title: t("device_status"), key: "status", sortable: true, align: "center" },
  { title: t("device_info"), key: "deviceInfo", sortable: false },
  {
    title: t("installation_diagram"),
    key: "installationDiagram",
    sortable: false,
    align: "center",
  },
  { title: t("installation_point_details"), key: "location", sortable: false },
  {
    title: t("column_actions"),
    key: "actions",
    sortable: false,
    align: "center",
  },
]);

const showImportDialog = () => {
  dialogs.value.import = true;
  // close others
};

// Fetch data from API
const fetchAllDevices = async () => {
  console.log("Fetching all devices...");
  loading.value = true;

  try {
    const params = {
      page: tableOptions.value.page - 1,
      itemsPerPage:
        tableOptions.value.itemsPerPage === "All"
          ? -1
          : tableOptions.value.itemsPerPage,
      sortBy: tableOptions.value.sortBy || "",
      sortDesc: tableOptions.value.sortDesc,
      searchText: searchData.value.searchText || "",
      organizationId: searchData.value.organizationId || null, // Use correct backend parameter
      armoryId: searchData.value.armoryId || null,
      buildingId: searchData.value.buildingId || null,
      floorId: searchData.value.floorId || null,
      zoneId: searchData.value.zoneId || null,
      roomId: searchData.value.roomId || null,
      deviceStatus: searchData.value.readerStatus || null,
    };

    console.log(" API Request Params:", params);

    const response = await api.get("/api/rfid_readers/all", { params });

    console.log(" API GET ALL READERS Response:", response.data);

    devices.value = response.data.content;
    totalRecords.value = response.data.totalElements;
  } catch (error) {
    console.error(" API Error fetching devices:", error);
  } finally {
    loading.value = false;
  }
};
// Add this method to your script
const getTranslation = (hierarchyTranslations, level) => {
  if (!hierarchyTranslations?.[level]) return "-";

  // Use locale to determine which language to display
  return locale.value === "th"
    ? hierarchyTranslations[level].th || hierarchyTranslations[level].en || "-"
    : hierarchyTranslations[level].en || hierarchyTranslations[level].th || "-";
};
// Helper functions
const getStatusColor = (status) => {
  const colors = {
    ONLINE: "success",
    OFFLINE: "error",
    MAINTENANCE: "warning",
  };
  return colors[status] || "grey";
};
// Event handlers
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
  fetchAllDevices();
};
const clearSearch = () => {
  console.log("Clearing search filters");

  // Reset all search fields
  searchData.value = {
    searchText: "",
    startDate: null,
    endDate: null,
    readerStatus: null,

    // Hierarchy fields
    organizationId: null, // Level 1
    armoryId: null, // Level 2
    buildingId: null, // Level 3
    floorId: null, // Level 4
    zoneId: null, // Level 5
    roomId: null, // Level 6
  };

  // Also reset selectedStatus since it's bound to a separate v-select
  selectedStatus.value = null;

  // Reset to first page and default items per page
  tableOptions.value.page = 1;

  // Show feedback to user
  showSuccess(t("search_cleared"));

  // Fetch devices with cleared filters
  fetchAllDevices();
};

const handleSearch = () => {
  // Update readerStatus from selectedStatus before searching
  searchData.value.readerStatus = selectedStatus.value;
  tableOptions.value.page = 1;
  fetchAllDevices();
};

const editDevice = async (item) => {
  try {
    dialogs.value.details = false; // Close other dialogs
    dialogs.value.add = true; // Set before async calls to prevent race conditions
    dialogs.value.mode = "edit";

    console.log("A. Edit device with readerId:", item.readerId);
    console.log("MODE: ", dialogs.value.mode);

    // Populate formData with the existing device data
    formData.value = {
      rfidNo: "",
      supplyNumber: item.supplyNumber,
      deviceType: "Gateway",
      modelNumber: item.supplyModel,
      readerSerialNumber: item.readerSerialNumber,
      macAddress: item.macAddress || "",
      firmwareVersion: item.firmwareVersion || "",
      quantity: 1, // Adjust based on your data
      unit: unitOptions.value[0], // Use the first (and only) option as default
      ipAddress: item.ipAddress,
      role: item.deviceRole,
      readerName: item.supplyName,
      note: item.notes || "",
      organizationId: findOrganizationIdByTranslation(
        item.hierarchyTranslations?.ORGANIZATION?.en
      ),
      armoryId: findIdByTranslationAndType(
        item.hierarchyTranslations?.ARMORY?.en,
        "ARMORY"
      ),
      buildingId: findIdByTranslationAndType(
        item.hierarchyTranslations?.BUILDING?.en,
        "BUILDING"
      ),
      floorId: findIdByTranslationAndType(
        item.hierarchyTranslations?.FLOOR?.en,
        "FLOOR"
      ),
      zoneId: findIdByTranslationAndType(
        item.hierarchyTranslations?.ZONE?.en,
        "ZONE"
      ),
      roomId: findIdByTranslationAndType(
        item.hierarchyTranslations?.ROOM?.en,
        "ROOM"
      ),
      latitude: item.latitude || null,
      longitude: item.longitude || null,
      deviceStatus: "", // no selector but keep it in Frontend for flexible DTO
    };

    // Store readerId internally (but not visible in the form)
    formData.value._internalReaderId = item.readerId; // Use a hidden internal key

    // Fetch Map for the given organization
    const organizationId = formData.value.organizationId;
    if (organizationId) {
      console.log("B. Fetch Image By Root Organization ID: ", organizationId);
      await fetchImageByOrganizationId(organizationId);
    }

    // Fetch Floor Plan for the lowest hierarchy level
    const lowestLevelId = findLowestLevelId(item);
    if (lowestLevelId) {
      console.log(
        "C. Fetch DetailsFloorPlan (Coordinates) Lowest Level ID:",
        lowestLevelId
      );
      await fetchDetailsFloorPlan(item, lowestLevelId);
      console.log(
        "D. fetchImageOrganizationLevelIdPopulatedOnFloorPlan lowest level ID: ",
        lowestLevelId
      );
      await fetchImageOrganizationLevelIdPopulatedOnFloorPlan(lowestLevelId);
    }

    console.log(
      "E. Fetch Reader Map Coordinates of Reader ID: ",
      item.readerId
    );
    // Fetch and set `mapCoordinates`
    await fetchMapCoordinatesForAddEdit(item.readerId);

    console.log("F.Populated formData for editing:", formData.value);
  } catch (error) {
    console.error("Error while editing device:", error);

    // Clean up any resources
    if (selectedMapPicture.value?.imagePath) {
      URL.revokeObjectURL(selectedMapPicture.value.imagePath);
    }
    if (mapPreview.value) {
      URL.revokeObjectURL(mapPreview.value);
    }
    if (selectedFloorPlan.value?.imagePath) {
      URL.revokeObjectURL(selectedFloorPlan.value.imagePath);
    }
    if (floorPlanPreview.value) {
      URL.revokeObjectURL(floorPlanPreview.value);
    }

    // Reset coordinates
    mapCoordinates.value = null;
    floorPlanCoordinates.value = null;

    // Reset form to prevent partial data
    formData.value = initialFormData();

    // Show error message
    showError(t("error_loading_device_details"));

    // Reset loading state
    loading.value = false;
  }
};

const deleteDevice = (item) => {
  // close other dialogs
  console.log("Delete device:", item);
  dialogs.value.confirmDelete = true; // Open the confirmation dialog
  dialogs.value.deleteItem = item; // Store the item to be deleted
};

const confirmDeleteDevice = async () => {
  const item = dialogs.value.deleteItem;
  try {
    loading.value = true;

    //await api.delete(`/api/rfid_readers/${item.readerId}`);
    await api.delete(`/api/rfid_readers/with-supply/${item.readerId}`);

    showSuccess(t("device_deleted_successfully"));

    // Refresh the device list
    await fetchAllDevices();
  } catch (error) {
    console.error("Error deleting device:", error);

    const backendMessage =
      error?.response?.data?.message || error?.response?.data?.error;

    if (backendMessage) {
      showError(`${t("error_deleting_device")}: ${backendMessage}`);
    } else {
      showError(t("error_deleting_device"));
    }
  } finally {
    loading.value = false;
    dialogs.value.confirmDelete = false; // Close the confirmation dialog
  }
};

// Add Device Dialog ------------
const showAddDialog = () => {
  dialogs.value.details = false;
  console.log("Add device:", dialogs.value.add);

  dialogs.value.mode = "add";

  console.log("MODE: ", dialogs.value.mode);

  // Clear form data
  formData.value = initialFormData();

  // Clear map URLs to prevent memory leaks
  if (selectedMapPicture.value?.imagePath) {
    URL.revokeObjectURL(selectedMapPicture.value.imagePath);
  }
  if (mapPreview.value) {
    URL.revokeObjectURL(mapPreview.value);
  }
  // Clear map and marker states
  selectedMapPicture.value = null;
  mapPreview.value = null;
  mapCoordinates.value = null;

  // clear floor plan area
  if (selectedFloorPlan.value?.imagePath) {
    URL.revokeObjectURL(selectedFloorPlan.value.imagePath);
  }
  if (floorPlanPreview.value) {
    URL.revokeObjectURL(floorPlanPreview.value);
  }

  selectedFloorPlan.value = null;
  floorPlanPreview.value = null;
  floorPlanCoordinates.value = null;

  // Show dialog
  dialogs.value.add = true;
};

const formData = ref({
  rfidNo: "",
  supplyNumber: "",
  deviceType: "",
  modelNumber: "",
  readerSerialNumber: "",
  macAddress: "",
  firmwareVersion: "",
  quantity: 1,
  unit: "",
  ipAddress: "",
  role: "",
  readerName: "",
  note: "",
  // Hierarchy fields
  organizationId: null, // Level 1
  armoryId: null, // Level 2
  buildingId: null, // Level 3
  floorId: null, // Level 4
  zoneId: null, // Level 5
  roomId: null, // Level 6
  // Location coordinates
  latitude: null,
  longitude: null,
  deviceStatus: "", // no selector but keep it in Frontend for flexible DTO
});

const initialFormData = () => ({
  rfidNo: "",
  supplyNumber: "",
  deviceType: "Gateway",
  modelNumber: "",
  readerSerialNumber: "",
  macAddress: "",
  firmwareVersion: "",
  quantity: 1,
  unit: unitOptions.value[0], // Use the first (and only) option as default
  ipAddress: "",
  role: "",
  readerName: "",
  note: "",
  // Hierarchy fields
  organizationId: null,
  armoryId: null,
  buildingId: null,
  floorId: null,
  zoneId: null,
  roomId: null,
  // Location coordinates
  latitude: null,
  longitude: null,
  deviceStatus: "",
});

// Options for unit select
const unitOptions = ref(["Unit"]);
const roleOptions = ref(["GATE_MONITOR", "ROOM_MONITOR", "PATH_MONITOR"]);
const organizationHierarchy = ref([]);

const fetchOrganizationHierarchy = async () => {
  try {
    const response = await api.get("/api/organization-hierarchies/6levels");
    // Log full response object for detailed information
    console.log("Full response:", response);

    // Log response data only
    console.log("Fetch full organization:", response.data);

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

const organizationOptions = computed(() => {
  return organizationHierarchy.value
    .filter((org) => org.levelType === "ORGANIZATION")
    .map((org) => ({
      value: org.id,
      title: locale.value === "th" ? org.translations.th : org.translations.en,
    }));
});
const armoryOptions = computed(() => {
  if (!formData.value.organizationId) return [];
  return findChildren(formData.value.organizationId, "ARMORY").map(
    (armory) => ({
      value: armory.id,
      title:
        locale.value === "th" ? armory.translations.th : armory.translations.en,
    })
  );
});
const buildingOptions = computed(() => {
  const parentId = formData.value.armoryId || formData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "BUILDING").map((building) => ({
    value: building.id,
    title:
      locale.value === "th"
        ? building.translations.th
        : building.translations.en,
  }));
});
const floorOptions = computed(() => {
  const parentId =
    formData.value.buildingId ||
    formData.value.armoryId ||
    formData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "FLOOR").map((floor) => ({
    value: floor.id,
    title:
      locale.value === "th" ? floor.translations.th : floor.translations.en,
  }));
});
const zoneOptions = computed(() => {
  const parentId =
    formData.value.floorId ||
    formData.value.buildingId ||
    formData.value.armoryId ||
    formData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "ZONE").map((zone) => ({
    value: zone.id,
    title: locale.value === "th" ? zone.translations.th : zone.translations.en,
  }));
});
const roomOptions = computed(() => {
  const parentId =
    formData.value.zoneId ||
    formData.value.floorId ||
    formData.value.buildingId ||
    formData.value.armoryId ||
    formData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "ROOM").map((room) => ({
    value: room.id,
    title: locale.value === "th" ? room.translations.th : room.translations.en,
  }));
});
const handleOrganizationChange = async (newValue, source) => {
  console.log(`Organization changed in: ${source}, New Value: ${newValue}`);

  if (source === "search") {
    console.log(`Searching for ${newValue}`);
    // Update Search Filters
    searchData.value.armoryId = null;
    searchData.value.buildingId = null;
    searchData.value.floorId = null;
    searchData.value.zoneId = null;
    searchData.value.roomId = null;
  } else if (source === "dialog") {
    console.log(`Dialog for ${newValue}`);

    // 1. Always reset coordinates first - this prevents marker-related errors
    mapCoordinates.value = null;
    floorPlanCoordinates.value = null;

    // 2. Reset child selections
    formData.value.armoryId = null;
    formData.value.buildingId = null;
    formData.value.floorId = null;
    formData.value.zoneId = null;
    formData.value.roomId = null;

    // 3. Clean up old image resources
    if (mapPreview.value) {
      URL.revokeObjectURL(mapPreview.value);
      mapPreview.value = null;
    }
    if (floorPlanPreview.value) {
      URL.revokeObjectURL(floorPlanPreview.value);
      floorPlanPreview.value = null;
    }
    selectedMapPicture.value = null;
    selectedFloorPlan.value = null;

    // 4. Update coordinates from hierarchy data
    updateCoordinates(newValue);

    // 5. Fetch new images if organization is selected
    if (newValue) {
      // These functions have their own error handling
      await fetchImageByOrganizationId(newValue);
    }
  }
};
const handleArmoryChange = async (newValue, source) => {
  console.log(`Armory changed in: ${source}, New Value: ${newValue}`);
  if (source === "search") {
    searchData.value.buildingId = null;
    searchData.value.floorId = null;
    searchData.value.zoneId = null;
    searchData.value.roomId = null;
  } else if (source === "dialog") {
    // Reset child selections
    formData.value.buildingId = null;
    formData.value.floorId = null;
    formData.value.zoneId = null;
    formData.value.roomId = null;
    // Reset floor plan coordinates
    floorPlanCoordinates.value = null;
    // Clean up floor plan image
    if (floorPlanPreview.value) {
      URL.revokeObjectURL(floorPlanPreview.value);
      floorPlanPreview.value = null;
    }
    selectedFloorPlan.value = null;
    // Update coordinates from hierarchy
    updateCoordinates(newValue);
    // Fetch new floor plan if armory is selected
    if (newValue) {
      await fetchImageOrganizationLevelIdPopulatedOnFloorPlan(newValue);
    }
  }
};
const handleBuildingChange = async (newValue, source) => {
  console.log(`Building changed in: ${source}, New Value: ${newValue}`);
  if (source === "search") {
    searchData.value.floorId = null;
    searchData.value.zoneId = null;
    searchData.value.roomId = null;
  } else if (source === "dialog") {
    // Reset child selections
    formData.value.floorId = null;
    formData.value.zoneId = null;
    formData.value.roomId = null;
    // Clean up floor plan image
    if (floorPlanPreview.value) {
      URL.revokeObjectURL(floorPlanPreview.value);
      floorPlanPreview.value = null;
    }
    selectedFloorPlan.value = null;
    // Update coordinates from hierarchy
    updateCoordinates(newValue);
    // Fetch new floor plan if building is selected
    if (newValue) {
      await fetchImageOrganizationLevelIdPopulatedOnFloorPlan(newValue);
    }
  }
};
const handleFloorChange = async (newValue, source) => {
  if (source === "search") {
    searchData.value.zoneId = null;
    searchData.value.roomId = null;
  } else if (source === "dialog") {
    // Reset child selections
    formData.value.zoneId = null;
    formData.value.roomId = null;
    // Reset floor plan coordinates
    floorPlanCoordinates.value = null;
    // Clean up floor plan image
    if (floorPlanPreview.value) {
      URL.revokeObjectURL(floorPlanPreview.value);
      floorPlanPreview.value = null;
    }
    selectedFloorPlan.value = null;
    // Update coordinates from hierarchy
    updateCoordinates(newValue);
    if (newValue) {
      await fetchImageOrganizationLevelIdPopulatedOnFloorPlan(newValue);
    }
  }
};

const handleZoneChange = (newValue, source) => {
  if (source === "search") {
    searchData.value.roomId = null;
  } else if (source === "dialog") {
    // Reset child selections
    formData.value.roomId = null;
    // Update coordinates from hierarchy
    updateCoordinates(newValue);
  }
};
const handleRoomChange = (newValue, source) => {
  if (source === "search") {
    // No child selections to reset
  } else if (source === "dialog") {
    // Update coordinates from hierarchy
    updateCoordinates(newValue);
  }
};

const updateCoordinates = (parentId) => {
  if (!parentId) return;
  // Find the selected item in the hierarchy
  const findItem = (nodes) => {
    for (const node of nodes) {
      if (node.id === parentId) return node;
      if (node.children?.length) {
        const found = findItem(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  const selectedItem = findItem(organizationHierarchy.value);
  // Update latitude & longitude if available
  if (selectedItem) {
    formData.value.latitude = selectedItem.latitude ?? null;
    formData.value.longitude = selectedItem.longitude ?? null;
  }
};

// Add Dialog Floor Plan and Map areas --------------------------------

// Refs for Floor Plan
const selectedFloorPlan = ref(null);
const floorPlanPreview = ref(null);
const floorPlanCoordinates = ref(null);
const floorPlanFile = ref(null);

// Refs for Map
const selectedMapPicture = ref(null);
const mapPreview = ref(null);
const mapCoordinates = ref(null);

// Floor Plan Functions
const handleFloorPlanClick = (event) => {
  const rect = event.target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  floorPlanCoordinates.value = { x, y };
};

const getFloorPlanMarkerStyle = () => {
  if (!floorPlanCoordinates.value) return {};
  return {
    left: `${floorPlanCoordinates.value.x}%`,
    top: `${floorPlanCoordinates.value.y}%`,
    transform: "translate(-50%, -50%)",
    zIndex: 1,
  };
};

const adjustFloorPlanMarkerPosition = () => {
  if (
    selectedFloorPlan.value &&
    selectedFloorPlan.value.xCoordinate &&
    selectedFloorPlan.value.yCoordinate
  ) {
    floorPlanCoordinates.value = {
      x: selectedFloorPlan.value.xCoordinate,
      y: selectedFloorPlan.value.yCoordinate,
    };
  }
};

const handleMapClick = (event) => {
  console.log("Handle Map Clicked: ", event);
  const img = event.target;
  const rect = img.getBoundingClientRect();

  // Get natural dimensions of the original image
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  console.log(
    "handleMapClick Natural width:height ",
    naturalWidth,
    naturalHeight
  );
  // Get displayed dimensions of the image (after scaling with "contain")
  const displayWidth = rect.width;
  const displayHeight = rect.height;

  console.log(
    "handleMapClick Display width:height ",
    displayWidth,
    displayHeight
  );
  // Compute aspect ratios
  const imgAspectRatio = naturalWidth / naturalHeight;
  const displayAspectRatio = displayWidth / displayHeight;

  console.log("handleMapClick Image AspectRatio:", imgAspectRatio);
  console.log("handleMapClick Display AspectRatio:", displayAspectRatio);

  let scaledWidth, scaledHeight, offsetX, offsetY;

  if (imgAspectRatio > displayAspectRatio) {
    // Image is wider than container: Letterboxing on top and bottom
    scaledWidth = displayWidth;
    scaledHeight = displayWidth / imgAspectRatio;
    offsetX = 0;
    offsetY = (displayHeight - scaledHeight) / 2; // Vertical offset
  } else {
    // Image is taller than container: Letterboxing on left and right
    scaledWidth = displayHeight * imgAspectRatio;
    scaledHeight = displayHeight;
    offsetX = (displayWidth - scaledWidth) / 2; // Horizontal offset
    offsetY = 0;
  }

  // Compute click coordinates relative to the scaled image area (excluding letterboxing)
  const relativeX = (event.clientX - rect.left - offsetX) / scaledWidth;
  const relativeY = (event.clientY - rect.top - offsetY) / scaledHeight;

  // Convert to original image coordinates
  const x = relativeX * naturalWidth;
  const y = relativeY * naturalHeight;

  // Store in reactive variable
  if (relativeX >= 0 && relativeX <= 1 && relativeY >= 0 && relativeY <= 1) {
    mapCoordinates.value = { x, y };
  }
  console.log(
    "handleMapClick set mapCoordinates: ",
    mapCoordinates.value.x,
    mapCoordinates.value.y
  );
};

// For Add/Edit Dialog to plot a marker on Root Map
const getMapMarkerStyle = () => {
  console.log(
    "Get MapMarkerStyle called:",
    mapCoordinates.value.x,
    mapCoordinates.value.y
  );
  if (!mapCoordinates.value) return {};

  // Use class selector instead of ref
  const img = document.querySelector(".org-map-container img");
  if (!img || !img.complete || img.naturalWidth === 0) {
    console.warn(
      "Main Organization Map image not fully loaded yet, skipping marker positioning."
    );
    return {};
  }

  const rect = img.getBoundingClientRect();
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  console.log("getMapMarkerStyle Mode:", dialogs.value.mode);
  console.log(
    "getMapMarkerStyle Natural width:height",
    naturalWidth,
    naturalHeight
  );
  console.log(
    "getMapMarkerStyle Display width:height",
    rect.width,
    rect.height
  );

  let scaledWidth, scaledHeight, offsetX, offsetY;
  if (naturalWidth / naturalHeight > rect.width / rect.height) {
    scaledWidth = rect.width;
    scaledHeight = rect.width / (naturalWidth / naturalHeight);
    offsetX = 0;
    offsetY = (rect.height - scaledHeight) / 2;
  } else {
    scaledWidth = rect.height * (naturalWidth / naturalHeight);
    scaledHeight = rect.height;
    offsetX = (rect.width - scaledWidth) / 2;
    offsetY = 0;
  }

  const left = (mapCoordinates.value.x / naturalWidth) * scaledWidth + offsetX;
  const top = (mapCoordinates.value.y / naturalHeight) * scaledHeight + offsetY;

  console.log("getMapMarkerStyle Marker Position (px):", left, top);
  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: "translate(-50%, -50%)",
    zIndex: 1,
  };
};

// Edit Dialog to plot existing x-y from database
// When Image loaded but have to wait for fully loaded.
const adjustMapMarkerPosition = (retryCount = 0) => {
  // Skip if no coordinates yet (initial state)
  if (!mapCoordinates.value) {
    console.log("No map coordinates set yet, waiting for user input");
    return;
  }

  console.log("Adjusting marker position, attempt:", retryCount);

  // Use class selector instead of ref
  const img = document.querySelector(".org-map-container img");
  if (!img || !img.complete || img.naturalWidth === 0) {
    if (retryCount < 5) {
      console.warn("Main Organization Map image not fully loaded, retrying...");
      setTimeout(() => adjustMapMarkerPosition(retryCount + 1), 200);
    } else {
      console.error("Image failed to load after multiple attempts.");
    }
    return;
  }
  console.log(
    "Main Organization Map image fully loaded, updating marker position..."
  );
  const xPercent = (mapCoordinates.value.x / img.naturalWidth) * 100;
  const yPercent = (mapCoordinates.value.y / img.naturalHeight) * 100;
  mapCoordinates.value = {
    ...mapCoordinates.value,
    xPercent: xPercent,
    yPercent: yPercent,
  };

  console.log("Marker position adjusted:", mapCoordinates.value);
};

// Get Picture by organization id:
const fetchImageByOrganizationId = async (organizationId) => {
  console.log("Fetching image by organizationId:", organizationId);
  const context = getDialogMode();
  console.log(`Detected active dialog: ${context}`);
  try {
    const response = await api.get(
      `/api/organization-maps/org/${organizationId}`,
      {
        responseType: "blob",
      }
    );
    // Convert the binary response to a Blob URL
    const imageUrl = URL.createObjectURL(response.data);

    if (context === "add" || context === "edit") {
      console.log("Updated Add/Edit dialog map preview");
      mapPreview.value = imageUrl;
      selectedMapPicture.value = { imagePath: imageUrl };
    } else if (context === "details") {
      console.log("Updated Details dialog map preview");
      detailsMapPreview.value = imageUrl;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      showWarning(t("no_map_assigned"));
      mapPreview.value = null;
      selectedMapPicture.value = null;
      detailsMapPreview.value = null;
    } else {
      console.error("Error fetching map data:", error);
      showError(t("error_loading_map"));
      mapPreview.value = null;
      selectedMapPicture.value = null;
      detailsMapPreview.value = null;
    }
  }
};

// Get Picture by organization id excepted Organization which populate picture on map area
// This method populated on Floor Plan v-img
const fetchImageOrganizationLevelIdPopulatedOnFloorPlan = async (
  organizationId
) => {
  console.log(
    "Fetching image organization level id populatedOnFloorPlan:",
    organizationId
  );

  const context = getDialogMode();
  console.log(`Detected active dialog: ${context}`);

  try {
    const response = await api.get(
      `/api/organization-maps/org/${organizationId}`,
      {
        responseType: "blob",
      }
    );
    // Convert the binary response to a Blob URL
    const imageUrl = URL.createObjectURL(response.data);

    if (context === "add" || context === "edit") {
      // Update the map preview with the new image
      floorPlanPreview.value = imageUrl;
      selectedFloorPlan.value = {
        imagePath: imageUrl,
      };
      console.log("Updated Add/Edit dialog floor plan");
    } else if (context === "details") {
      // For Details dialog
      detailsFloorPlanPreview.value = imageUrl;
      console.log("Updated Details dialog floor plan");
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      showWarning(t("no_map_assigned"));
      floorPlanPreview.value = null;
      selectedFloorPlan.value = null;
      detailsFloorPlanPreview.value = null;
    } else {
      console.error("Error fetching map data:", error);
      showError(t("error_loading_map"));
      floorPlanPreview.value = null;
      selectedFloorPlan.value = null;
      detailsFloorPlanPreview.value = null;
    }
  }
};

// Also update closeDialog function to ensure cleanup
const closeDialog = () => {
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

  formData.value = initialFormData();
  valid.value = false;
  fetchAllDevices();
};

const handleSubmit = async () => {
  console.log("MODE: ", dialogs.value.mode);

  const isValid = await form.value?.validate();
  if (!isValid) return;
  console.log("Form is valid.");
  try {
    console.log("MODE: ", dialogs.value.mode);

    // Fix empty strings for possibly non-nullable fields
    formData.value.modelNumber = formData.value.modelNumber || "Unknown";
    formData.value.macAddress =
      formData.value.macAddress || "00:00:00:00:00:00";
    formData.value.firmwareVersion = formData.value.firmwareVersion || "N/A";

    // Ensure coordinates are set before creating the payload
    formData.value.coordinates = floorPlanCoordinates.value
      ? {
          xCoordinate: floorPlanCoordinates.value.x,
          yCoordinate: floorPlanCoordinates.value.y,
        }
      : null;

    // Add Root Organization X-Y Coordinate to locate all Readers in main Map
    formData.value.mapCoordinates = mapCoordinates.value
      ? {
          xCoordinate: mapCoordinates.value.x,
          yCoordinate: mapCoordinates.value.y,
        }
      : null;

    // Now create payload AFTER ensuring coordinates exist
    const payload = { ...formData.value };

    if (dialogs.value.mode === "edit") {
      if (!payload._internalReaderId) {
        console.error("Missing reader ID for update");
        showError(t("error_missing_reader_id"));
        closeDialog();
        emit("refresh");
        return;
      }

      const readerId = formData.value._internalReaderId;
      delete payload._internalReaderId;

      console.log("Payload of edit Network:", payload);

      // PUT request for updating existing device
      await api.put(`/api/rfid_readers/${readerId}`, payload);
      showSuccess(t("reader_updated_successfully"));
    } else {
      // POST request for creating a new device
      await api.post("/api/rfid_readers", payload);
      showSuccess(t("reader_added_successfully"));
    }

    closeDialog();
    emit("refresh");
  } catch (error) {
    // Enhanced error logging
    console.error("Error submitting RFID Reader:", {
      error: error.message,
      payload: formData.value,
      coordinates: floorPlanCoordinates.value,
      mapCoordinates: mapCoordinates.value,
      timestamp: new Date().toISOString(),
    });
    showError(t("error_adding_reader"));
  } finally {
    dialogs.value.add = false; // Ensure dialog is closed even on error
  }
};

// Details Dialog ----------------

// 1. Initialize refs properly
const detailsMapPreview = ref(null);
const detailsFloorPlanPreview = ref(null);
const detailsMapCoordinates = ref(null);
const detailsFloorPlanCoordinates = ref(null);
const detailsRoleColor = ref(null);
const selectedDevice = ref(null);
const deviceHistory = ref([]);

// Add pagination state
const historyPage = ref(1);
const historyItemsPerPage = ref(5);

// Add these refs
const totalHistoryItems = ref(0);
const totalHistoryPages = ref(0);

const historyHeaders = computed(() => [
  { title: t("no"), key: "no", align: "start" , sortable: true  },
  { title: t("alert"), key: "alert" , sortable: true },
  { title: t("device"), key: "device" , sortable: true },
  { title: t("date_time"), key: "datetime" , sortable: true },
]);

// Helper function to find organization ID by translation
const findOrganizationIdByTranslation = (orgName) => {
  if (!orgName || !organizationHierarchy.value) return null;

  // Find organization that matches either English or Thai name
  const organization = organizationHierarchy.value.find((org) => {
    return (
      org.translations?.en === orgName ||
      org.translations?.th === orgName ||
      org.translations?.en === orgName.trim() ||
      org.translations?.th === orgName.trim()
    );
  });

  return organization?.id || null;
};

const handleImageIconClick = async (item) => {
  console.log("Image icon clicked item:", item);
  // popup table show list of RFID Tags currently detected by this Reader
};

const handleInstallationClick = async (item) => {
  dialogs.value.add = false;
  dialogs.value.details = true; // Set before API calls to prevent race conditions
  loading.value = true;

  console.log("1.Handle Installation clicked : Original clicked item:", item);

  selectedDevice.value = item;
  loading.value = true;
  // Reset pagination state
  historyPage.value = 1;
  historyItemsPerPage.value = 5; // Reset to default
  totalHistoryItems.value = 0;
  totalHistoryPages.value = 0;
  try {
    // Get organization name from hierarchyTranslations
    const orgName = item.hierarchyTranslations?.ORGANIZATION?.[locale.value];
    const organizationId = findOrganizationIdByTranslation(orgName);

    selectedDevice.value = {
      readerId: item.readerId,
      supplyNumber: item.supplyNumber,
      supplyName: item.supplyName,
      // Organization hierarchy from translations
      organization: getTranslation(item.hierarchyTranslations, "ORGANIZATION"),
      armory: getTranslation(item.hierarchyTranslations, "ARMORY"),
      building: getTranslation(item.hierarchyTranslations, "BUILDING"),
      floor: getTranslation(item.hierarchyTranslations, "FLOOR"),
      zone: getTranslation(item.hierarchyTranslations, "ZONE"),
      room: getTranslation(item.hierarchyTranslations, "ROOM"),
      // Optional fields with default '-'
      partition: item.partition || "-",
      shelf: item.shelf || "-",
      slot: item.slot || "-",
    };

    // Fetch Root Map for the given organization
    if (organizationId) {
      console.log(
        "1.Details Dialog: Fetch Image By Root Organization ID: ",
        organizationId
      );
      await fetchImageByOrganizationId(organizationId);
      console.log(
        "2.Details Dialog: Fetch Reader Map Coordinates of Reader ID: ",
        item.readerId
      );
      await fetchMapCoordinatesForDetails(item.readerId);
    }

    // Get the lowest level id for floor plan image
    const lowestLevelId = findLowestLevelId(item);
    if (lowestLevelId) {
      // Pass both item (for reader coordinates) and levelId (for floor plan image)
      console.log(
        "3.Details Dialog: Fetch DetailsFloorPlan (Coordinates) Lowest Level ID:",
        lowestLevelId
      );
      await fetchDetailsFloorPlan(item, lowestLevelId);
      console.log(
        "4.Details Dialog: fetchImageOrganizationLevelIdPopulatedOnFloorPlan lowest level ID: ",
        lowestLevelId
      );
      await fetchImageOrganizationLevelIdPopulatedOnFloorPlan(lowestLevelId);
    }

    // Set the role color based on the clicked item directly
    console.log("5.Details Dialog: Set Details Reader Role: ", item.deviceRole);
    detailsRoleColor.value = getReaderRoleColor(item.deviceRole);

    console.log("6.Fetch History Reader ID: " + item.readerId);
    // Fetch history only if item.id exists
    await fetchReaderStatusHistory(item.readerId);

    //Open dialog only if everything succeeds
    loading.value = false;
  } catch (error) {
    console.error("Error loading details:", error);
    // Clean up any resources that might have been created
    if (detailsMapPreview.value) {
      URL.revokeObjectURL(detailsMapPreview.value);
      detailsMapPreview.value = null;
    }
    if (detailsFloorPlanPreview.value) {
      URL.revokeObjectURL(detailsFloorPlanPreview.value);
      detailsFloorPlanPreview.value = null;
    }
    // Reset all state variables to ensure clean state
    selectedDevice.value = null;
    detailsMapCoordinates.value = null;
    detailsFloorPlanCoordinates.value = null;
    deviceHistory.value = [];
    detailsRoleColor.value = null;

    showError(t("error_loading_device_details"));
    loading.value = false; // Stop loading if an error occurs
  }
};

const fetchMapCoordinatesForAddEdit = async (readerId) => {
  try {
    const response = await api.get(
      `/api/rfid_readers/x-y-coordinates-level1/${readerId}`
    );
    console.log("Fetched Add/Edit Map Coordinates:", response.data);

    if (response.data) {
      // Store coordinates for Add/Edit Dialog
      mapCoordinates.value = {
        x: response.data.xCoordinate,
        y: response.data.yCoordinate,
      };
      console.log("Add/Edit Coordinates fetched:", mapCoordinates.value);

      // Wait for DOM update before adjusting marker
      await nextTick();

      // Adjust the marker for the Add/Edit dialog
      adjustMapMarkerPosition();
    }
  } catch (error) {
    console.error("Error fetching map coordinates for Add/Edit:", error);
    mapCoordinates.value = null;
  }
};

const fetchMapCoordinatesForDetails = async (readerId) => {
  try {
    const response = await api.get(
      `/api/rfid_readers/x-y-coordinates-level1/${readerId}`
    );

    if (response.data) {
      // Store coordinates for Details Dialog
      detailsMapCoordinates.value = {
        x: response.data.xCoordinate,
        y: response.data.yCoordinate,
      };
      console.log("Details Coordinates fetched:", detailsMapCoordinates.value);

      // Wait for DOM update before adjusting marker
      await nextTick();

      // Adjust the marker for the Details dialog
      await adjustDetailsMapMarker();
    }
  } catch (error) {
    console.error("Error fetching map coordinates for Details:", error);
    detailsMapCoordinates.value = null;
  }
};

// @load="adjustDetailsMapMarker"
const adjustDetailsMapMarker = async () => {
  // Skip if no coordinates yet
  if (!detailsMapCoordinates.value) {
    console.warn("No details map coordinates available yet");
    return;
  }

  //console.log("STARTING DIMENSION CHECK - Original coordinates:", JSON.stringify(detailsMapCoordinates.value));

  // Create a promise that resolves when dimensions are stable
  await new Promise((resolve) => {
    let lastWidth = 0;
    let lastHeight = 0;
    let stableCount = 0;

    const checkDimensions = () => {
      const img = document.querySelector(".org-detail-map-container img");
      if (!img || !img.complete || img.naturalWidth === 0) {
        console.log("Image not ready yet, waiting...");
        setTimeout(checkDimensions, 100);
        return;
      }

      // Log all image properties
      //console.log("IMAGE PROPERTIES:");
      //console.log("- naturalWidth:", img.naturalWidth);
      //console.log("- naturalHeight:", img.naturalHeight);
      //console.log("- complete:", img.complete);
      //console.log("- currentSrc:", img.currentSrc);

      const rect = img.getBoundingClientRect();
      //console.log(`Checking dimensions: ${rect.width}x${rect.height} vs previous ${lastWidth}x${lastHeight}`);

      // Log the full rect object
      //console.log("FULL RECT DETAILS:", {x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left});

      if (
        Math.abs(rect.width - lastWidth) < 2 &&
        Math.abs(rect.height - lastHeight) < 2
      ) {
        // Dimensions are stable
        stableCount++;
        //console.log(`Dimensions stable - count: ${stableCount}/3`);
        if (stableCount >= 3) {
          // Dimensions stable for 3 consecutive checks
          //console.log("DIMENSIONS STABLE AFTER 3 CHECKS");
          resolve();
          return;
        }
      } else {
        // Dimensions changed, reset counter
        stableCount = 0;
        lastWidth = rect.width;
        lastHeight = rect.height;
      }

      // Check again after a delay
      setTimeout(checkDimensions, 100);
    };

    // Start checking
    checkDimensions();
  });

  // By now, dimensions should be stable
  const img = document.querySelector(".org-detail-map-container img");
  if (!img) {
    console.error("Image not found after dimension stabilization!");
    return;
  }

  const rect = img.getBoundingClientRect();
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  // Calculate the position - showing all steps
  const xRatio = rect.width / naturalWidth;
  const yRatio = rect.height / naturalHeight;
  const left = detailsMapCoordinates.value.x * xRatio;
  const top = detailsMapCoordinates.value.y * yRatio;

  // Also calculate using percentage approach for comparison
  const xPercent = (detailsMapCoordinates.value.x / naturalWidth) * 100;
  const yPercent = (detailsMapCoordinates.value.y / naturalHeight) * 100;
  //const leftPercent = (xPercent / 100) * rect.width;
  //const topPercent = (yPercent / 100) * rect.height;

  //console.log("CALCULATION COMPARISON:");
  //console.log("- Direct scaling:", left, top);
  //console.log("- Percentage approach:", leftPercent, topPercent);
  //console.log("- Expected value:", 830, 447);
  //console.log("- Difference from expected:", left - 830, top - 447);

  // Check for any letterboxing (if the image aspect ratio doesn't match container)
  const imgAspectRatio = naturalWidth / naturalHeight;
  const containerAspectRatio = rect.width / rect.height;

  //console.log("ASPECT RATIOS - image:", imgAspectRatio, "container:", containerAspectRatio);

  let offsetX = 0,
    offsetY = 0;
  if (imgAspectRatio > containerAspectRatio) {
    // Image is wider than container (letterboxing on top/bottom)
    const scaledHeight = rect.width / imgAspectRatio;
    offsetY = (rect.height - scaledHeight) / 2;
    //console.log("Letterboxing on top/bottom, offsetY:", offsetY);
  } else if (imgAspectRatio < containerAspectRatio) {
    // Image is taller than container (letterboxing on sides)
    const scaledWidth = rect.height * imgAspectRatio;
    offsetX = (rect.width - scaledWidth) / 2;
    //console.log("Letterboxing on sides, offsetX:", offsetX);
  }

  // Calculate with letterboxing
  const leftWithOffset =
    (detailsMapCoordinates.value.x / naturalWidth) *
      (rect.width - 2 * offsetX) +
    offsetX;
  const topWithOffset =
    (detailsMapCoordinates.value.y / naturalHeight) *
      (rect.height - 2 * offsetY) +
    offsetY;

  //console.log("CALCULATION WITH LETTERBOXING:", leftWithOffset, topWithOffset);

  // Store the pixel coordinates
  detailsMapCoordinates.value = {
    ...detailsMapCoordinates.value,
    displayX: left,
    displayY: top,
    displayXWithOffset: leftWithOffset,
    displayYWithOffset: topWithOffset,
    xPercent,
    yPercent,
  };

  //console.log("Final marker position (px):", left, top);
  //console.log("ALL FINAL COORDINATES:", JSON.stringify(detailsMapCoordinates.value));
};

// v-icon :  :style="getDetailsMapMarkerStyle()
const getDetailsMapMarkerStyle = () => {
  if (!detailsMapCoordinates.value || !detailsMapCoordinates.value.displayX) {
    console.log("Marker style: No coordinates or displayX available yet");
    return { display: "none" }; // Hide until calculations are complete
  }

  // Try different coordinate options
  const useOffset = true; // Toggle to compare results with/without offset

  const left = useOffset
    ? detailsMapCoordinates.value.displayXWithOffset
    : detailsMapCoordinates.value.displayX;

  const top = useOffset
    ? detailsMapCoordinates.value.displayYWithOffset
    : detailsMapCoordinates.value.displayY;

  console.log("MARKER STYLE - Using positions:", left, top);
  console.log("MARKER STYLE - With offset:", useOffset);

  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: "translate(-50%, -50%)",
    zIndex: 1,
  };
};

// Handle getting Coordinates of floor plan
const fetchDetailsFloorPlan = async (item, levelId) => {
  try {
    // First fetch reader coordinates using reader ID
    const coordinatesResponse = await api.get(
      `/api/rfid_readers/x-y-coordinates/${item.readerId}`
    );
    console.log(
      "Fetch Floor Plan :Reader Coordinates:",
      coordinatesResponse.data
    );

    if (coordinatesResponse.data) {
      // Set floor plan coordinates for view in Device Details (change is not allowed)
      detailsFloorPlanCoordinates.value = {
        x: coordinatesResponse.data.xCoordinate,
        y: coordinatesResponse.data.yCoordinate,
      };
      // Set floor plan coordinates for Edit Mode
      floorPlanCoordinates.value = {
        x: coordinatesResponse.data.xCoordinate,
        y: coordinatesResponse.data.yCoordinate,
      };
    }
  } catch (error) {
    console.error("Error fetching floor plan:", error);
    detailsFloorPlanPreview.value = null;
    detailsFloorPlanCoordinates.value = null;
  }
};

const fetchReaderStatusHistoryNoPage = async (readerId) => {
  try {
    const response = await api.get(
      `/api/rfid_readers/status-history/${readerId}`
    );
    console.log("Reader Status History:", response);
    deviceHistory.value = response.data.map((history, index) => ({
      no: index + 1,
      alert: getStatusAlert(history.status),
      device: selectedDevice.value?.supplyName || "-", // Use supplyName from clicked item
      datetime: formatTimestamp(history.statusTimestamp),
      notes: history.notes,
    }));
  } catch (error) {
    console.error("Error fetching history:", error);
    deviceHistory.value = [];
  }
};

const fetchReaderStatusHistory = async (readerId) => {
  try {
    const params = {
      page: historyPage.value - 1, // Backend uses 0-based indexing
      size: historyItemsPerPage.value,
      sort: "statusTimestamp,desc", // Sort by timestamp descending
    };

    const response = await api.get(
      `/api/rfid_readers/status-history/${readerId}`,
      { params }
    );
    console.log("Reader Status History:", response);

    // Update total pages and items
    deviceHistory.value = response.data.content.map((history, index) => ({
      no: (historyPage.value - 1) * historyItemsPerPage.value + index + 1,
      alert: getStatusAlert(history.status),
      device: selectedDevice.value?.supplyName || "-",
      datetime: formatTimestamp(history.statusTimestamp),
      notes: history.notes,
    }));

    totalHistoryItems.value = response.data.totalElements;
    totalHistoryPages.value = response.data.totalPages;
  } catch (error) {
    console.error("Error fetching history:", error);
    deviceHistory.value = [];
    totalHistoryItems.value = 0;
    totalHistoryPages.value = 0;
  }
};

const findIdByTranslationAndType = (name, levelType) => {
  if (!name || !organizationHierarchy.value) return null;

  const searchInHierarchy = (nodes) => {
    for (const node of nodes) {
      // Check if current node matches
      if (
        node.levelType === levelType &&
        (node.translations?.en === name || node.translations?.th === name)
      ) {
        return node.id;
      }
      // Check children if any
      if (node.children?.length) {
        const result = searchInHierarchy(node.children);
        if (result) return result;
      }
    }
    return null;
  };

  return searchInHierarchy(organizationHierarchy.value);
};

// Helper function to find the lowest level ID
const findLowestLevelId = (item) => {
  console.log("Find Lowest Level ID:", item);
  // Check in order: Room -> Zone -> Floor -> Building -> Armory
  const levelChecks = [
    { type: "ROOM", translation: item.hierarchyTranslations?.ROOM },
    { type: "ZONE", translation: item.hierarchyTranslations?.ZONE },
    { type: "FLOOR", translation: item.hierarchyTranslations?.FLOOR },
    { type: "BUILDING", translation: item.hierarchyTranslations?.BUILDING },
    { type: "ARMORY", translation: item.hierarchyTranslations?.ARMORY },
  ];

  for (const check of levelChecks) {
    if (check.translation) {
      const translationName = check.translation[locale.value];
      // Search in organization hierarchy for matching translation
      const foundId = findIdByTranslationAndType(translationName, check.type);
      console.log(`found ${foundId}`);
      if (foundId) return foundId;
    }
  }
  return null;
};

const getStatusAlert = (status) => {
  const statusMap = {
    ONLINE: t("device_connected"),
    OFFLINE: t("device_disconnected"),
    MAINTENANCE: t("device_maintenance"),
  };
  return statusMap[status] || status;
};

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString(
    locale.value === "th" ? "th-TH" : "en-US"
  );
};

const closeDetailsDialog = () => {
  dialogs.value.details = false;
  selectedDevice.value = null;
  deviceHistory.value = [];

  // Reset pagination state
  historyPage.value = 1;
  historyItemsPerPage.value = 5; // Reset to default
  totalHistoryItems.value = 0;
  totalHistoryPages.value = 0;

  // Cleanup URLs
  if (detailsMapPreview.value) {
    URL.revokeObjectURL(detailsMapPreview.value);
    detailsMapPreview.value = null;
  }
  if (detailsFloorPlanPreview.value) {
    URL.revokeObjectURL(detailsFloorPlanPreview.value);
    detailsFloorPlanPreview.value = null;
  }
};

const handleHistoryOptionsUpdate = (options) => {
  console.log("Selected Device:", selectedDevice.value); // Log full object
  console.log("Reader ID from readerId:", selectedDevice.value?.readerId);

  historyPage.value = options.page;
  historyItemsPerPage.value = options.itemsPerPage;

  // readerId is lowercase in the data
  if (selectedDevice.value?.readerId) {
    console.log("Using Reader ID:", selectedDevice.value.readerId);
    fetchReaderStatusHistory(selectedDevice.value.readerId);
  } else {
    console.error("No reader ID available");
  }
};

watch(
  () => formData.value.readerSerialNumber,
  (newSerial) => {
    if (dialogs.value.mode === "add" && newSerial) {
      formData.value.supplyNumber = `GATEWAY-${newSerial}`;
    }
  }
);

// 2. Add a watch to update searchData when selectedStatus changes
watch(selectedStatus, (newStatus) => {
  searchData.value.readerStatus = newStatus;
  console.log("Status filter updated:", newStatus);
});

// Initialize
onMounted(() => {
  fetchOrganizationHierarchy();

  // clear map area
  if (selectedMapPicture.value?.imagePath) {
    URL.revokeObjectURL(selectedMapPicture.value.imagePath);
  }
  if (mapPreview.value) {
    URL.revokeObjectURL(mapPreview.value);
  }

  // clear floor plan area
  if (selectedFloorPlan.value?.imagePath) {
    URL.revokeObjectURL(selectedFloorPlan.value.imagePath);
  }
  if (floorPlanPreview.value) {
    URL.revokeObjectURL(floorPlanPreview.value);
  }
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
