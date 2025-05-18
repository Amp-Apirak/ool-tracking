<!-- PageLocationManagement.vue -->

<template>
  <v-container fluid>
    <!-- Header -->
    <v-card class="mb-4">
      <HeaderCommon :title="t('organization_page')" />
    </v-card>

    <!-- Improved Action Buttons Section -->
    <v-card class="mb-4 pa-4">
      <!-- Section 4: Action Buttons - Improved Layout -->
      <div class="d-flex justify-space-between align-center">
        <!-- Export Buttons - Left Side -->
        <div class="d-flex align-center">
          <span class="text-subtitle-1 font-weight-medium me-3" style="color: #FF8C00;">{{ t('export_data') }}</span>
          <v-btn
              v-for="format in ['JSON']"
              :key="format"
              variant="outlined"
              color="#FF8C00"
              class="px-4"
              @click="showExportDialog(format)"
          >
            {{ format }}
          </v-btn>
        </div>

        <!-- Add Button - Right Side -->
        <div>
          <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              class="px-4"
              @click="openAddDialog"
          >
            {{ isRootLevel ? t('add_root_organization') : t('add_organization') }}
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Hierarchy Cards -->
    <v-card>
      <v-card-title class="text-h5 font-weight-bold">
        {{ t('organization_hierarchy') }}
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col v-for="item in rootOrganizations" :key="item.id" :cols="colWidth(item.levelType)">
            <v-card class="hierarchy-card" elevation="2" :color="getLevelColorCards(item.levelType)">
                <v-card-title class="d-flex justify-space-between align-center">
                  <div class="d-flex align-center">
                    <strong>{{ getItemName(item, locale) }}</strong>
                    <span class="text-grey text-caption ml-2">({{ item.levelNumber }})</span>
                  </div>

                  <v-chip :color="getLevelColor(item.levelType)" size="small" class="level-chip">
                    {{ t(item.levelType.toLowerCase()) }}
                  </v-chip>

                </v-card-title>

                <v-card-subtitle v-if="showLocation(item.levelType) === 'yes'">
                  <strong>{{ t('longitude') }}:</strong> {{ item.longitude || '-' }} &nbsp;&nbsp;
                  <strong>{{ t('latitude') }}:</strong> {{ item.latitude || '-' }}
                </v-card-subtitle>

              <v-card-text>
                <p><strong>{{ t('org_name') }}:</strong>
                  <code class="org-path">{{ getLocalizedOrganizationPath(item) }}</code>
                </p>
              </v-card-text>
              <!--
                <v-card-actions>
                  <v-btn icon="mdi-pencil" variant="text" size="small" @click="editItem(item)" />
                  <v-btn icon="mdi-delete" variant="text" size="small" color="error"
                         @click="confirmDelete(item)" :disabled="hasChildren(item)" />
                  <v-btn icon="mdi-map-outline" variant="text" size="small"
                         @click="manageMap(item)" />
                  <v-spacer></v-spacer>
                  <v-btn v-if="hasChildrenVisible(item)" icon @click="toggleExpand(item.id)">
                    <v-icon>{{ isExpanded(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  </v-btn>
                </v-card-actions>-->

              <v-card-actions>
                <v-btn variant="text" size="small" @click="editItem(item)">
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent">
                    {{ t('edit') }}
                  </v-tooltip>
                </v-btn>

                <v-btn variant="text" size="small" color="error"
                       @click="confirmDelete(item)" :disabled="hasChildren(item)">
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent">
                    {{ t('delete') }}
                  </v-tooltip>
                </v-btn>

                <!-- Add the new button here, right after these existing buttons -->
                <v-btn
                    variant="text"
                    size="small"
                    color="primary"
                    @click.stop="openAddDialog(item)"
                    class="add-child-btn"
                >
                  <v-icon>mdi-plus-circle-outline</v-icon>
                  <v-tooltip activator="parent">
                    {{ t('add_child') }}
                  </v-tooltip>
                </v-btn>


                <v-btn variant="text" size="small" @click="manageMap(item)">
                  <v-icon>mdi-map-outline</v-icon>
                  <v-tooltip activator="parent">
                    {{ t('manage_map') }}
                  </v-tooltip>
                </v-btn>

                <v-spacer></v-spacer>

                <v-btn v-if="hasChildrenVisible(item)" variant="text" size="small" @click="toggleExpand(item.id)">
                  <v-icon>{{ isExpanded(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  <v-tooltip activator="parent">
                    {{ isExpanded(item.id) ? t('collapse') : t('expand') }}
                  </v-tooltip>
                </v-btn>
              </v-card-actions>

                <v-expand-transition>
                  <div v-if="isExpanded(item.id)" class="nested-cards pl-4">
                    <RecursiveCard
                        v-for="child in getFilteredChildren(item.id)"
                        :key="child.id"
                        :item="child"
                        :level="2"
                        :get-item-name="getItemName"
                        :get-localized-organization-path="getLocalizedOrganizationPath"
                        :get-level-color="getLevelColor"
                        :get-level-color-cards="getLevelColorCards"
                        :show-location="showLocation"
                        :col-width="colWidth"
                        :get-filtered-children="getFilteredChildren"
                        :is-expanded="isExpanded"
                        :has-children-visible="hasChildrenVisible"
                        @edit="editItem"
                        @delete="confirmDelete"
                        @toggle="toggleExpand"
                        @map="manageMap"
                        @add="openAddDialog"
                    />
                  </div>
                </v-expand-transition>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>


    <!-- Add (save) /Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          {{ editMode ? t('edit_organization') : (isRootLevel ? t('add_root_organization') : t('add_organization')) }}
        </v-card-title>
        <v-card-text>

          <v-form ref="form" v-model="valid">

            <v-select
                v-if="!editMode"
                v-model="orgForm.parentId"
                :items="availableParents"
                item-title="name"
                item-value="id"
                :label="t('parent_organization')"
                clearable
                :rules="[]"
            />

            <v-select
                v-model="orgForm.levelType"
                :items="levelTypes"
                item-title="title"
                item-value="value"
                :label="t('level_type')"
                :disabled="isRootLevel|| editMode"
                required
                :rules="[
                  v => !!v || t('level_type_required'),
                  v => !isRootLevel || v === 'ORGANIZATION' || t('must_be_organization')
                ]"
            />

            <v-text-field
                v-model="orgForm.names.en"
                :label="t('name_en')"
                :rules="[organizationNameRule, minimumLength(1), maxLength(200)]"
                required
            />

            <v-text-field
                v-model="orgForm.names.th"
                :label="t('name_th')"
                :rules="[organizationNameRule, minimumLength(1), maxLength(200)]"
                required
            />

            <v-text-field
                v-model="orgForm.longitude"
                :label="t('longitude')"
                type="number"
                :rules="[v => v === '' || v === null || (v >= -180 && v <= 180) || t('longitude_range')]"
            />

            <v-text-field
                v-model="orgForm.latitude"
                :label="t('latitude')"
                type="number"
                :rules="[v => v === '' || v === null || (v >= -90 && v <= 90) || t('latitude_range')]"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" variant="text" @click="closeDialog">
            {{ t('cancel') }}
          </v-btn>
          <v-btn
              color="primary"
              :loading="saving"
              :disabled="!valid || saving"
              @click="saveOrganization"
          >
            {{ t('save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>{{ t('confirm_delete') }}</v-card-title>
        <v-card-text>
          {{ hasChildren(deleteItem) ?
            t('cannot_delete_has_children') :
            t('confirm_delete_organization') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="deleteDialog = false">
            {{ t('cancel') }}
          </v-btn>
          <v-btn
              color="error"
              :loading="deleting"
              @click="deleteOrganization"
              :disabled="hasChildren(deleteItem)"
          >
            {{ t('delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import Dialog -->
    <v-dialog v-model="dialogs.import" width="1500">
      <v-card v-if="dialogs.import">
        <v-card-title class="text-center">{{ t('add_organization') }}</v-card-title>
        <v-card-text>
          <!-- Template Download Section -->
          <div class="text-center mb-4">{{ t('download_template_to_system') }}</div>

          <!-- Template File Link -->
          <div class="text-center mb-4">
            <v-btn
                variant="text"
                color="primary"
                @click="downloadTemplate"
            >
              Templated_form.xlsx
            </v-btn>
          </div>

          <!-- Guide Line Text -->
          <div class="text-center mb-6">{{ t('download_guide_line') }}</div>

          <!-- Import File Section -->
          <div class="d-flex align-center mb-4">
            <div class="mr-2">Import files</div>
            <v-text-field
                v-model="selectedFileName"
                readonly
                hide-details
                class="flex-grow-1"
            ></v-text-field>
            <v-btn
                color="primary"
                class="ml-2"
                @click="selectFile"
            >
              {{ t('select_file') }}
            </v-btn>
            <input
                type="file"
                ref="fileInput"
                class="d-none"
                accept=".xlsx,.xls"
                @change="handleFileSelect"
            >
          </div>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
              color="grey"
              variant="outlined"
              @click="dialogs.import = false"
          >
            {{ t('cancel_button') }}
          </v-btn>
          <v-btn
              color="primary"
              class="ml-2"
              @click="importFile"
              :disabled="!selectedFile"
          >
            {{ t('save_button') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Map Management Dialog -->
    <v-dialog v-model="dialogs.map" max-width="1500">
      <v-card>
        <v-card-title>{{ t('manage_organization_map') }}</v-card-title>
        <v-card-subtitle>{{ currentOrganization?.translations?.[locale] || '' }}</v-card-subtitle>

        <v-card-text>
          <div class="text-caption text-grey-darken-1 mb-4">
            {{ t('click_to_place_marker') }}
          </div>

          <!-- Single Map Area -->
          <div class="mb-4">
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
                  @load="adjustMarkerPosition"
                  class="cursor-pointer"
              />
              <!-- Single Marker -->
              <v-icon
                  v-if="mapCoordinates"
                  color="red"
                  size="48"
                  class="position-absolute"
                  :style="getMarkerStyle()"
              >
                mdi-map-marker
              </v-icon>
              <!-- No Map Available Text (Ensuring it does not get pushed aside) -->
              <div
                  v-if="!selectedMapPicture?.imagePath && !mapPreview"
                  class="text-grey position-absolute w-100 text-center"
                  style="top: 50%; transform: translateY(-50%); font-size: 1.2rem;"
              >
                {{ t('no_map_available') }}
              </div>
            </v-sheet>
          </div>

          <!-- Upload Control -->
          <v-file-input
              v-model="mapFile"
              :label="t('upload_new_map')"
              :hint="t('recommended_image_size')"
              persistent-hint
              accept="image/*"
              @change="handleFileUpload"
              prepend-icon="mdi-image-plus"
              variant="outlined"
              density="comfortable"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" color="grey" @click="dialogs.map = false">
            {{ t('cancel') }}
          </v-btn>
          <v-btn color="primary" variant="outlined" :disabled="!mapFile && !mapCoordinates" @click="saveMap">
            {{ t('save') }}
          </v-btn>
          <v-btn
              v-if="selectedMapPicture"
              color="red"
              variant="outlined"
              @click="deleteMap"
          >
            {{ t('delete') }}
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- Export Dialog -->
    <v-dialog v-model="dialogs.export" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">{{ t('confirm_export') }}</v-card-title>
        <v-card-text>
          {{ t('confirm_export_organization') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray" @click="dialogs.export = false">{{ t('cancel') }}</v-btn>
          <v-btn color="#FF8C00" @click="confirmExport('json')">{{ t('confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>

import {ref, computed, onMounted, reactive} from 'vue';
import { useI18n } from 'vue-i18n';
import HeaderCommon from '@/components/HeaderCommon.vue';
import api from '@/axiostoastapi.js';
import {maxLength,minimumLength,organizationNameRule} from "@/utils/validationRules.js";
import { HIERARCHY_LEVELS, LEVEL_TYPES, getLevelNumber, getLevelColor, getLevelColorCards, showLocation, colWidth } from '@/constants/organizationHierarchy';
import RecursiveCard from '@/components/RecursiveCard.vue';
import { useTokenStore } from '@/stores/token';
import { useUserOrganizationsStore } from '@/stores/userMapping.js';
import { showSuccess, showError, showWarning } from '@/utils/snackbar';

const userOrgStore = useUserOrganizationsStore();
const accessOrgIds = ref([]);
const tokenStore = useTokenStore();
const username = tokenStore.getUsername();
const { t,locale } = useI18n();
const toggleExpand = (id) => {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id);
  } else {
    expandedItems.value.add(id);
  }
};

const getLocalizedOrganizationPath = (item) => {
  let path = [];
  let currentItem = item;

  while (currentItem) {
    path.unshift(currentItem.translations[locale.value]);
    currentItem = organizations.value.find(org => org.id === currentItem.parentId);
  }

  return path.join(' > ');
};

const getLevelTypeValue = (type) => {return type;};

const levelTypes = computed(() => {
  // For edit mode - just show current level type
  if (editMode.value) {
    const currentLevel = organizations.value.find(org => org.id === editingItem.value?.id)?.levelType;
    return LEVEL_TYPES
        .filter(type => type === currentLevel)
        .map(type => ({
          value: type,
          title: `${t(type.toLowerCase())} / ${type}`
        }));
  }

  // For add organization mode
  if (orgForm.value.parentId) {
    // If parent selected, filter based on parent's level
    const parentOrg = organizations.value.find(org => org.id === orgForm.value.parentId);
    const parentLevelNumber = HIERARCHY_LEVELS[parentOrg.levelType].level;

    return LEVEL_TYPES
        .filter(type => HIERARCHY_LEVELS[type].level > parentLevelNumber)
        .map(type => ({
          value: type,
          title: `${t(type.toLowerCase())} / ${type}`
        }));
  }

  // If no parent selected, show all levels
  return LEVEL_TYPES.map(type => ({
    value: type,
    title: `${t(type.toLowerCase())} / ${type}`
  }));
});

const organizations = ref([]);
const expandedItems = ref(new Set());
const search = ref('');
const selectedLevel = ref(null);
const loading = ref(false);
const dialog = ref(false);
const deleteDialog = ref(false);
const editMode = ref(false);
const valid = ref(false);
const saving = ref(false);
const deleting = ref(false);
const deleteItem = ref(null);
const editingItem = ref(null);
const form = ref(null);

const orgForm = ref({
  parentId: null,
  levelType: '',
  names: {
    en: '',
    th: ''
  },
  longitude: null,
  latitude: null
});

//Only checks if there's no root organization
const isRootLevel = computed(() => !organizations.value.some(org => !org.parent_id));

const availableParents = computed(() => {
  return organizations.value.map(org => ({
    id: org.id,
    name: getItemName(org, 'en')
  }));
});

const fetchOrganizations = async () => {
  console.log("Fetching organizations...");
  loading.value = true;
  try {
    const response = await api.get('/api/organization-hierarchies/table');

    console.log("RESPONSE -TABLE", response);

    organizations.value = response.data;
    assignLevelNumbers(organizations.value);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    showError(t('error_loading_organizations'));
  } finally {
    loading.value = false;
  }
};
const getItemName = (item, langCode) => {
  if (!item || !item.translations) return '-';
  return item.translations[langCode] || '-';
};
const hasChildren = (item) => {
  if (!item) return false;
  return organizations.value.some(org => org.parent_id === item.id);
};
const isExpanded = (id) => {
  return expandedItems.value.has(id);
};

/*
const openAddDialog = () => {
  editMode.value = false;
  editingItem.value = null;

  orgForm.value = {
    id: null,
    parentId: null,
    levelType: 'ORGANIZATION',
    names: { en: '', th: '' },
    longitude: null,
    latitude: null
  };

  dialog.value = true;
};*/
// In PageLocationManagement.vue
const openAddDialog = (parentItem = null) => {

  // Check if parentItem is actually a PointerEvent (from button click)
  const isEvent = parentItem instanceof Event;

  if (isEvent) {
    console.log("openAddDialog called from button click event, treating as root level");
    parentItem = null; // Reset to null if it's an event
  } else {
    console.log("openAddDialog called with parent:", parentItem ?
        `ID: ${parentItem.id}, Type: ${parentItem.levelType}` :
        "No parent (root level)");
  }

  editMode.value = false;
  editingItem.value = null;

  // Special handling for adding root level organization (no parent)
  if (!parentItem) {
    console.log("Adding root organization");

    // Set default values for root organization
    orgForm.value = {
      id: null,
      parentId: null,
      levelType: 'ORGANIZATION', // For root level, default to ORGANIZATION
      names: { en: '', th: '' },
      longitude: null,
      latitude: null
    };

    dialog.value = true;
    return;
  }

  // Handle case where parentItem exists but may be invalid
  if (!parentItem.id) {
    console.error("Parent item missing ID:", parentItem);
    showError(t('invalid_parent_organization'));
    return;
  }

  // Set default values with parent
  orgForm.value = {
    id: null,
    parentId: parentItem.id,
    levelType: '',
    names: { en: '', th: '' },
    longitude: null,
    latitude: null
  };

  // Safety checks and level validation
  if (parentItem.levelType) {
    try {
      const parentLevelType = parentItem.levelType;
      console.log(`Parent organization level type: ${parentLevelType}`);

      if (!HIERARCHY_LEVELS[parentLevelType]) {
        console.error(`Invalid level type: ${parentLevelType}`);
        showError(t('invalid_level_type'));
        return;
      }

      const parentLevel = HIERARCHY_LEVELS[parentLevelType].level;
      console.log(`Parent level number: ${parentLevel}`);

      // Check available child levels
      const availableLevels = LEVEL_TYPES.filter(type =>
          HIERARCHY_LEVELS[type].level > parentLevel
      );

      if (availableLevels.length === 0) {
        showWarning(t('max_hierarchy_level_reached'));
        return;
      }

      console.log("Available child levels:", availableLevels);
    } catch (err) {
      console.error("Error determining parent level:", err);
      showError(t('error_processing_hierarchy'));
      return;
    }
  }

  dialog.value = true;
};

const editItem = (item) => {
  editMode.value = true;
  editingItem.value = item; // Store the entire item being edited
  orgForm.value = {
    id: item.id, // Store the ID in the form
    parentId: item.parent_id,
    levelType: item.levelType,
    names: {
      en: getItemName(item, 'en'),
      th: getItemName(item, 'th')
    },
    longitude: item.longitude,
    latitude: item.latitude
  };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editMode.value = false;
  deleteItem.value = null;

  // Reset form state
  form.value?.reset();

  // Reset org form to initial state
  orgForm.value = {
    parentId: null,
    levelType: '',
    names: {
      en: '',
      th: ''
    }
  };

  // Clear validation state
  valid.value = false;
  saving.value = false;
};

const saveOrganization = async () => {
  if (!form.value?.validate()) return;

  saving.value = true;
  try {
    const payload = {
      hierarchy: {
        parentId: orgForm.value.parentId,
        levelType: getLevelTypeValue(orgForm.value.levelType),
        levelNumber: getLevelNumber(getLevelTypeValue(orgForm.value.levelType))
      },
      names: [
        {
          languageCode: "en",
          name: orgForm.value.names.en.trim(),
          levelNumber: getLevelNumber(getLevelTypeValue(orgForm.value.levelType))
        },
        {
          languageCode: "th",
          name: orgForm.value.names.th.trim(),
          levelNumber: getLevelNumber(getLevelTypeValue(orgForm.value.levelType))
        }
      ],
      longitude: orgForm.value.longitude ? parseFloat(orgForm.value.longitude) : null,
      latitude: orgForm.value.latitude ? parseFloat(orgForm.value.latitude) : null
    };

    console.log(payload);

    //if (editMode.value && deleteItem.value) {
    if (editMode.value && editingItem.value) {
      console.log("Edit Mode");
      console.log(payload);
      console.log(editingItem.value.id)
      //await api.put(`/api/organization-hierarchies/${deleteItem.value.id}`, payload);
      await api.put(`/api/organization-hierarchies/${editingItem.value.id}`, payload);
      showSuccess(t('organization_updated'));
    } else {
      console.log("POST to save");
      console.log(payload);
      await api.post('/api/organization-hierarchies', payload);
      showSuccess(t('organization_created'));
    }

    dialog.value = false;
    await fetchOrganizations();
  } catch (error) {
    console.error('Error saving organization:', error);
    showError(t('error_saving_organization'));
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (item) => {
  deleteItem.value = item;
  deleteDialog.value = true;
};

const deleteOrganization = async () => {
  if (!deleteItem.value || hasChildren(deleteItem.value)) return;

  deleting.value = true;
  console.log('Delete Org: ',deleteItem.value.id);
  try {
    await api.delete(`/api/organization-hierarchies/${deleteItem.value.id}`);
    await fetchOrganizations();
    deleteDialog.value = false;
    showSuccess(t('organization_deleted'));
  } catch (error) {
    console.error('Error deleting organization:', error);
    const backendMessage =
        error?.response?.data?.message || t('error_deleting_organization');

    showError(backendMessage);
  } finally {
    deleting.value = false;
    deleteItem.value = null;
  }
};

const calculateRowSpans = (items, parentId = null) => {
  let result = [];
  const children = items.filter(item => item.parent_id === parentId);

  children.forEach(item => {
    const childCount = countAllChildren(item.id);
    result.push({
      ...item,
      rowSpan: childCount + 1,
      isFirstInGroup: true
    });

    const childResults = calculateRowSpans(items, item.id);
    result = result.concat(childResults.map(child => ({
      ...child,
      isFirstInGroup: false
    })));
  });

  return result;
};

const countAllChildren = (parentId) => {
  const children = organizations.value.filter(item => item.parent_id === parentId);
  let count = children.length;

  children.forEach(child => {
    count += countAllChildren(child.id);
  });

  return count;
};

const assignLevelNumbers = (items, parentId = null, level = 1) => {
  const children = items.filter(item => item.parent_id === parentId);

  children.forEach(child => {
    child.level_number = level;
    assignLevelNumbers(items, child.id, level + 1);
  });
};

// Show all Roots
const rootOrganizations0 = computed(() => {
  return organizations.value.filter(org => !org.parentId);
});
// Filter Root Organization
const rootOrganizations = computed(() => {
  return organizations.value.filter(org =>
      !org.parentId && accessOrgIds.value.includes(org.id)
  );
});
const getChildOrganizations = (parentId) => {
  const directChildren = organizations.value.filter(org => org.parentId === parentId);
  console.log(`Direct children of ${parentId}:`, directChildren);

  let allDescendants = [...directChildren];
  directChildren.forEach(child => {
    const descendants = getChildOrganizations(child.id);
    allDescendants = [...allDescendants, ...descendants];
  });

  return allDescendants;
};

const getFilteredChildren = (parentId) => {
  return organizations.value.filter(org => {
    const matchesParent = org.parentId === parentId;
    const matchesSearch = !search.value ||
        Object.values(org.translations).some(v =>
            v.toLowerCase().includes(search.value.toLowerCase())
        );
    const matchesLevel = !selectedLevel.value ||
        org.levelType === selectedLevel.value;

    return matchesParent && matchesSearch && matchesLevel;
  }).sort((a, b) => a.levelNumber - b.levelNumber);
};

// For checking if item has children
const hasChildrenVisible = (item) => {
  return organizations.value.some(org =>
      org.parentId === item.id &&
      (!selectedLevel.value || org.levelType === selectedLevel.value) &&
      (!search.value || Object.values(org.translations).some(v =>
          v.toLowerCase().includes(search.value.toLowerCase())
      ))
  );
};
// Dialog states
const dialogs = ref({
  installation: false,
  add: false,
  import: false,
  map: false,
  export: false
})

const showImportDialog = () => {
  dialogs.value.import = true
}

// Import Dialog
const selectedFile = ref(null)
const selectedFileName = ref('')
const fileInput = ref(null)
const downloadTemplate = () => {
  const templateUrl = '/templates/excel/Template_OrganizationImport_form.xlsx'
  window.open(templateUrl, '_blank')
}
const selectFile = () => {
  fileInput.value.click()
}
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    selectedFileName.value = file.name
  }
}
const isFileValid = (file) => {
  // Check file type
  const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
  if (!validTypes.includes(file.type)) {
    showError(t('please_upload_an_excel_file'));
    return false
  }
  // Check file size (e.g., max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    showError(t('file_size_should_be_less_than_5MB'));
    return false
  }
  return true
}

const importFile = async () => {
  if (!selectedFile.value) return;
  if (!isFileValid(selectedFile.value)) return;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('username', username);

    // Send POST request to backend
    const response = await api.post('/api/organization-hierarchies/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Handle the response
    const { data } = response;
    // Check if the response is a success or contains errors
    if (response.status === 200) {
      // If success, display success message with details from the backend response
      showSuccess(t('file_saved_successfully') + ": " + data);
    } else if (response.status === 400) {
      // If bad request, display warning with error message from backend
      showError(t('error_during_import') + ": " + data);
    } else {
      // For unexpected errors, show a general failure message
      showError(t('unexpected_error') + ": " + data);
    }

    // Reset the form
    dialogs.value.import = false;
    selectedFile.value = null;
    selectedFileName.value = '';
    await fetchOrganizations();
  } catch (error) {
    // Handle errors (e.g., network issues, server errors)
    console.error(error);
    showError(t('failed_to_save_file'));
  }
};


// MAP --------------------

const selectedMapPicture = ref(null);
const mapFile = ref(null);
const mapPreview = ref(null);
const mapCoordinates = ref(null);
const currentOrganization = ref(null);

const handleMapClick = (event) => {
  console.log(event);
  // Get bounding rectangle of the image
  const rect = event.target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  mapCoordinates.value = { x, y };
  console.log(" Marker moved to:", mapCoordinates.value);
};

const getMarkerStyle = () => {
  if (!mapCoordinates.value) return {};
  return {
    left: `${mapCoordinates.value.x}%`,
    top: `${mapCoordinates.value.y}%`,
    transform: 'translate(-50%, -50%)',
    zIndex: 1
  };
};

const saveMap = async () => {
  if (!currentOrganization.value) return;

  try {
    const formData = new FormData();

    if (mapFile.value) {
      formData.append('file', mapFile.value);
    }

    if (mapCoordinates.value) {
      formData.append('xCoordinate', mapCoordinates.value.x.toString());
      formData.append('yCoordinate', mapCoordinates.value.y.toString());
    }

    formData.append('organizationId', currentOrganization.value.id);

    // If a coordinate already exists, ensure it is included in the request
    if (mapCoordinates.value?.id) {
      formData.append('coordinateId', mapCoordinates.value.id);
    }

    console.log("Sending data:", Object.fromEntries(formData.entries()));
    console.log("Current selectedMapPicture:", selectedMapPicture.value);

    // Check if organization already has a map
    if (selectedMapPicture?.value) {
      // Update existing map
      await api.put(`/api/organization-maps/${currentOrganization.value.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      // Create new map
      await api.post('/api/organization-maps', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }

    showSuccess(t('map_saved_successfully'));
    // **Manually update state to keep the marker & image**
    selectedMapPicture.value = {
      imagePath: mapPreview.value || selectedMapPicture.value?.imagePath,
      xCoordinate: mapCoordinates.value.x,
      yCoordinate: mapCoordinates.value.y
    };

    dialogs.map = false;

    // Reset states
    mapFile.value = null;
    mapPreview.value = null;
    //mapCoordinates.value = null;

  } catch (error) {
    console.error('Error saving map:', error);
    showError(t('error_saving_map'));
  }
};

const handleFileUpload = (event) => {
  if (!event) {
    mapPreview.value = null;
    return;
  }

  const file = event.target?.files?.[0];
  if (!file) return;

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    showError(t('file_too_large', { size: '5MB' }));
    mapFile.value = null;
    return;
  }

  // Check image dimensions
  const img = new Image();
  img.onload = () => {
    if (img.width < 800 || img.height < 450) {
      showError(t('image_too_small', { width: '800px', height: '450px' }));
      mapFile.value = null;
      return;
    }
    if (img.width > 1920 || img.height > 1080) {
      showError(t('image_too_large', { width: '1920px', height: '1080px' }));
      mapFile.value = null;
      return;
    }
    mapFile.value = file;
    mapPreview.value = img.src;
  };

  const reader = new FileReader();
  reader.onload = (e) => {
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const fetchImage = async (imagePath) => {
  try {
    const response = await api.get(`/api/organization-maps/image/${imagePath}`, {
      responseType: "blob", // Fetch as binary blob
    });

    // Convert the binary response to a Blob URL
    const imageUrl = URL.createObjectURL(response.data);
    return imageUrl;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

const manageMap = async (item) => {

  try {
    // Set current organization first
    currentOrganization.value = item;
    // Reset map data before fetching new data
    selectedMapPicture.value = null;
    mapPreview.value = null;
    mapCoordinates.value = null;
    mapFile.value = null;

    const response = await api.get(`/api/organization-maps/${item.id}`);
    console.log(response);

    if (response.data) {
      selectedMapPicture.value = response.data;

      // Fetch the image as a blob and update the imagePath
      const imageUrl = await fetchImage(response.data.imagePath);
      if (imageUrl) {
        selectedMapPicture.value.imagePath = imageUrl;
      }

      mapCoordinates.value = {
        x: response.data.xCoordinate,
        y: response.data.yCoordinate,
      };
      console.log("Updated mapCoordinates:", mapCoordinates.value);
    } else {
      selectedMapPicture.value = null;
      mapCoordinates.value = null;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      showWarning(t('no_map_assigned'));
      selectedMapPicture.value = null;
      mapCoordinates.value = null;
    } else {
      console.error('Error fetching map data:', error);
      showError(t('error_loading_map'));
      selectedMapPicture.value = null;
      mapCoordinates.value = null;
    }
  } finally {
    dialogs.value.map = true;
  }
};

const deleteMap = async () => {
  if (!currentOrganization.value || !selectedMapPicture.value) return;

  const confirmDelete = confirm(t('confirm_delete_map'));
  if (!confirmDelete) return;

  try {
    await api.delete(`/api/organization-maps/${currentOrganization.value.id}`);

    showSuccess(t('map_deleted_successfully'));

    // Reset UI state
    selectedMapPicture.value = null;
    mapCoordinates.value = null;
  } catch (error) {
    console.error('Error deleting map:', error);
    showError(t('error_deleting_map'));
  }
};
const adjustMarkerPosition = () => {
  if (selectedMapPicture.value && selectedMapPicture.value.xCoordinate && selectedMapPicture.value.yCoordinate) {
    mapCoordinates.value = {
      x: selectedMapPicture.value.xCoordinate,
      y: selectedMapPicture.value.yCoordinate
    };
  }
};

// show confirmExport dialog
const showExportDialog = async (format) => {
  console.log(`Export to ${format} format`);
  dialogs.value.export = true
};

const confirmExport = async (format) => {
  console.log("Export to", format);
  try {
    const response = await api.get(`/api/organization-hierarchies/export/${format}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `organization_hierarchy_${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);

    showSuccess(t('export_successful'));
  } catch (error) {
    showError(t('export_failed'));
    console.error(error);
  } finally {
    dialogs.value.export = false;
  }
};

onMounted(async () => {
  try {
    await fetchOrganizations();
    const username = tokenStore.getUsername();
    await userOrgStore.fetchUserOrganizations(username); // Hard code atis_user
    accessOrgIds.value = userOrgStore.organizationAccesses
        .filter(org => userOrgStore.hasAccessToOrganization(org.organizationHierarchyId, 'READ'))
        .map(org => org.organizationHierarchyId);

    console.log('Accessible Organization IDs:', accessOrgIds.value);
  } catch (err) {
    console.error('Error loading user organizations', err);
  }
});

</script>

<style scoped>
/* Hover effect for highlighting */
.hover-highlight:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Expand/Collapse Rotation */
.rotate-90 {
  transform: rotate(90deg);
  transition: transform 0.2s ease-in-out;
}

/* Expanded state background */
.expanded {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Hierarchy level indicator (used for levels in cards) */
.hierarchy-level-indicator {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
  margin-right: 8px;
  font-size: 12px;
  background-color: #e0e0e0;
}

/* Level-based indentation for nested content */
.depth-0 { padding-left: 0; }
.depth-1 { padding-left: 20px; }
.depth-2 { padding-left: 40px; }
.depth-3 { padding-left: 60px; }
.depth-4 { padding-left: 80px; }
.depth-5 { padding-left: 100px; }

/* Animation for expand/collapse transitions */
.hierarchy-content-enter-active,
.hierarchy-content-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 1000px;
  overflow: hidden;
}

.hierarchy-content-enter-from,
.hierarchy-content-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Level chip style for organization type labels */
.level-chip {
  min-width: 100px;
  justify-content: center;
  text-transform: uppercase;
  font-weight: bold;
  border: 1px solid;
  background-color: white !important;
}

/* Improved organization path styling */
.org-path {
  background-color: rgba(0, 0, 0, 0.04);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.87);
  display: inline-block;
  margin-top: 4px;
  border-left: 3px solid rgba(0, 0, 0, 0.12);
}

/* Action buttons with hover effect */
.action-buttons {
  display: flex;
  gap: 8px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.hover-highlight:hover .action-buttons {
  opacity: 1;
}

/* Loading state overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

/* Full path styling within the card */
.full-path {
  font-size: 0.85em;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  display: inline-block;
}

/* Card styling for hierarchy */
.hierarchy-card {
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s ease-in-out;
}

.hierarchy-card:hover {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
}

/* Title styling within the card */
.hierarchy-title {
  font-weight: bold;
  font-size: 1.2rem;
}

/* Location details styling within the card */
.location-details {
  margin-top: 8px;
  font-size: 1rem;
}
.hierarchy-card {
  transition: all 0.3s ease;
}

/* Map portion */
.map-preview-area {
  transition: all 0.3s ease;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.map-image {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
}
.map-preview-area:hover {
  border-color: rgba(0, 0, 0, 0.2);
}

.cursor-pointer {
  cursor: crosshair;  /* Better cursor for placing markers */
}

</style>