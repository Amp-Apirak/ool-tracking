<!-- MapViewer.vue -->

<template>
    <div v-if="isVisible" class="map-viewer-container">
      <!-- Title Bar -->
      <div class="map-title-bar">
        <h2 class="map-title">
          {{ props.propsCallerType === 'alert' ? t('alert_location') : t('last_seen_location') }}
        </h2>
      </div>
      <!-- Just the map with minimal controls -->
      <div class="map-wrapper">
        <!-- Loading State -->
        <template v-if="loading">
          <div class="d-flex justify-center align-center h-100">
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
        </template>
        <!-- Error State -->
        <template v-else-if="error">
          <div class="d-flex flex-column align-center justify-center h-100">
            <v-icon color="error" size="32" class="mb-2">mdi-alert-circle</v-icon>
            <div class="text-error text-center mb-2">{{ t('errors.fetchFailed') }}</div>
            <v-btn color="error" variant="text" size="small" @click="fetchMapData">{{ t('common.retry') }}</v-btn>
          </div>
        </template>
        <!-- Map Display -->
        <template v-else-if="mapUrl">
          <div class="map-container" id="organization-map-container">
            <img :src="mapUrl"
                 class="organization-map"
                 alt="Organization Map"
                 @load="onMapImageLoad"/>
            <!-- Tag Marker -->
            <div v-if="tagPosition"
                 class="tag-marker"
                 :style="getTagMarkerStyle"
                 @click="openMarkerDialog"
                 title="Click for details"
            >
              <v-icon color="red" size="64" class="status-active">mdi-map-marker-radius</v-icon>
            </div>
          </div>
        </template>
        <!-- No Map State -->
        <template v-else-if="noMapAvailable">
          <div class="d-flex flex-column align-center justify-center h-100">
            <v-icon size="32" color="grey">mdi-map-outline</v-icon>
            <div class="text-grey text-center mt-2">{{ t('no_map_available') }}</div>
          </div>
        </template>
      </div>
      <!-- Minimal controls -->
      <div class="map-controls">
        <v-btn icon color="white" @click="close" class="close-btn"><v-icon>mdi-close</v-icon></v-btn>
      </div>
    </div>

  <v-dialog
      v-model="showMarkerDialog"
      max-width="650px"
      persistent
      :z-index="10002"
      :scrim-z-index="10001"
      content-class="map-marker-dialog"
  >
    <v-card class="location-detail-card">
      <v-card-title class="location-card-title">
        <v-icon color="primary" class="me-2">mdi-map-marker-radius</v-icon>
        <span>{{ props.propsCallerType === 'alert' ? t('alert_location') : t('last_seen_location') }}</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="showMarkerDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="location-card-content">


        <div class="detail-row">
          <div class="detail-label">{{ t('reader') }}:</div>
          <div class="detail-value highlight-text">{{ props.propsReaderSerialNumber || 'N/A' }}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">{{ t('note') }}:</div>
          <div class="detail-value highlight-text">{{ readerNotes || 'N/A' }}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">RFID:</div>
          <div class="detail-value">{{ props.propsRfidNumber || 'N/A' }}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">{{ t('supply') }}:</div>
          <div class="detail-value">{{ props.propsSupplyNumber || 'N/A' }}</div>
        </div>

        <v-divider class="my-3"></v-divider>

        <!-- Hierarchy section -->
        <div class="hierarchy-section">
          <div class="hierarchy-title">
            <v-icon color="primary" size="small" class="me-1">mdi-office-building-marker</v-icon>
            {{ t('hierarchy') }}
          </div>

          <div v-if="hierarchyItems.length > 0">
            <div v-for="(item, index) in hierarchyItems"
                 :key="index"
                 class="hierarchy-item">
              <div class="hierarchy-level">{{ item.key }}:</div>
              <div class="hierarchy-value">{{ item.value }}</div>
            </div>
          </div>

          <div v-else class="text-center text-grey mt-2">
            {{ t('no_hierarchy_information') }}
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="location-card-actions">
        <v-spacer></v-spacer>
        <v-btn
            color="primary"
            variant="tonal"
            @click="showMarkerDialog = false"
            class="close-btn"
        >
          {{ t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup>
import { computed, onMounted, ref, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import api from "@/axiostoastapi.js";
const showMarkerDialog = ref(false);
const { t, locale } = useI18n();
const props = defineProps({
  isVisible: Boolean,
  propsSupplyId: String,
  propsSupplyNumber: String,
  propsRfidNumber: String,
  propsReaderSerialNumber: String,
  propsReaderData: {
    type: Object,
    required: false,
    default: () => ({})
  },
  propsCallerType: {
    type: String,
    required: true,
    validator: (val) => ['alert', 'armory'].includes(val)
  }
});

const emit = defineEmits(['update:isVisible', 'close']);
const loading = ref(false);
const error = ref(false);           // 500
const noMapAvailable = ref(false);  // 404
const mapUrl = ref(null);           // 200
const tagPosition = ref(null);
const currentOrgName = ref('');
const close = () => {
  emit('update:isVisible', false);
  emit('close');
};
const openMarkerDialog = () => {
  showMarkerDialog.value = true;
  console.log("Dialog opened", showMarkerDialog.value);
};
const getTagMarkerStyle = computed(() => {
  try {
    if (!tagPosition.value) return { display: 'none' };
    const mapImage = document.querySelector('#organization-map-container .organization-map');
    if (!mapImage || !mapImage.complete || !mapImage.naturalWidth) return { display: 'none' };
    const container = mapImage.parentElement;
    const containerRect = container.getBoundingClientRect();
    const imgRect = mapImage.getBoundingClientRect();
    const imgRatio = mapImage.naturalWidth / mapImage.naturalHeight;
    const containerRatio = containerRect.width / containerRect.height;

    let offsetX = 0, offsetY = 0, scaledWidth, scaledHeight;

    if (imgRatio > containerRatio) {
      scaledWidth = imgRect.width;
      scaledHeight = imgRect.width / imgRatio;
      offsetY = (imgRect.height - scaledHeight) / 2;
    } else {
      scaledHeight = imgRect.height;
      scaledWidth = imgRect.height * imgRatio;
      offsetX = (imgRect.width - scaledWidth) / 2;
    }

    const scaleX = scaledWidth / mapImage.naturalWidth;
    const scaleY = scaledHeight / mapImage.naturalHeight;
    const pixelX = (tagPosition.value.x * scaleX) + offsetX;
    const pixelY = (tagPosition.value.y * scaleY) + offsetY;
    const percentX = (pixelX / imgRect.width) * 100;
    const percentY = (pixelY / imgRect.height) * 100;

    console.log(`[Marker] tag=(${tagPosition.value.x}, ${tagPosition.value.y}) | scale=(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}) | offset=(${offsetX}, ${offsetY}) | pixel=(${pixelX.toFixed(1)}, ${pixelY.toFixed(1)}) | percent=(${percentX.toFixed(1)}%, ${percentY.toFixed(1)}%)`);

    return {
      position: 'absolute',
      left: `${percentX}%`,
      top: `${percentY}%`,
      transform: 'translate(-50%, -50%)',
      zIndex: 2
    };
  } catch (err) {
    console.error('Error calculating marker style:', err);
    return { display: 'none' };
  }
});
const fetchMapData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const isAlertMode = props.propsCallerType === 'alert';
    console.log('MAP IS Alert Mode: ',isAlertMode);
    console.log('MAP SupplyId: ',props.propsSupplyId);
    console.log('MAP Supply Number: ',props.propsSupplyNumber);
    console.log('MAP RFID Number: ',props.propsRfidNumber);
    console.log('MAP Reader SN: ',props.propsReaderSerialNumber);
    const mapEndpoint = isAlertMode
        ? `/api/alert/image/${props.propsReaderSerialNumber}`
        : `/api/rfid_tags_tracking_V2/image/${props.propsRfidNumber}`;
    const mapResponse = await api.get(mapEndpoint, { responseType: 'blob' });
    if (mapResponse.status === 200) {
      if (mapUrl.value) URL.revokeObjectURL(mapUrl.value);
      mapUrl.value = URL.createObjectURL(mapResponse.data);
      await fetchTagPosition();
    }
  } catch (mapError) {
    if(mapError.response && mapError.response.status === 404) {
      console.warn("Map not found, please upload one.");
      noMapAvailable.value = true;
    } else {
      console.error("Error fetching map image:", mapError);
      error.value = true;
    }
    mapUrl.value = null;
  } finally {
    loading.value = false;
  }
};
const fetchTagPosition = async () => {
  try {
    const isAlertMode = props.propsCallerType === 'alert';
    console.log('COORDINATE IS Alert Mode: ',isAlertMode);
    console.log('COORDINATE SupplyId: ',props.propsSupplyId);
    console.log('COORDINATE Supply Number: ',props.propsSupplyNumber);
    console.log('COORDINATE RFID Number: ',props.propsRfidNumber);
    console.log('COORDINATE Reader SN: ',props.propsReaderSerialNumber);
    const endpoint = isAlertMode
        ? `/api/alert/coordinates/${props.propsReaderSerialNumber}`
        : `/api/rfid_tags_tracking_V2/coordinates/${props.propsRfidNumber}`;
    const response = await api.get(endpoint);
    console.log('COORDINATE: ',response);
    if (response.status === 200 && response.data) {
      tagPosition.value = {
        x: response.data.xCoordinate,
        y: response.data.yCoordinate,
      };
      console.log('Tag Position Pixel X:',tagPosition.value.x);
      console.log('Tag Position Pixel Y:',tagPosition.value.y);
    } else {
      tagPosition.value = null;
    }
  } catch (error) {
    console.error("Error fetching tag position:", error);
    tagPosition.value = null;
  }
};
const onMapImageLoad = (event) => {
  if (tagPosition.value) {
    // Force marker recalculation
    tagPosition.value = { ...tagPosition.value };
  }
};
const hierarchyItems = computed(() => {
  const items = [];
  const levelOrder = [
    'ORGANIZATION', 'ARMORY', 'BUILDING', 'FLOOR',
    'ZONE', 'ROOM', 'PARTITION', 'SHELF', 'SLOT'
  ];
  try {
    if (!props.propsReaderData) return items;
    if (props.propsReaderData.hierarchyTranslations) {
      console.log("Processing Armory format:", props.propsReaderData.hierarchyTranslations);
      levelOrder.forEach(level => {
        const val = props.propsReaderData.hierarchyTranslations[level];
        if (val && val !== 'null') {
          items.push({
            key: t(level.toLowerCase()),
            value: getTranslatedValue(val)
          });
        }
      });
    }
    else if (props.propsReaderData.hierarchy?.hierarchyLevels) {
      console.log("Processing Alert format:", props.propsReaderData.hierarchy.hierarchyLevels);
      Object.entries(props.propsReaderData.hierarchy.hierarchyLevels || {}).forEach(([key, level]) => {
        if (level && level.translations) {
          let value = '-';
          try {
            const currentLocale = locale.value || 'en';
            value = level.translations[currentLocale] ||
                level.translations.en ||
                level.translations.th ||
                '-';
          } catch (e) {
            console.warn(`Error getting translation for ${key}:`, e);
          }
          items.push({
            key: t(key.toLowerCase()),
            value: value
          });
        }
      });
    }
    console.log("Processed hierarchy items:", items);
    return items;
  } catch (error) {
    console.error("Error processing hierarchy items:", error);
    return [];
  }
});
const getTranslatedValue = (value) => {
  try {
    if (!value) return '-';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if (value.th && locale.value === 'th') return value.th;
      if (value.en) return value.en;
      if (value.th) return value.th;
    }
    return '-';
  } catch (e) {
    console.warn(`Error getting translated value`, e);
    return '-';
  }
};

