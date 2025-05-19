<!-- PageUsersManagement.vue -->

<template>
  <v-container fluid class="user-page-container pa-4">
    <!-- Header -->
    <v-card class="mb-4 elevation-1">
      <HeaderCommon :title="t('user_page')" />
    </v-card>

    <!-- Search and Filter Section -->
    <v-card class="mb-4 elevation-1 search-card">
      <v-card-title class="py-2 filter-header">
        <v-icon size="small" class="me-1">mdi-magnify</v-icon>
        {{ t("search") }}
      </v-card-title>
      <v-card-text class="py-2">
        <v-row dense>
          <!-- ช่องค้นหาข้อความ -->
          <v-col cols="12" md="3">
            <v-text-field
              v-model="searchQuery"
              :label="t('type_to_search')"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              variant="outlined"
              density="compact"
              class="search-field"
            ></v-text-field>
          </v-col>

          <v-spacer></v-spacer>

          <!-- ปุ่มค้นหา -->
          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn
              color="primary"
              size="small"
              elevation="1"
              @click="handleSearch"
              class="search-button"
            >
              <v-icon size="small" class="me-1">mdi-magnify</v-icon>
              {{ t("search") }}
            </v-btn>
          </v-col>

          <!-- ปุ่มล้างการค้นหา -->
          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn
              color="secondary"
              size="small"
              variant="outlined"
              @click="clearSearch"
              class="clear-button"
            >
              <v-icon size="small" class="me-1">mdi-eraser</v-icon>
              {{ t("clear_search") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Action Buttons -->
    <!--
    <div class="d-flex justify-space-between align-center mb-4">
      <v-spacer></v-spacer>
      <v-btn
          disabled
          color="primary"
          prepend-icon="mdi-plus"
          @click="openUserDialog(null)"
      >
        {{ t('add_user') }}
      </v-btn>
    </div>-->

    <!-- Users Data Table -->
    <v-card class="data-table-card mb-4 elevation-2">
      <v-data-table-server
        v-model:page="tableOptions.page"
        v-model:items-per-page="tableOptions.itemsPerPage"
        :headers="responsiveHeaders"
        :items="users"
        :items-length="totalUsers"
        :loading="loading"
        :search="search"
        @update:options="handleUpdateOptions"
        :items-per-page-options="defaultItemsPerPageOptions"
        :items-per-page-text="itemsPerPageText"
        class="data-table"
      >
        <!-- ส่วนแสดง Loading -->
        <template v-slot:loading>
          <v-skeleton-loader
            type="table-row-divider@6"
            class="ma-4"
          ></v-skeleton-loader>
        </template>

        <!-- คอลัมน์ลำดับ -->
        <template v-slot:item.index="{ index }">
          <div class="index-column">
            {{
              (tableOptions.page - 1) * tableOptions.itemsPerPage + index + 1
            }}
          </div>
        </template>

        <!-- คอลัมน์ Username -->
        <template v-slot:item.username="{ item }">
          <div class="username-cell">
            {{ item.username }}
          </div>
        </template>

        <!-- คอลัมน์บทบาท -->
        <template v-slot:item.roles="{ item }">
          <div class="roles-container">
            <v-chip
              v-for="(role, i) in item.roles"
              :key="i"
              class="ma-1 role-chip"
              :color="getClientColor(role)"
              size="small"
              label
              text-color="white"
              variant="elevated"
            >
              {{ role }}
            </v-chip>
          </div>
        </template>

        <!-- คอลัมน์องค์กร -->
        <template v-slot:item.organizations="{ item }">
          <div v-if="item.organizations?.length" class="org-chip-container">
            <v-chip
              v-for="(org, i) in item.organizations"
              :key="i"
              class="ma-1 org-chip"
              :color="getLevelColor(org.levelType)"
              variant="outlined"
              size="small"
            >
              {{ org.translations?.[locale] || org.translations?.["en"] }}
            </v-chip>
          </div>
          <div v-else>
            <span class="text-caption no-org-text">{{
              t("no_organizations")
            }}</span>
          </div>
        </template>

        <!-- คอลัมน์ข้อมูลทั่วไป -->
        <template v-slot:item.fullName="{ item }">
          <div class="full-name-cell">
            {{ item.fullName || t("not_available") }}
          </div>
        </template>

        <template v-slot:item.division="{ item }">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <span v-bind="props" class="division-cell">
                {{ getLocalizedText(item.divisionData) }}
              </span>
            </template>
            <span>{{
              item.divisionData?.abbreviation ||
              getLocalizedText(item.divisionData)
            }}</span>
          </v-tooltip>
        </template>

        <template v-slot:item.organization="{ item }">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <span v-bind="props" class="organization-cell">
                {{ getLocalizedText(item.organizationData) }}
              </span>
            </template>
            <span>{{
              item.organizationData?.abbreviation ||
              getLocalizedText(item.organizationData)
            }}</span>
          </v-tooltip>
        </template>

        <template v-slot:item.position="{ item }">
          <div class="position-cell">
            {{ item.position || t("not_available") }}
          </div>
        </template>

        <template v-slot:item.rank="{ item }">
          <div class="rank-cell">
            {{ item.rank || t("not_available") }}
          </div>
        </template>

        <template v-slot:item.subdivision="{ item }">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <div v-bind="props" class="text-truncate subdivision-cell">
                {{ getLocalizedText(item.subdivisionData) }}
              </div>
            </template>
            <span>{{ getLocalizedText(item.subdivisionData) }}</span>
          </v-tooltip>
        </template>

        <!-- คอลัมน์การทำงาน -->
        <template v-slot:item.actions="{ item }">
          <div class="action-buttons">
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              @click="openUserDialog(item)"
              class="action-button"
            >
              <v-icon>mdi-family-tree</v-icon>
              <v-tooltip activator="parent">{{
                t("manage_organizations_access")
              }}</v-tooltip>
            </v-btn>

            <v-btn
              icon
              variant="text"
              size="small"
              color="info"
              @click="openMenuPermissionDialog(item)"
              class="action-button"
            >
              <v-icon>mdi-menu-open</v-icon>
              <v-tooltip activator="parent">{{
                t("manage_menu_access")
              }}</v-tooltip>
            </v-btn>

            <v-btn
              icon
              variant="text"
              size="small"
              color="secondary"
              @click="openRoleEditDialog(item)"
              class="action-button"
            >
              <v-icon>mdi-account-edit</v-icon>
              <v-tooltip activator="parent">{{ t("edit_roles") }}</v-tooltip>
            </v-btn>

            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              disabled
              @click="openDeleteUserDialog(item)"
              class="action-button"
            >
              <v-icon>mdi-delete-outline</v-icon>
              <v-tooltip activator="parent">{{ t("delete_user") }}</v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- สถานะเมื่อไม่มีข้อมูล -->
        <template v-slot:no-data>
          <div class="empty-state">
            <v-icon size="64" color="grey-lighten-1"
              >mdi-account-off-outline</v-icon
            >
            <div class="text-h6 mt-4 grey--text text--darken-1">
              {{ t("no_data_available") }}
            </div>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- User Edit/Add Dialog -->
    <v-dialog v-model="userDialog.show" max-width="900px" class="user-dialog">
      <v-card v-if="userDialog.show" class="dialog-card" elevation="10">
        <v-card-title class="dialog-header d-flex justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="white" size="36" class="me-3">
              <v-icon size="24" color="primary">
                {{
                  userDialog.isEdit ? "mdi-account-edit" : "mdi-account-plus"
                }}
              </v-icon>
            </v-avatar>
            <span class="text-h6">{{
              userDialog.isEdit ? t("map_user_to_organization") : t("add_user")
            }}</span>
          </div>
          <v-btn
            icon
            variant="text"
            size="small"
            @click="userDialog.show = false"
            color="white"
            class="close-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-0">
          <v-form
            ref="userForm"
            v-model="userDialog.valid"
            @submit.prevent="saveUser"
          >
            <!-- User Information Section -->
            <div class="dialog-section user-info-section">
              <div class="section-header">
                <v-icon size="20" color="primary" class="me-2"
                  >mdi-account-details</v-icon
                >
                <span class="text-h6">{{ t("user_details") }}</span>
              </div>

              <v-row class="mt-3">
                <!-- Username field -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="userDialog.user.username"
                    :label="t('user_name')"
                    variant="outlined"
                    :rules="[requiredRule, usernameRules]"
                    :readonly="userDialog.isEdit"
                    density="comfortable"
                    hide-details="auto"
                    class="input-field "
                    prepend-inner-icon="mdi-account"
                  >
                    <template v-slot:prepend>
                      <v-tooltip location="top">
                        <template v-slot:activator="{ props }">
                          <v-icon
                            v-bind="props"
                            color="primary"
                            class="field-icon"
                            >mdi-account</v-icon
                          >
                        </template>
                        <span>{{ t("user_name") }}</span>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Only show roles field when NOT in edit mode -->
                <v-col v-if="!userDialog.isEdit" cols="12" md="6">
                  <v-select
                    v-model="userDialog.user.roles"
                    :items="clientRoles"
                    :label="t('roles')"
                    variant="outlined"
                    :rules="[requiredRule]"
                    density="comfortable"
                    hide-details="auto"
                    class="input-field "
                    item-title="title"
                    item-value="value"
                    return-object
                    chips
                  >
                    <template v-slot:prepend>
                      <v-tooltip location="top">
                        <template v-slot:activator="{ props }">
                          <v-icon
                            v-bind="props"
                            color="primary"
                            class="field-icon"
                            >mdi-shield-account</v-icon
                          >
                        </template>
                        <span>{{ t("roles") }}</span>
                      </v-tooltip>
                    </template>
                    <template v-slot:selection="{ item }">
                      <v-chip
                        :color="getClientColor(item.value)"
                        text-color="white"
                        size="small"
                        class="role-selection-chip"
                      >
                        {{ item.title || item.value }}
                      </v-chip>
                    </template>
                  </v-select>
                </v-col>

                <!-- First name -->
                <v-col v-if="!userDialog.isEdit" cols="12" md="6">
                  <v-text-field
                    v-model="userDialog.user.firstName"
                    :label="t('first_name')"
                    variant="outlined"
                    :rules="[requiredRule]"
                    density="comfortable"
                    hide-details="auto"
                    class="input-field "
                  >
                    <template v-slot:prepend>
                      <v-tooltip location="top">
                        <template v-slot:activator="{ props }">
                          <v-icon
                            v-bind="props"
                            color="primary"
                            class="field-icon"
                            >mdi-card-account-details</v-icon
                          >
                        </template>
                        <span>{{ t("first_name") }}</span>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Last name -->
                <v-col v-if="!userDialog.isEdit" cols="12" md="6">
                  <v-text-field
                    v-model="userDialog.user.lastName"
                    :label="t('last_name')"
                    variant="outlined"
                    :rules="[requiredRule]"
                    density="comfortable"
                    hide-details="auto"
                    class="input-field "
                  >
                    <template v-slot:prepend>
                      <v-tooltip location="top">
                        <template v-slot:activator="{ props }">
                          <v-icon
                            v-bind="props"
                            color="primary"
                            class="field-icon"
                            >mdi-card-account-details-outline</v-icon
                          >
                        </template>
                        <span>{{ t("last_name") }}</span>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Email -->
                <v-col v-if="!userDialog.isEdit" cols="12" md="6">
                  <v-text-field
                    v-model="userDialog.user.email"
                    :label="t('email')"
                    variant="outlined"
                    :rules="[requiredRule]"
                    density="comfortable"
                    hide-details="auto"
                    class="input-field "
                  >
                    <template v-slot:prepend>
                      <v-tooltip location="top">
                        <template v-slot:activator="{ props }">
                          <v-icon
                            v-bind="props"
                            color="primary"
                            class="field-icon"
                            >mdi-email</v-icon
                          >
                        </template>
                        <span>{{ t("email") }}</span>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Password field - only show when NOT in edit mode -->
                <v-col v-if="!userDialog.isEdit" cols="12" md="6">
                  <v-text-field
                    v-model="userDialog.user.password"
                    :label="t('password')"
                    variant="outlined"
                    :rules="[requiredRule]"
                    type="password"
                    density="comfortable"
                    hide-details="auto"
                    class="input-field "
                  >
                    <template v-slot:prepend>
                      <v-tooltip location="top">
                        <template v-slot:activator="{ props }">
                          <v-icon
                            v-bind="props"
                            color="primary"
                            class="field-icon"
                            >mdi-lock</v-icon
                          >
                        </template>
                        <span>{{ t("password") }}</span>
                      </v-tooltip>
                    </template>
                    <template v-slot:append>
                      <v-icon color="grey-darken-1">mdi-eye-off</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
            </div>

            <!-- Current Organization Access Section -->
            <div class="dialog-section current-org-section">
              <div class="section-header">
                <v-icon size="20" color="primary" class="me-2"
                  >mdi-office-building</v-icon
                >
                <span class="text-h6">{{
                  t("current_organization_access")
                }}</span>
              </div>

              <div
                class="org-access-container"
                :class="{
                  'empty-container':
                    !userDialog.user.organizationAccess ||
                    userDialog.user.organizationAccess.length === 0,
                }"
              >
                <!-- Organization access cards -->
                <div
                  v-if="
                    userDialog.user.organizationAccess &&
                    userDialog.user.organizationAccess.length > 0
                  "
                  class="org-access-list"
                >
                  <v-slide-x-transition group>
                    <v-card
                      v-for="(org, idx) in userDialog.user.organizationAccess"
                      :key="idx"
                      class="org-access-card mb-2"
                      variant="outlined"
                      :color="getOrgColor(org.organizationId)"
                    >
                      <div class="d-flex align-center px-3 py-2">
                        <v-avatar
                          :color="getOrgColor(org.organizationId)"
                          size="28"
                          class="me-3"
                        >
                          <v-icon color="white" size="small">mdi-domain</v-icon>
                        </v-avatar>

                        <div class="flex-grow-1">
                          <div class="d-flex align-center">
                            <span class="text-subtitle-2 font-weight-bold me-2"
                              >{{ org.nodeType }}:</span
                            >
                            <span class="text-body-2 text-truncate">{{
                              getLastPathSegment(org.path)
                            }}</span>
                          </div>
                          <div class="text-caption org-path-text text-truncate">
                            {{ org.path }}
                          </div>
                        </div>

                        <v-btn
                          icon
                          variant="text"
                          size="small"
                          color="grey-darken-1"
                          @click="removeOrgAccess(idx)"
                          class="remove-org-btn"
                        >
                          <v-icon size="18">mdi-close-circle</v-icon>
                        </v-btn>
                      </div>
                    </v-card>
                  </v-slide-x-transition>
                </div>

                <!-- Empty state for no organization access -->
                <div
                  v-if="
                    !userDialog.user.organizationAccess ||
                    userDialog.user.organizationAccess.length === 0
                  "
                  class="empty-org-access"
                >
                  <v-icon size="64" color="grey-lighten-1" class="mb-3"
                    >mdi-domain-off</v-icon
                  >
                  <div class="text-subtitle-1 grey--text text--darken-1">
                    {{ t("no_organization_access") }}
                  </div>
                  <div class="text-caption grey--text mt-2">
                    {{
                      t("add_organization_below") ||
                      "ใช้ส่วนด้านล่างเพื่อเพิ่มสิทธิ์การเข้าถึงองค์กร"
                    }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Organization Access Section -->
            <div class="dialog-section add-org-section">
              <div class="section-header">
                <v-icon size="20" color="primary" class="me-2"
                  >mdi-domain-plus</v-icon
                >
                <span class="text-h6">{{ t("add_organization_access") }}</span>
              </div>

              <v-card variant="outlined" class="org-selector-card">
                <v-card-text class="pa-4">
                  <OrganizationHierarchySelect
                    v-model="selectedHierarchy"
                    :organization-hierarchy="organizationHierarchy"
                    context="dialog"
                    @hierarchy-change="onHierarchyChange"
                    class="org-hierarchy-select"
                  />

                  <v-btn
                    block
                    color="primary"
                    class="mt-6 add-access-btn"
                    :disabled="!isValidHierarchySelection"
                    @click="addOrgAccess"
                    elevation="2"
                  >
                    <v-icon start>mdi-plus-circle</v-icon>
                    {{ t("add_access") }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </div>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="dialog-actions px-6 py-4">
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="outlined"
            @click="userDialog.show = false"
            class="cancel-btn me-3"
            elevation="0"
          >
            <v-icon start>mdi-close-circle</v-icon>
            {{ t("cancel_button") }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="userDialog.loading"
            @click="saveUser"
            class="save-btn"
            elevation="3"
          >
            <v-icon start>mdi-content-save</v-icon>
            {{ t("save_button") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete User Confirmation Dialog -->
    <v-dialog v-model="deleteDialog.show" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 text-center">
          {{ t("confirm_delete_user") }}
        </v-card-title>
        <v-card-text class="text-center">
          {{ t("confirm_delete_message", { username: deleteDialog.username }) }}
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="grey" text="" @click="deleteDialog.show = false">
            {{ t("cancel_button") }}
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDeleteUser"
            :loading="deleteDialog.loading"
          >
            {{ t("confirm_delete") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Menu Permission Dialog -->
    <v-dialog
      v-model="menuPermissionDialog.show"
      max-width="650px"
      class="menu-permission-dialog"
    >
      <v-card
        v-if="menuPermissionDialog.show"
        class="rounded-lg elevation-8 dialog-card"
      >
        <!-- ส่วนหัวของ Dialog -->
        <v-card-title class="dialog-header py-4 rounded-t-lg">
          <div class="d-flex align-center">
            <v-icon size="28" color="white" class="me-3">mdi-menu-open</v-icon>
            <span class="text-h6">
              {{
                t("manage_menu_access_for", {
                  username: menuPermissionDialog.username,
                })
              }}
            </span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            @click="menuPermissionDialog.show = false"
            class="close-btn"
          >
          </v-btn>
        </v-card-title>

        <!-- ส่วนเนื้อหาของ Dialog -->
        <v-card-text class="pa-6">
          <!-- แสดงข้อมูลผู้ใช้ -->
          <div class="user-info-section mb-6 pa-4 rounded-lg bg-grey-lighten-4">
            <div class="d-flex align-center">
              <v-avatar color="primary" class="me-4">
                <span class="text-h6 white--text">
                  {{
                    menuPermissionDialog.username
                      ? menuPermissionDialog.username.charAt(0).toUpperCase()
                      : "U"
                  }}
                </span>
              </v-avatar>
              <div>
                <div class="text-h6">{{ menuPermissionDialog.username }}</div>
                <!-- <div class="text-caption text-grey-darken-1">{{ t("user_id") }}: {{ menuPermissionDialog.userId }}</div> -->
              </div>
            </div>
          </div>

          <!-- คำอธิบายการตั้งค่า -->
          <div class=" text-body-1">{{ t("available_menus") }}</div>

          <!-- รายการเมนูที่เลือกได้ -->
          <v-card variant="outlined" class="menu-list-card">
            <v-list bg-color="white" class="pa-0">
              <v-list-item
                v-for="menu in availableMenus"
                :key="menu.value"
                class="menu-item"
                :class="{
                  selected: menuPermissionDialog.selectedMenus.includes(
                    menu.value
                  ),
                }"
              >
                <template v-slot:prepend>
                  <v-checkbox
                    v-model="menuPermissionDialog.selectedMenus"
                    :value="menu.value"
                    hide-details
                    color="primary"
                    class="pa-0 ma-0"
                  >
                  </v-checkbox>
                </template>

                <v-list-item-title>
                  <div class="d-flex align-center">
                    <v-avatar
                      size="32"
                      :color="getMenuIconColor(menu.value)"
                      class="white--text me-4 menu-icon-bg"
                      variant="flat"
                    >
                      <v-icon>{{ menu.icon }}</v-icon>
                    </v-avatar>
                    <span class="menu-label">{{ menu.label }}</span>
                  </div>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- ข้อมูลเพิ่มเติม -->
          <div class="mt-4 text-caption text-grey-darken-1">
            <v-icon size="small" color="info" class="me-1"
              >mdi-information-outline</v-icon
            >
            {{
              t("menu_permission_info") ||
              "หมายเหตุ: การเข้าถึงเมนูบางรายการอาจขึ้นอยู่กับบทบาทของผู้ใช้ในระบบด้วย"
            }}
          </div>
        </v-card-text>

        <!-- ส่วนปุ่มดำเนินการ -->
        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            color="error"
            prepend-icon="mdi-close-circle"
            @click="menuPermissionDialog.show = false"
            class="me-3 cancel-button"
          >
            {{ t("cancel_button") }}
          </v-btn>
          <v-btn
            variant="elevated"
            color="primary"
            :loading="menuPermissionDialog.loading"
            @click="saveMenuPermissions"
            class="save-button"
            prepend-icon="mdi-content-save"
          >
            {{ t("save_button") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Menu Role Dialog -->
    <!-- ส่วนของ Role Edit Dialog -->
    <v-dialog
      v-model="roleEditDialog.show"
      max-width="500px"
      class="role-edit-dialog"
    >
      <v-card class="rounded-lg elevation-5">
        <!-- ส่วนหัวของ Dialog -->
        <v-card-title class="role-dialog-header py-4 px-4 rounded-t-lg">
          <div class="d-flex align-center">
            <v-icon size="24" color="white" class="me-3"
              >mdi-shield-account</v-icon
            >
            <span class="text-h6">
              {{ t("edit_roles_for") }} {{ selectedUserForRoleEdit.username }}
            </span>
          </div>
        </v-card-title>

        <!-- ส่วนเนื้อหาของ Dialog -->
        <v-card-text class="pt-6 pb-4 px-4">
          <!-- ส่วนแสดงข้อมูลผู้ใช้ -->
          <div class="user-role-info mb-6 pa-4 rounded-lg bg-grey-lighten-4">
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" class="me-3" size="40">
                <span class="text-h6 white--text">
                  {{
                    selectedUserForRoleEdit.username
                      ? selectedUserForRoleEdit.username.charAt(0).toUpperCase()
                      : "U"
                  }}
                </span>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ selectedUserForRoleEdit.username }}
                </div>
              </div>
            </div>

            <!-- คำอธิบายในการตั้งค่าบทบาท -->
            <div class="role-instruction text-body-2 mt-2">
              <v-icon size="small" color="info" class="me-1"
                >mdi-information-outline</v-icon
              >
              {{
                t("role_edit_instruction") ||
                "เลือกบทบาทที่ต้องการกำหนดให้กับผู้ใช้งานนี้"
              }}
            </div>
          </div>

          <!-- ส่วนเลือกบทบาท -->
          <v-select
            v-model="selectedUserForRoleEdit.currentRole"
            :items="clientRoles"
            :label="t('select_role')"
            variant="outlined"
            color="primary"
            hide-details
            class="role-select mb-3"
            :menu-props="{ contentClass: 'role-select-menu' }"
          >
            <template v-slot:selection="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  :color="getClientColor(item.value)"
                  size="small"
                  class="me-2"
                >
                  mdi-shield-account
                </v-icon>
                <span>{{ item.title || item.value }}</span>
              </div>
            </template>

            <template v-slot:item="{ item, props }">
              <v-list-item
                v-bind="props"
                :title="item.title || item.value"
                :prepend-icon="'mdi-shield-account'"
                :prepend-icon-color="getClientColor(item.value)"
              ></v-list-item>
            </template>
          </v-select>

          <!-- ข้อมูลเพิ่มเติม -->
          <div class="text-caption text-grey-darken-1 mt-4">
            <v-icon size="small" color="warning" class="me-1"
              >mdi-alert-circle-outline</v-icon
            >
            {{
              t("role_change_warning") ||
              "การเปลี่ยนบทบาทอาจส่งผลต่อสิทธิ์การเข้าถึงระบบของผู้ใช้งาน"
            }}
          </div>
        </v-card-text>

        <!-- ส่วนปุ่มดำเนินการ -->
        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="roleEditDialog.show = false"
            class="me-3 role-cancel-btn"
            prepend-icon="mdi-close-circle"
          >
            {{ t("cancel") }}
          </v-btn>
          <v-btn
            variant="elevated"
            color="primary"
            @click="submitRoleUpdate"
            class="role-save-btn"
            :loading="roleEditDialog.loading"
            prepend-icon="mdi-content-save"
          >
            {{ t("save") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import HeaderCommon from "@/components/HeaderCommon.vue";
import OrganizationHierarchySelect from "@/components/OrganizationHierarchySelect.vue";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowReactive,
} from "vue";
import api from "@/axiostoastapi.js";
import { useI18n } from "vue-i18n";
import {
  HIERARCHY_LEVELS,
  getLevelColor,
} from "@/constants/organizationHierarchy.js";
import { requiredRule, usernameRules } from "@/utils/validationRules.js";
import { showSuccess, showError } from "@/utils/snackbar.js";
import { MenuName } from "@/constants/menuName";

const HIERARCHY_FIELDS = Object.entries(HIERARCHY_LEVELS)
  .sort((a, b) => b[1].level - a[1].level)
  .map(([type, info]) => ({ field: `${type.toLowerCase()}Id`, type }));
const predefinedColors = [
  "blue",
  "purple",
  "green",
  "orange",
  "pink",
  "cyan",
  "indigo",
  "teal",
  "amber",
  "deep-purple",
];
const clientColorMap = shallowReactive({});
const orgColorMap = shallowReactive({});
const getClientColor = (role) => {
  const parts = role.split(":");
  if (parts.length < 2) return "grey";
  const client = parts[0];
  if (!(client in clientColorMap)) {
    const colorIndex =
      Object.keys(clientColorMap).length % predefinedColors.length;
    clientColorMap[client] = predefinedColors[colorIndex];
  }
  return clientColorMap[client];
};
const getOrgColor = (organizationId) => {
  if (!organizationId) return "grey";
  if (!(organizationId in orgColorMap)) {
    const colorIndex =
      Object.keys(orgColorMap).length % predefinedColors.length;
    orgColorMap[organizationId] = predefinedColors[colorIndex];
  }
  return orgColorMap[organizationId];
};
const clientRoles = ref([]);
const password = ref("");
const { t, locale } = useI18n();
const loading = ref(false);
const users = ref([]);
const totalUsers = ref(0);
const defaultItemsPerPageOptions = [5, 10, 25, 50];
const itemsPerPageText = ref(t("items_per_page"));
const tableOptions = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: "",
  sortDesc: false,
});
const handleUpdateOptions = (options) => {
  const sortByObject =
    options.sortBy.length > 0 ? options.sortBy[0] : { key: "", order: "" };
  tableOptions.value = {
    page: options.page,
    itemsPerPage: options.itemsPerPage,
    sortBy: sortByObject.key || "",
    sortDesc: sortByObject.order === "desc",
  };
  fetchUsers();
};

const search = ref("");
const searchQuery = ref("");
const organizationFilter = ref(null);
const roleFilter = ref(null);
const statusFilter = ref(null);
const organizationHierarchy = ref([]);

// Add this helper function to get localized text based on the current locale
const getLocalizedText = (data) => {
  if (!data) return t("not_available");
  return data[locale.value] || data.th || data.en || t("not_available");
};
// Update your headers computed property
const headers = computed(() => [
  {
    title: t("column_order"),
    key: "index",
    sortable: false,
    align: "center",
    width: "50px",
  },
  { title: t("user_name"), key: "username", sortable: true, width: "120px" },
  { title: t("full_name"), key: "fullName", sortable: true, width: "180px" },
  //{ title: t('is_admin'), key: 'isAdmin', sortable: true, align: 'center', width: '80px' },
  {
    title: t("organization"),
    key: "organization",
    sortable: false,
    width: "140px",
  },
  { title: t("division"), key: "division", sortable: false, width: "140px" },
  {
    title: t("subdivision"),
    key: "subdivision",
    sortable: false,
    width: "140px",
  },
  { title: t("rank"), key: "rank", sortable: false, width: "100px" },
  { title: t("position"), key: "position", sortable: false, width: "140px" },
  {
    title: t("role"),
    key: "roles",
    sortable: false,
    align: "center",
    width: "180px",
  },
  {
    title: t("column_actions"),
    key: "actions",
    sortable: false,
    width: "120px",
  },
]);

// Optional: Add a responsive mode that activates when the screen is too small
const isMobile = ref(false);
// Responsive headers that show fewer columns on mobile
const responsiveHeaders = computed(() => {
  if (isMobile.value) {
    return [
      {
        title: t("column_order"),
        key: "index",
        sortable: false,
        align: "center",
        width: "40px",
      },
      {
        title: t("user_name"),
        key: "username",
        sortable: true,
        width: "100px",
      },
      {
        title: t("full_name"),
        key: "fullName",
        sortable: true,
        width: "150px",
      },
      {
        title: t("is_admin"),
        key: "isAdmin",
        sortable: true,
        align: "center",
        width: "80px",
      },
      {
        title: t("column_actions"),
        key: "actions",
        sortable: false,
        width: "80px",
      },
    ];
  }
  return headers.value;
});
// Function to check screen size
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 1024;
};

const userDialog = ref({
  show: false,
  isEdit: false,
  valid: true,
  loading: false,
  user: {
    id: null,
    username: "",
    roles: null,
    email: null,
    firstName: null,
    lastName: null,
    password: null,
    organizationAccess: [],
  },
});
const selectedHierarchy = ref({
  organizationId: null,
  armoryId: null,
  buildingId: null,
  floorId: null,
  zoneId: null,
  roomId: null,
  partitionId: null,
  shelfId: null,
  slotId: null,
});
const userForm = ref(null);
const isValidHierarchySelection = computed(() => {
  return selectedHierarchy.value.organizationId !== null;
});
const fetchOrganizationHierarchy = async () => {
  try {
    console.log("Fetching organization hierarchy from API...");
    const response = await api.get("/api/organization-hierarchies/9levels");
    console.log("Fetch full organization:", response.data);
    organizationHierarchy.value = response.data;
    showSuccess(t("fetch_organization_successfully"));
  } catch (error) {
    console.error("Failed to fetch organization hierarchy:", error);
    showError(t("error_loading_organizations"));
  }
};

// Fetch users from backend
const fetchUsers = async () => {
  loading.value = true;
  try {
    const sortParam = tableOptions.value.sortBy
      ? `${tableOptions.value.sortBy},${
          tableOptions.value.sortDesc ? "desc" : "asc"
        }`
      : "";

    console.log(sortParam);
    const response = await api.get("/api/users", {
      params: {
        page: tableOptions.value.page - 1,
        size: tableOptions.value.itemsPerPage,
        sort: sortParam,
        search: search.value,
      },
    });

    console.log(response);
    users.value = response.data.content;
    totalUsers.value = response.data.totalElements;
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    loading.value = false;
  }
};

const fetchClientRoles = async () => {
  loading.value = true;
  try {
    const response = await api.get("/api/users/client-role-selector", {});
    console.log("Client Roles :", response);
    clientRoles.value = response.data;
  } catch (error) {
    console.error("Failed to fetch client roles:", error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  console.log("Search Test: ", searchQuery.value);
  search.value = searchQuery.value;
  tableOptions.value.page = 1;
  fetchUsers();
};

const clearSearch = () => {
  searchQuery.value = "";
  organizationFilter.value = null;
  roleFilter.value = null;
  statusFilter.value = null;
  handleSearch();
};
const onHierarchyChange = ({ level, value }) => {
  //console.log(`Hierarchy changed: ${level} = ${value}`);
};
const addOrgAccess = () => {
  const hierarchy = selectedHierarchy.value;
  if (!hierarchy.organizationId) {
    showError(t("organization_required"));
    return;
  }
  const lowest = getLowestLevelInfo(hierarchy);

  // Add validation to ensure only root-level (ORGANIZATION) can be selected
  if (!lowest || lowest.nodeType !== "ORGANIZATION") {
    showError(t("only_root_level_allowed"));
    return;
  }

  if (!lowest) return;
  const path = buildAccessPath(hierarchy);
  const hierarchyWithoutNulls = Object.fromEntries(
    Object.entries(hierarchy).filter(([_, v]) => v !== null)
  );
  const access = {
    ...hierarchyWithoutNulls,
    nodeId: lowest.nodeId,
    nodeType: lowest.nodeType,
    path,
  };
  const isDuplicate = userDialog.value.user.organizationAccess.some(
    (a) => a.nodeId === lowest.nodeId && a.nodeType === lowest.nodeType
  );
  if (!isDuplicate) {
    userDialog.value.user.organizationAccess.push(access);
  } else {
    showError(t("duplicate_access_path"));
  }
  selectedHierarchy.value = {
    organizationId: null,
    armoryId: null,
    buildingId: null,
    floorId: null,
    zoneId: null,
    roomId: null,
    partitionId: null,
    shelfId: null,
    slotId: null,
  };
};

const getLastPathSegment = (path) => {
  if (!path) return "";
  const segments = path.split(" > ");
  return segments[segments.length - 1];
};
const removeOrgAccess = (index) => {
  userDialog.value.user.organizationAccess.splice(index, 1);
};
const buildAccessPath = (hierarchy) => {
  const parts = [];
  if (hierarchy.organizationId) {
    const org = organizationHierarchy.value.find(
      (o) => o.id === hierarchy.organizationId
    );
    if (org) {
      parts.push(
        locale.value === "th" ? org.translations.th : org.translations.en
      );
    }
  }
  const findNodeById = (nodes, id, type) => {
    for (const node of nodes) {
      if (node.id === id && node.levelType === type) {
        return node;
      }
      if (node.children?.length) {
        const found = findNodeById(node.children, id, type);
        if (found) return found;
      }
    }
    return null;
  };
  HIERARCHY_FIELDS.filter((level) => level.type !== "ORGANIZATION").forEach(
    (level) => {
      const id = hierarchy[level.field];
      if (id) {
        const node = findNodeById(organizationHierarchy.value, id, level.type);
        if (node) {
          parts.push(
            locale.value === "th" ? node.translations.th : node.translations.en
          );
        } else {
          parts.push(`${t(level.type.toLowerCase())}: ${id}`);
        }
      }
    }
  );
  return parts.join(" > ");
};
const getLowestLevelInfo = (hierarchy) => {
  for (const level of HIERARCHY_FIELDS) {
    const id = hierarchy[level.field];
    if (id) {
      return {
        nodeId: id,
        nodeType: level.type,
        field: level.field,
      };
    }
  }
  return null;
};
const openUserDialog = (user) => {
  console.log(user);
  if (user) {
    userDialog.value.isEdit = true;

    // Map the organizations data to the expected format for organization access
    const organizationAccess = user.organizations
      ? user.organizations.map((org) => {
          // Choose the appropriate translation based on current locale
          const orgName = org.translations
            ? locale.value === "th"
              ? org.translations.th
              : org.translations.en
            : "Unknown";

          return {
            organizationId: org.organizationId,
            path: orgName,
            levelType: org.levelType,
            levelNumber: org.levelNumber,
          };
        })
      : [];

    userDialog.value.user = {
      id: user.id,
      username: user.username,
      organizationAccess,
    };
  } else {
    userDialog.value.isEdit = false;
    userDialog.value.user = {
      id: null,
      username: "",
      organizationAccess: [],
    };
  }
  userDialog.value.valid = true;
  userDialog.value.show = true;
};

const deleteDialog = ref({
  show: false,
  userId: null,
  username: "",
  loading: false,
});
const protectedUsernames = ["adminright", "sadmin"];
const openDeleteUserDialog = (user) => {
  console.log("Open Delete User Dialog Open: ", user);

  if (protectedUsernames.includes(user.username)) {
    showError(t("cannot_delete_protected_user"));
    return;
  }

  deleteDialog.value = {
    show: true,
    userId: user.id,
    username: user.username,
    loading: false,
  };
};
const confirmDeleteUser = async () => {
  if (protectedUsernames.includes(deleteDialog.value.username)) {
    showError(t("cannot_delete_protected_user"));
    deleteDialog.value.show = false;
    return;
  }

  console.log("Delete ID: ", deleteDialog.value.userId);

  deleteDialog.value.loading = true;
  try {
    await api.delete(`/api/users/${deleteDialog.value.userId}`);
    showSuccess(t("user_deleted_successfully"));
    deleteDialog.value.show = false;
    await fetchUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
    showError(t("error_deleting_user"));
  } finally {
    deleteDialog.value.loading = false;
  }
};

const saveUser = async () => {
  userDialog.value.loading = true;

  try {
    // Common validation: check for at least one organization
    const organizationIds = userDialog.value.user.organizationAccess
      .map((access) => {
        const lowest = getLowestLevelInfo(access);
        return lowest ? lowest.nodeId : null;
      })
      .filter(Boolean);

    if (organizationIds.length === 0) {
      showError(t("please_select_at_least_one_organization"));
      return;
    }

    if (userDialog.value.isEdit) {
      // EXISTING FUNCTIONALITY: Map user to organizations
      const payload = {
        userId: userDialog.value.user.id,
        organizationIds: userDialog.value.user.organizationAccess
          .map((access) => {
            const lowest = getLowestLevelInfo(access);
            return lowest ? lowest.nodeId : null;
          })
          .filter(Boolean),
      };
      console.log("Edit Payload:", payload);
      const response = await api.post("/api/users/map-organizations", payload);

      const index = users.value.findIndex(
        (u) => u.id === userDialog.value.user.id
      );
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          organizations: userDialog.value.user.organizationAccess.map(
            (access) => ({
              id: access.organizationId,
              name: access.path.split(" > ")[0], // Extract 1 level [ORGANIZATION]
            })
          ),
        };
      }
      showSuccess(t("user_organization_mapping_updated"));
    } else {
      // NEW FUNCTIONALITY: Create new user with roles, password and organization access
      const payload = {
        username: userDialog.value.user.username,
        password: userDialog.value.user.password,
        roles: userDialog.value.user.roles,
        email: userDialog.value.user.email,
        firstname: userDialog.value.user.firstName,
        lastname: userDialog.value.user.lastName,
        organizationIds: userDialog.value.user.organizationAccess
          .map((access) => {
            const lowest = getLowestLevelInfo(access);
            return lowest ? lowest.nodeId : null;
          })
          .filter(Boolean),
      };

      console.log("Creating user with payload:", payload);
      const response = await api.post("/api/users/create", payload);
      showSuccess(t("user_created_successfully"));
    }
    userDialog.value.show = false;
    await fetchUsers();
  } catch (error) {
    console.error("Failed to update user organization mapping:", error);
    if (userDialog.value.isEdit) {
      showError(t("error_updating_organization_mapping"));
    } else {
      showError(t("error_creating_user"));
    }
  } finally {
    userDialog.value.loading = false;
  }
};

// Permission menu dialog ---------------

// กำหนด state สำหรับ dialog
const menuPermissionDialog = ref({
  show: false,
  userId: null,
  username: "",
  selectedMenus: [],
  loading: false,
});
const openMenuPermissionDialog = async (user) => {
  console.log("Open Menu Permission Dialog Open: ", user);
  menuPermissionDialog.value.userId = user.id;
  menuPermissionDialog.value.username = user.username;
  menuPermissionDialog.value.loading = true;
  menuPermissionDialog.value.show = true;
  try {
    // ดึงข้อมูลสิทธิ์เมนูปัจจุบันของผู้ใช้
    console.log("Open Menu Permission Dialog Open: ", user.id);
    const response = await api.get(`/api/users/${user.id}/menu-permissions`);
    console.log("Menu Access Fetch Response: ", response);
    menuPermissionDialog.value.selectedMenus = response.data;
  } catch (error) {
    console.error("Error fetching menu permissions:", error);
    showError(t("error_loading_menu_permissions"));
    menuPermissionDialog.value.selectedMenus = [];
  } finally {
    menuPermissionDialog.value.loading = false;
  }
};
// รายการเมนูทั้งหมดพร้อมไอคอน
const availableMenus = computed(() => [
  {
    label: t("dashboard_menu"),
    value: MenuName.DASHBOARD,
    icon: "mdi-monitor-dashboard",
  },
  {
    label: t("register_rfid_tags"),
    value: MenuName.REGISTER_RFID_TAGS,
    icon: "mdi-barcode",
  },
  {
    label: t("register_reader"),
    value: MenuName.REGISTER_READER,
    icon: "mdi-network-outline",
  },
  {
    label: t("manage_supplies"),
    value: MenuName.MANAGE_SUPPLIES,
    icon: "mdi-pistol",
  },
  {
    label: t("alert_summary_page"),
    value: MenuName.ALERT_SUMMARY,
    icon: "mdi-alert-outline",
  },
  {
    label: t("organization_page"),
    value: MenuName.ORGANIZATION,
    icon: "mdi-family-tree",
  },
  {
    label: t("user_page"),
    value: MenuName.USER_MANAGEMENT,
    icon: "mdi-account-tie-hat",
  },
  { label: t("settings"), value: MenuName.SETTINGS, icon: "mdi-cog-outline" },
]);

// เพิ่มฟังก์ชันนี้ต่อจาก availableMenus computed
const getMenuIconColor = (menuValue) => {
  // สีของไอคอนตามประเภทของเมนู
  const colorMap = {
    [MenuName.DASHBOARD]: "primary", // หน้าแดชบอร์ด
    [MenuName.REGISTER_RFID_TAGS]: "blue-darken-1", // ลงทะเบียน RFID
    [MenuName.REGISTER_READER]: "indigo-darken-1", // ลงทะเบียนเครื่องอ่าน
    [MenuName.MANAGE_SUPPLIES]: "deep-purple-darken-1", // จัดการพัสดุ
    [MenuName.ALERT_SUMMARY]: "red-darken-1", // การแจ้งเตือน
    [MenuName.ORGANIZATION]: "teal-darken-1", // องค์กร
    [MenuName.USER_MANAGEMENT]: "purple-darken-1", // ผู้ใช้งาน
    [MenuName.SETTINGS]: "grey-darken-1", // การตั้งค่า
  };

  return colorMap[menuValue] || "primary";
};

// บันทึกสิทธิ์เมนู
const saveMenuPermissions = async () => {
  menuPermissionDialog.value.loading = true;
  console.log("Menu permissions:", menuPermissionDialog.value);
  try {
    await api.post(
      `/api/users/${menuPermissionDialog.value.userId}/menu-permissions`,
      {
        menuNames: menuPermissionDialog.value.selectedMenus,
      }
    );

    showSuccess(t("menu_permissions_updated"));
    menuPermissionDialog.value.show = false;
  } catch (error) {
    console.error("Error saving menu permissions:", error);
    showError(t("error_saving_menu_permissions"));
  } finally {
    menuPermissionDialog.value.loading = false;
  }
};

const roleEditDialog = ref({
  show: false,
  username: "",
  currentRoles: [],
  loading: false,
});

const selectedUserForRoleEdit = ref({
  userId: null,
  username: "",
  currentRole: null,
});

const openRoleEditDialog = (user) => {
  console.log("Open Role dialog: ", user);
  selectedUserForRoleEdit.value = {
    userId: user.id,
    username: user.username,
    currentRole: user.roles?.[0] || null,
  };
  roleEditDialog.value.show = true;
};

const submitRoleUpdate = async () => {
  try {
    const payload = {
      userId: selectedUserForRoleEdit.value.userId,
      roleNames: [selectedUserForRoleEdit.value.currentRole], // <-- เป็น array แบบเดียว
    };
    console.log(" Role update payload: ", payload);
    await api.post("/api/users/assign-roles", payload);
    showSuccess(t("roles_updated_successfully"));
    await fetchUsers(); // Refresh user table
  } catch (e) {
    console.error("Failed to update roles", e);
    showError(t("error_updating_roles"));
  } finally {
    roleEditDialog.value.show = false;
  }
};

onMounted(async () => {
  window.addEventListener("resize", checkScreenSize);
  checkScreenSize(); // Check on an initial load

  await fetchUsers();
  await fetchOrganizationHierarchy();
  await fetchClientRoles();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<style scoped>
/* สไตล์สำหรับส่วนการค้นหา */
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
.select-field :deep(.v-field__field) {
  min-height: 40px;
}

.search-field :deep(.v-field),
.select-field :deep(.v-field) {
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  transition: all 0.2s ease;
}

.search-field:hover :deep(.v-field),
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

/* <!--------------------------------- Users Data Table --------------------------> */

/* สไตล์ทั่วไปของหน้า */
.user-page-container {
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

/* สไตล์ของการ์ด */
.header-card,
.search-card,
.data-table-card {
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

/* สไตล์สำหรับตาราง */
.data-table {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
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
  text-align: center !important;
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

/* เลขลำดับรูปแบบวงกลม */
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

/* ปรับแต่งชิพแสดงบทบาท */
.roles-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  width: 100%;
}

.role-chip {
  font-size: 0.75rem !important;
  height: 24px !important;
  font-weight: 500 !important;
}

/* ปรับแต่งชิพแสดงองค์กร */
.org-chip-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.org-chip {
  font-size: 0.75rem !important;
  height: 24px !important;
}

.no-org-text {
  color: #757575;
  font-style: italic;
}

/* เซลล์ข้อมูลทั่วไป */
.username-cell,
.full-name-cell,
.division-cell,
.organization-cell,
.position-cell,
.rank-cell,
.subdivision-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* ปุ่มการทำงาน */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  text-align: center;
  margin: 0 auto;
}

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

/* เมื่อไม่มีข้อมูล */
.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border-radius: 8px;
  padding: 40px 20px;
}

/* สนับสนุนการแสดงผลบนอุปกรณ์เคลื่อนที่ */
@media (max-width: 960px) {
  .roles-container,
  .org-chip-container {
    flex-direction: column;
  }

  .username-cell,
  .full-name-cell,
  .division-cell,
  .organization-cell,
  .position-cell,
  .rank-cell,
  .subdivision-cell {
    max-width: 100px;
  }
}

/* <!--------------------------------- User Edit/Add Dialog --------------------------> */
/* User Edit/Add Dialog Styles */
.user-dialog :deep(.v-card) {
  border-radius: 16px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.dialog-header {
  background: linear-gradient(120deg, #1a237e, #0d47a1);
  color: white;
  padding: 20px 24px !important;
  font-size: 1.2rem;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-header .close-btn {
  transition: transform 0.2s ease;
}

.dialog-header .close-btn:hover {
  transform: rotate(90deg);
}

.dialog-section {
  padding: 24px;
  margin-bottom: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f4f8;
  margin-bottom: 16px;
}

.input-field {
  margin-bottom: 16px;
}

.input-field :deep(.v-field) {
  border-radius: 12px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.input-field:hover :deep(.v-field) {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.input-field :deep(.v-field--focused) {
  background-color: #ffffff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  border-color: #1976d2;
}

.field-icon {
  opacity: 0.8;
  transition: all 0.2s ease;
}

.input-field:hover .field-icon,
.input-field :deep(.v-field--focused) + .field-icon {
  opacity: 1;
  transform: scale(1.1);
}

.role-selection-chip {
  font-weight: 500;
  border-radius: 12px;
  font-size: 0.8rem;
}

/* Organization Access Section */
.org-access-container {
  min-height: 100px;
  max-height: 250px;
  overflow-y: auto;
  padding: 8px 4px;
  border-radius: 12px;
  background-color: #f8f9fa;
  scrollbar-width: thin;
}

.org-access-container::-webkit-scrollbar {
  width: 6px;
}

.org-access-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.org-access-card {
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;
  border-width: 2px;
  border-left-width: 4px;
  background-color: white;
}

.org-access-card:hover {
  transform: translateX(3px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.org-path-text {
  color: rgba(0, 0, 0, 0.6);
}

.remove-org-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.remove-org-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  color: #f44336 !important;
}

.empty-org-access {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #f5f5f5;
  border-radius: 12px;
  text-align: center;
  border: 2px dashed #e0e0e0;
  height: 100%;
}

/* Add Organization Section */
.org-selector-card {
  border-radius: 12px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
}

.org-selector-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.org-hierarchy-select :deep(.v-field) {
  border-radius: 12px;
  background-color: #f8f9fa;
  margin-bottom: 12px;
}

.add-access-btn {
  height: 48px;
  border-radius: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  text-transform: none;
  transition: all 0.3s ease;
  background: linear-gradient(120deg, #1565c0, #0d47a1);
}

.add-access-btn:not([disabled]):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(25, 118, 210, 0.3);
}

.add-access-btn[disabled] {
  background: linear-gradient(120deg, #90caf9, #64b5f6) !important;
  opacity: 0.6;
}

/* Action Buttons */
.dialog-actions {
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn,
.save-btn {
  min-width: 140px;
  height: 48px;
  border-radius: 12px;
  text-transform: none;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
}

.save-btn {
  background: linear-gradient(120deg, #1976d2, #0d47a1);
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(25, 118, 210, 0.4);
}

.cancel-btn {
  border: 2px solid;
}

.cancel-btn:hover {
  transform: translateY(-2px);
  background-color: rgba(244, 67, 54, 0.05);
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .dialog-section {
    padding: 16px;
  }

  .cancel-btn,
  .save-btn {
    min-width: 120px;
    height: 44px;
  }

  .org-access-container {
    max-height: 200px;
  }
}

/* <!--------------------------------- Menu Permission Dialog --------------------------> */

/* สไตล์สำหรับ Menu Permission Dialog */
.menu-permission-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-permission-dialog :deep(.v-card) {
  overflow: hidden;
  border-radius: 12px !important;
}

.menu-permission-dialog .dialog-header {
  background: linear-gradient(135deg, #3f88fd 0%, #04488b 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-permission-dialog .close-btn {
  opacity: 0.8;
  transition: opacity 0.2s;
}

.menu-permission-dialog .close-btn:hover {
  opacity: 1;
}

.user-info-section {
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.user-info-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.menu-list-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.menu-item {
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 !important;
  height: 60px;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item.selected {
  background-color: rgba(25, 118, 210, 0.08) !important;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.03) !important;
}

.menu-icon-bg {
  transition: transform 0.2s ease;
}

.menu-item:hover .menu-icon-bg {
  transform: scale(1.1);
}

.menu-label {
  font-size: 0.95rem;
  font-weight: 500;
}

.cancel-button,
.save-button {
  min-width: 120px;
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.3px;
  height: 44px;
  transition: all 0.2s ease;
}

.save-button {
  background: linear-gradient(135deg, #0288d1 0%, #01579b 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.cancel-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* <!--------------------------------- Role Edit Dialog --------------------------> */
/* สไตล์สำหรับ Role Edit Dialog */
.role-edit-dialog :deep(.v-card) {
  overflow: hidden;
  border-radius: 12px !important;
}

.role-dialog-header {
  background: linear-gradient(135deg, #0288d1 0%, #01579b 100%);
  color: white;
}

.role-select :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.role-select :deep(.v-field:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.role-select :deep(.v-field__input) {
  padding: 12px;
}

.role-select-menu {
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

.user-role-info {
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.user-role-info:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.role-instruction {
  color: #546e7a;
  padding: 8px;
  background-color: rgba(33, 150, 243, 0.05);
  border-radius: 4px;
  border-left: 3px solid #2196f3;
}

.role-cancel-btn,
.role-save-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.3px;
  height: 40px;
  min-width: 100px;
  transition: all 0.3s ease;
}

.role-save-btn {
  background: linear-gradient(135deg, #4a494d 0%, #2c2c2c 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.role-save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.role-cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
</style>
