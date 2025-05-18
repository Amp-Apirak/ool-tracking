<!-- LocationDialog.vue -->

<template>
  <v-dialog v-model="show" width="80%" persistent scrollable>
    <v-card v-if="show">
      <v-toolbar flat color="primary">
        <v-toolbar-title class="text-h5 white--text">{{ t('location_details') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text
          style="height: calc(80vh - 120px);
          overflow-y: auto;"
          class="location-image-container"
      >
        <v-img :src="mapImageUrl"
               contain v-if="mapImageUrl"
               aspect-ratio="16/9"
               height="100%"

        >
          <!-- Blinking Red Dot Marker -->
          <div
              class="marker"
              :style="{
              top: `${yCoordinate}%`,
              left: `${xCoordinate}%`
            }"
          ></div>
        </v-img>
        <div v-else class="text-center">{{ t('no_map_available') }}</div>
      </v-card-text>


      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeDialog">{{ t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {ref, watch, computed, onMounted} from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/axiostoastapi.js';  // Update the path as needed

const { t } = useI18n();
const props = defineProps({
  modelValue: Boolean,
  organizationId: String,  // Pass the root organization UUID as a prop
});

const emit = defineEmits(['update:modelValue']);
const mapImageUrl = ref(null);

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
// Coordinates (0-100) to position the red dot
const xCoordinate = ref(50); // Initial x-coordinate (percentage)
const yCoordinate = ref(50); // Initial y-coordinate (percentage)

// Example function to update the coordinates (replace with real logic)
const updateCoordinates = (newX, newY) => {
  xCoordinate.value = newX;
  yCoordinate.value = newY;
};

const fetchImage = async (organizationId) => {
  console.log('Fetching image for organization UUID:', organizationId); // Log organization UUID
  try {
    const response = await api.get(`/api/organization-maps/org/${organizationId}`, { responseType: 'blob' });
    mapImageUrl.value = URL.createObjectURL(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      mapImageUrl.value = null;
    } else {
      console.error('Error fetching map:', error);
    }
  }
};


onMounted(() => {
  console.log('LocationDialog mounted');
  fetchImage(props.organizationId);
});
// Optional: Keep the watch to handle dynamic changes if needed
watch(() => props.organizationId, (newId) => {
  console.log('organizationId changed to:', newId);
  fetchImage(newId);
});

const closeDialog = () => {
  emit('update:modelValue', false);
};
</script>
<style scoped>
.location-image-container {
  height: 400px; /* Adjust desired height */
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  overflow: hidden;
}
.location-image {
  position: relative;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
}
.marker {
  position: absolute;
  width: 25px;
  height: 25px;
  background-color: red;
  border-radius: 50%;
  animation: blink 1s infinite;
  transform: translate(-50%, -50%); /* Center the marker */
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