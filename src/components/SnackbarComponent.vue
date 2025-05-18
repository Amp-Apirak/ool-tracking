<!-- components/SnackbarComponent.vue -->

<template>
  <v-snackbar
      v-model="isVisible"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      :location="snackbar.position"
      :close-on-click="snackbar.dismissible"
  >
    {{ snackbar.text }}
    <template v-slot:actions v-if="snackbar.dismissible">
      <v-btn
          variant="text"
          @click="isVisible = false"
      >
        {{ t('close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { snackbar, hideSnackbar } from '@/utils/snackbar';

const { t } = useI18n();

const isVisible = computed({
  get: () => snackbar.show,
  set: (value) => {
    if (!value) {
      hideSnackbar();
    }
  }
});

</script>
