<!-- OrganizationHierarchySelectForAlertPage.vue -->

<template>
  <v-row>
    <!-- Organization -->
    <v-col cols="3">
      <v-select
          v-model="localData.organizationId"
          :items="organizationOptions"
          :label="t('organization')"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          :hide-details="hideDetails"
          @update:model-value="value => handleHierarchyChange('ORGANIZATION', value)"
      ></v-select>
    </v-col>

    <!-- Rest of hierarchy (half width) -->
    <v-col cols="12" md="3">
      <v-select
          v-model="localData.armoryId"
          :items="armoryOptions"
          :label="t('armory')"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          :hide-details="hideDetails"
          @update:model-value="value => handleHierarchyChange('ARMORY', value)"
      ></v-select>
    </v-col>

    <v-col cols="12" md="3">
      <v-select
          v-model="localData.buildingId"
          :items="buildingOptions"
          :label="t('building')"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          :hide-details="hideDetails"
          @update:model-value="value => handleHierarchyChange('BUILDING', value)"
      ></v-select>
    </v-col>

    <v-col cols="12" md="3">
      <v-select
          v-model="localData.floorId"
          :items="floorOptions"
          :label="t('floor')"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          :hide-details="hideDetails"
          @update:model-value="value => handleHierarchyChange('FLOOR', value)"
      ></v-select>
    </v-col>

    <v-col cols="12" md="3">
      <v-select
          v-model="localData.zoneId"
          :items="zoneOptions"
          :label="t('zone')"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          :hide-details="hideDetails"
          @update:model-value="value => handleHierarchyChange('ZONE', value)"
      ></v-select>
    </v-col>

    <v-col cols="12" md="3">
      <v-select
          v-model="localData.roomId"
          :items="roomOptions"
          :label="t('room')"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          :hide-details="hideDetails"
          @update:model-value="value => handleHierarchyChange('ROOM', value)"
      ></v-select>
    </v-col>

    <v-col cols="12" md="2">
      <v-select
          v-model="localData.partitionId"
          :items="partitionOptions"
          :label="t('partition')"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          :hide-details="hideDetails"
          @update:model-value="value => handleHierarchyChange('PARTITION', value)"
      ></v-select>
    </v-col>

    <v-col cols="12" md="2">
      <v-select
          v-model="localData.shelfId"
          :items="shelfOptions"
          :label="t('shelf')"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          :hide-details="hideDetails"
          @update:model-value="value => handleHierarchyChange('SHELF', value)"
      ></v-select>
    </v-col>

    <v-col cols="12" md="2">
      <v-select
          v-model="localData.slotId"
          :items="slotOptions"
          :label="t('slot')"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          :hide-details="hideDetails"
          @update:model-value="value => handleHierarchyChange('SLOT', value)"
      ></v-select>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  organizationHierarchy: {
    type: Array,
    required: true
  },
  context: {
    type: String,
    required: true,
    validator: (value) => ['search', 'dialog'].includes(value)
  },
  hideDetails: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'hierarchyChange']);
const { t, locale } = useI18n();

const localData = ref({
  organizationId: props.modelValue?.organizationId || null,
  armoryId: props.modelValue?.armoryId || null,
  buildingId: props.modelValue?.buildingId || null,
  floorId: props.modelValue?.floorId || null,
  zoneId: props.modelValue?.zoneId || null,
  roomId: props.modelValue?.roomId || null,
  partitionId: props.modelValue?.partitionId || null,
  shelfId: props.modelValue?.shelfId || null,
  slotId: props.modelValue?.slotId || null
});
// Helper function to find children in hierarchy
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
  return searchChildren(props.organizationHierarchy);
};

// Computed properties for hierarchy options
const organizationOptions = computed(() => {
  return props.organizationHierarchy
      .filter(org => org.levelType === "ORGANIZATION")
      .map(org => ({
        value: org.id,
        title: locale.value === "th" ? org.translations.th : org.translations.en
      }));
});

const armoryOptions = computed(() => {
  if (!localData.value.organizationId) return [];
  return findChildren(localData.value.organizationId, "ARMORY").map(armory => ({
    value: armory.id,
    title: locale.value === "th" ? armory.translations.th : armory.translations.en
  }));
});

const buildingOptions = computed(() => {
  const parentId = localData.value.armoryId || localData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "BUILDING").map(building => ({
    value: building.id,
    title: locale.value === "th" ? building.translations.th : building.translations.en
  }));
});

const floorOptions = computed(() => {
  const parentId = localData.value.buildingId || localData.value.armoryId || localData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "FLOOR").map(floor => ({
    value: floor.id,
    title: locale.value === "th" ? floor.translations.th : floor.translations.en
  }));
});

const zoneOptions = computed(() => {
  const parentId = localData.value.floorId || localData.value.buildingId || localData.value.armoryId || localData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "ZONE").map(zone => ({
    value: zone.id,
    title: locale.value === "th" ? zone.translations.th : zone.translations.en
  }));
});

const roomOptions = computed(() => {
  const parentId = localData.value.zoneId || localData.value.floorId || localData.value.buildingId || localData.value.armoryId || localData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "ROOM").map(room => ({
    value: room.id,
    title: locale.value === "th" ? room.translations.th : room.translations.en
  }));
});

const partitionOptions = computed(() => {
  const parentId = localData.value.roomId || localData.value.zoneId || localData.value.floorId || localData.value.buildingId || localData.value.armoryId || localData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "PARTITION").map(partition => ({
    value: partition.id,
    title: locale.value === "th" ? partition.translations.th : partition.translations.en
  }));
});

const shelfOptions = computed(() => {
  const parentId = localData.value.partitionId || localData.value.roomId || localData.value.zoneId || localData.value.floorId || localData.value.buildingId || localData.value.armoryId || localData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "SHELF").map(shelf => ({
    value: shelf.id,
    title: locale.value === "th" ? shelf.translations.th : shelf.translations.en
  }));
});

const slotOptions = computed(() => {
  const parentId = localData.value.shelfId || localData.value.partitionId || localData.value.roomId || localData.value.zoneId || localData.value.floorId || localData.value.buildingId || localData.value.armoryId || localData.value.organizationId;
  if (!parentId) return [];
  return findChildren(parentId, "SLOT").map(slot => ({
    value: slot.id,
    title: locale.value === "th" ? slot.translations.th : slot.translations.en
  }));
});

const handleHierarchyChange = (level, value) => {
  console.log(`Level Changed: ${level}, Value: ${value}`);
  console.log('Current localData before change:', localData.value);

  const levels = ['ORGANIZATION', 'ARMORY', 'BUILDING', 'FLOOR', 'ZONE', 'ROOM', 'PARTITION', 'SHELF', 'SLOT'];
  const currentIndex = levels.indexOf(level);

  if (currentIndex === -1) {
    console.warn(`Unknown level: ${level}`);
    return;
  }

  levels.slice(currentIndex + 1).forEach(downstreamLevel => {
    console.log(`🧹 Clearing ${downstreamLevel}`);
    localData.value[`${downstreamLevel.toLowerCase()}Id`] = null;
  });

  const updatedValue = {
    ...localData.value,
    [`${level.toLowerCase()}Id`]: value
  };

  console.log('About to emit updated data:',updatedValue);

  localData.value = updatedValue;
  emit('update:modelValue', updatedValue);
  emit('hierarchyChange', { level, value, context: props.context });

  console.log('Emitted updates complete');
};

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (JSON.stringify(newValue) !== JSON.stringify(localData.value)) {
    nextTick(() => {
      localData.value = { ...newValue };
    });
  }
}, { deep: true });

</script>