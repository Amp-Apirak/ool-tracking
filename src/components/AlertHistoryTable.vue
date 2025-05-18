<template>
  <v-data-table-server
      v-model:page="options.page"
      v-model:items-per-page="options.itemsPerPage"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :items-per-page-options="[5, 10, 25]"
      items-per-page-text="Items per page"
      @update:options="fetchData"
      class="elevation-1 custom-table"
  >
    <template v-slot:item.actions="{ item }">
      <v-btn small icon @click="handleViewDetails(item)">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
    </template>
  </v-data-table-server>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import api from "@/axiostoastapi.js";
import {useI18n} from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps({
  fetchUrl: {
    type: String,
    required: true,
  },
  fetchParams: {
    type: Object,
    default: () => ({}),
  },
});

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  totalItems: 0,
});
const items = ref([]);
const totalItems = ref(0);
const loading = ref(false);

const headers = computed(() => [
  { title: t('image'), key: 'image', sortable: false },
  { title: t('alert_type'), key: 'alertType', sortable: true },
  { title: t('alert_timestamp'), key: 'alertTimestamp', sortable: true },
  { title: t('installation_point_details'), key: 'location', sortable: false },
  { title: t('device_info'), key: 'deviceInfo', sortable: false }
]);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await api.get(props.fetchUrl, {
      params: {
        ...props.fetchParams,
        page: options.value.page - 1,
        size: options.value.itemsPerPage,
      },
    });
    items.value = response.data.content;
    totalItems.value = response.data.totalElements;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<style scoped>
.custom-table {
  background-color: #ffffff !important;
}
</style>
