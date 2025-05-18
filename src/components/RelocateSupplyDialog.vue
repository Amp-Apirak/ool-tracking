<!-- RelocateSupplyDialog.vue -->

<template>
  <v-dialog v-model="dialogModel" max-width="900">
    <v-card>
      <v-card-title class="text-h5" :class="isCancel ? 'warning white--text pa-4' : 'primary white--text pa-4'">
        <template v-if="isCancel">
          {{ t('cancel_relocation') }}
        </template>
        <template v-else>
          {{ relocationType === 'internal' ? t('relocate_supply') : t('requisition_out_supply') }}
        </template>
      </v-card-title>

      <v-card-text class="pt-4">
        <!-- Status alert banner for cancellation -->
        <v-alert
            v-if="isCancel"
            type="warning"
            class="mb-4"
            variant="outlined"
            elevation="2"
            density="compact"
        >
          {{ t('cancel_relocation_warning') }}
        </v-alert>

        <!-- Basic info -->
        <v-card outlined class="pa-3 mb-4">
          <v-row>
            <v-col cols="12" md="6">
              <strong>{{ t('supply_number') }}:</strong> {{ supply?.supplyNumber }}
            </v-col>
            <v-col cols="12" md="6">
              <strong>{{ t('rfid_tag') }}:</strong> {{ supply?.rfidTagId }}
            </v-col>
            <v-col cols="12" md="6">
              <strong>{{ t('supply_name') }}:</strong> {{ supply?.supplyName }}
            </v-col>
            <v-col cols="12" md="6">
              <strong>{{ t('supply_type') }}:</strong> {{ supply?.supplyType }}
            </v-col>
            <v-col v-if="isCancel" cols="12" md="6">
              <strong>{{ t('status') }}:</strong> {{ supply?.requisitionStatus }}
            </v-col>
          </v-row>
        </v-card>

        <!-- Relocation Type Selection - Only show if not cancelling -->
        <div v-if="!isCancel" class="relocation-type-selection my-4">
          <v-btn-toggle
              v-model="relocationType"
              color="primary"
              mandatory
              density="comfortable"
              rounded="pill"
              variant="elevated"
          >
            <v-btn value="internal" class="px-6">
              <v-icon start>mdi-swap-horizontal</v-icon>
              {{ t('internal_relocation') }}
            </v-btn>
            <v-btn value="external" class="px-6">
              <v-icon start>mdi-logout-variant</v-icon>
              {{ t('external_requisition') }}
            </v-btn>
          </v-btn-toggle>
        </div>

        <v-divider v-if="!isCancel" class="my-4"></v-divider>

        <!-- Internal relocation - New Location Selection -->
        <template v-if="relocationType === 'internal' && !isCancel">
          <div class="text-h6 mb-2">{{ t('select_new_location') }}</div>
          <OrganizationHierarchySelect
              v-model="newLocation"
              :organization-hierarchy="organizationHierarchy"
              context="relocate"
              :hide-details="false"
          />
        </template>

        <!-- External requisition form -->
        <template v-if="relocationType === 'external' && !isCancel">
          <div class="text-h6 mb-2">{{ t('requisition_details') }}</div>
          <v-row>
            <v-col cols="12">
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="requisitionDetails.requisitionBy"
                  :label="t('requisition_by')"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  :disabled="isProcessing"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="requisitionDetails.requisitionDate"
                  :label="t('requisition_date')"
                  type="datetime-local"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  :disabled="isProcessing"
              ></v-text-field>
            </v-col>
          </v-row>
        </template>

        <!-- Common fields for both types -->
        <v-row v-if="!isCancel">
          <v-col cols="12">
            <v-textarea
                v-model="remarks"
                :label="t('remarks')"
                variant="outlined"
                rows="3"
                :disabled="isProcessing"
            ></v-textarea>
          </v-col>
        </v-row>

        <!-- Cancellation remarks field -->
        <v-row v-if="isCancel">
          <v-col cols="12">
            <v-textarea
                v-model="cancelRemarks"
                :label="t('cancel_remarks')"
                variant="outlined"
                rows="3"
                :disabled="isProcessing"
                :placeholder="t('please_provide_reason_for_cancellation')"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="outlined" @click="closeDialog" :disabled="isProcessing" class="mr-4">
          {{ t('close') }}
        </v-btn>
        <v-btn
            :color="isCancel ? 'warning' : 'primary'"
            :loading="isProcessing"
            :disabled="!isValid"
            @click="handleSubmit"
        >
          <template v-if="isCancel">
            {{ t('confirm_cancel_relocation') }}
          </template>
          <template v-else>
            {{ relocationType === 'internal' ? t('relocate') : t('requisition_out') }}
          </template>
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <template v-if="isCancel">
            {{ t('confirm_cancel_relocation') }}
          </template>
          <template v-else>
            {{ relocationType === 'internal' ? t('confirm_relocation') : t('confirm_requisition') }}
          </template>
        </v-card-title>
        <v-card-text>
          <template v-if="isCancel">
            <p>{{ t('cancel_relocation_confirmation_text') }}</p>
          </template>
          <template v-else>
            <p v-if="relocationType === 'internal'">
              {{ t('relocation_confirmation_text') }}
            </p>
            <p v-else>
              {{ t('requisition_confirmation_text') }}
            </p>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text="" @click="showConfirmDialog = false">
            {{ t('cancel') }}
          </v-btn>
          <v-btn :color="isCancel ? 'warning' : 'primary'" text="" @click="proceedWithAction">
            {{ t('confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import OrganizationHierarchySelect from '@/components/OrganizationHierarchySelect.vue';
import { useI18n } from 'vue-i18n';
import api from '@/axiostoastapi.js';
import { useTokenStore } from "@/stores/token.js";
import { showError, showSuccess, showWarning } from '@/utils/snackbar.js'

const props = defineProps({
  show: Boolean,
  supply: Object,
  organizationHierarchy: Array,
});
const emit = defineEmits(['close', 'relocated', 'canceled']);
const { t } = useI18n();
const tokenStore = useTokenStore();
const username = tokenStore.getUsername();
const dialogModel = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) emit('close');
  }
});
const relocationType = ref('internal');
const isProcessing = ref(false);
const showConfirmDialog = ref(false);
const remarks = ref('');
const cancelRemarks = ref('');
const isCancel = ref(false);
const newLocation = ref({
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
const requisitionDetails = ref({
  reason: '',
  requisitionBy: username || '',
  requisitionDate: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:MM
});
const rules = {
  required: value => !!value || t('field_required'),
};
const isValid = computed(() => {
  if (isCancel.value) {
    return true; // No validation needed for cancellation, or you can require cancelRemarks
  } else if (relocationType.value === 'internal') {
    return newLocation.value.organizationId !== null;
  } else {
    return !!requisitionDetails.value.requisitionBy &&
        !!requisitionDetails.value.requisitionDate;
  }
});
const checkSupplyStatus = () => {
  if (props.supply) {
    const status = props.supply.requisitionStatus || '';
    isCancel.value = status.toUpperCase() === 'REQUISITIONED';
    console.log('Supply status check:', status, 'isCancel:', isCancel.value);
    resetForm();
  }
};
watch(() => props.show, (newVal) => {
  if (newVal) {
    checkSupplyStatus();
  }
});
watch(() => props.supply, () => {
  if (props.show) {
    checkSupplyStatus();
  }
}, { deep: true });
onMounted(() => {
  if (props.show && props.supply) {
    checkSupplyStatus();
  }
});
const resetForm = () => {
  relocationType.value = 'internal';
  remarks.value = '';
  cancelRemarks.value = '';
  newLocation.value = {
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
  requisitionDetails.value = {
    reason: '',
    requisitionBy: username || '',
    requisitionDate: new Date().toISOString().slice(0, 16),
  };
};
const closeDialog = () => {
  if (isProcessing.value) return;
  emit('close');
};
const handleSubmit = () => {
  if (!isValid.value) {
    showWarning(t('please_fill_required_fields'), { position: 'top', timeout: 2000 });
    return;
  }
  showConfirmDialog.value = true;
};
const proceedWithAction = async () => {
  showConfirmDialog.value = false;
  isProcessing.value = true;
  try {
    if (isCancel.value) {
      await handleCancellation();
      showSuccess(t('relocation_canceled_successfully'), { position: 'top', timeout: 2000 });
      emit('canceled');
      closeDialog();
    } else if (relocationType.value === 'internal') {
      await handleInternalRelocation();
      showSuccess(t('supply_relocated_successfully'), { position: 'top' , timeout: 2000 });
      emit('relocated');
      closeDialog();
    } else {
      await handleExternalRequisition();
      showSuccess(t('supply_requisitioned_out_successfully'), { position: 'top' , timeout: 2000 });
      emit('relocated');
      closeDialog();
    }
  } catch (err) {
    console.error(
        isCancel.value
            ? 'Cancellation failed:'
            : (relocationType.value === 'internal'
                ? 'Relocation failed:'
                : 'Requisition failed:'),
        err
    );

    showError(
        isCancel.value
            ? t('cancellation_failed')
            : (relocationType.value === 'internal'
                ? t('relocation_failed')
                : t('requisition_out_failed')),
        { position: 'top' , timeout: 2000 }
    );
  } finally {
    isProcessing.value = false;
  }
};
const handleInternalRelocation = async () => {
  const relocationRequest = {
    // Target location IDs
    targetOrganizationId: newLocation.value.organizationId,
    targetArmoryId: newLocation.value.armoryId || null,
    targetBuildingId: newLocation.value.buildingId || null,
    targetFloorId: newLocation.value.floorId || null,
    targetZoneId: newLocation.value.zoneId || null,
    targetRoomId: newLocation.value.roomId || null,
    targetPartitionId: newLocation.value.partitionId || null,
    targetShelfId: newLocation.value.shelfId || null,
    targetSlotId: newLocation.value.slotId || null,
    // Additional info
    remarks: remarks.value,
    relocatedBy: username || '',
    relocatedDate: new Date().toISOString()
  };
  console.log('Requisition internal supplyID: ',props.supply.id);
  console.log('Relocation internal payload: ',relocationRequest);
  // Call the API
  await api.put(`/api/suppl_relocation/${props.supply.id}/relocate`, relocationRequest);
};
const handleExternalRequisition = async () => {
  const requisitionOutRequest = {
    requisitionReason: requisitionDetails.value.reason,
    requisitionBy: requisitionDetails.value.requisitionBy,
    requisitionDate: requisitionDetails.value.requisitionDate,
    remarks: remarks.value
  };
  console.log('Requisition external supplyID: ',props.supply.id);
  console.log('Relocation external payload: ',requisitionOutRequest);
  // Call the API
  await api.put(`/api/suppl_relocation/${props.supply.id}/requisition-out`, requisitionOutRequest);
};
const handleCancellation = async () => {
  console.log('Cancelling relocation for supplyID: ', props.supply.id);
  // Call the API with cancel remarks if needed
  await api.put(`/api/suppl_relocation/${props.supply.id}/cancel-relocation`, {
    remarks: cancelRemarks.value
  });
};
</script>

<style scoped>
.v-card-title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>