const readerNotes = ref(null);
const isLoadingNotes = ref(false);
const fetchReaderNotes = async () => {
  isLoadingNotes.value = true;
  try {
      const readerSerialNumber = props.propsReaderSerialNumber;
      console.log('Reader Serial Number: ',readerSerialNumber);
      const notesResponse = await api.get(`/api/rfid_readers/serial_number/${readerSerialNumber}/notes`);
      if (notesResponse.status === 200) {
        readerNotes.value = notesResponse.data;
      } else {
        readerNotes.value = null;
      }
      console.log('Reader Note: ',readerNotes.value);
  } catch (error) {
    console.error("Error fetching reader notes:", error);
    readerNotes.value = null;
  } finally {
    isLoadingNotes.value = false;
  }
};

watch(() => props, (newProps) => {
  if (props.isVisible) {
    console.log('MapViewer received props:', {
      callerType: props.propsCallerType,
      supplyId: props.propsSupplyId,
      supplyNumber: props.propsSupplyNumber,
      rfidNumber: props.propsRfidNumber,
      readerSerialNumber: props.propsReaderSerialNumber
    });
    console.log('ReaderData structure:', props.propsReaderData);
  }
}, { deep: true });

watch(() => props.isVisible, (visible) => {
  if (visible) {
    fetchMapData();
    fetchReaderNotes();
  } else {
    if (mapUrl.value) {
      URL.revokeObjectURL(mapUrl.value);
      mapUrl.value = null;
    }
    tagPosition.value = null;
    currentOrgName.value = '';
  }
}, { immediate: true });

let resizeTimeout = null;
const handleResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (tagPosition.value) {
      tagPosition.value = { ...tagPosition.value };
    }
  }, 100);
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (resizeTimeout) clearTimeout(resizeTimeout);
  if (mapUrl.value) {
    URL.revokeObjectURL(mapUrl.value);
    mapUrl.value = null;
  }
});
</script>

<style scoped>
.map-title-bar {
  background-color: #2c3e50;
  color: white;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.map-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
}
:deep(.map-marker-dialog) {
  z-index: 10002 !important;
}
:deep(.v-overlay__scrim) {
  z-index: 10001 !important;
}
.map-viewer-container {
  position: fixed;
  top: 100px;
  bottom: 100px;
  left: 0;
  right: 0;
  width: 100vw;
  z-index: 9999;
  background-color: #e6e5e5;
  display: flex;
  flex-direction: column;
}
.map-wrapper {
  width: 100%;
  height: calc(100% - 56px);
  display: flex;
  justify-content: center;
  align-items: center;
}
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.organization-map {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.tag-marker {
  position: absolute;
  z-index: 2;
  animation: blink 2s infinite;
}
.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}
.close-btn {
  background-color: rgb(179, 177, 177) !important;
  backdrop-filter: blur(2px);
}
.location-detail-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
}
.location-card-title {
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  padding: 16px 20px;
}
.location-card-content {
  padding: 20px !important;
}
.detail-row {
  display: flex;
  margin-bottom: 12px;
  align-items: baseline;
}
.detail-label {
  font-weight: 600;
  color: #546E7A;
  width: 120px;
  flex-shrink: 0;
}
.detail-value {
  color: #263238;
  flex-grow: 1;
}
.highlight-text {
  color: #1976D2;
  font-weight: 500;
}
.hierarchy-section {
  margin-top: 8px;
}
.hierarchy-title {
  font-weight: 600;
  color: #37474F;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.hierarchy-item {
  display: flex;
  margin-bottom: 8px;
  align-items: baseline;
  padding-left: 8px;
}
.hierarchy-level {
  font-weight: 500;
  color: #546E7A;
  width: 140px;
  flex-shrink: 0;
}
.hierarchy-value {
  color: #263238;
}
.location-card-actions {
  padding: 12px 20px 16px !important;
}
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(1); opacity: 0.5; }
}
/* For accessibility */
.d-flex {
  display: flex;
}
.justify-center {
  justify-content: center;
}
.align-center {
  align-items: center;
}
.flex-column {
  flex-direction: column;
}
.text-center {
  text-align: center;
}
.h-100 {
  height: 100%;
}
.mb-2 {
  margin-bottom: 8px;
}
.text-error {
  color: #ff5252;
}
</style>