<!-- RecursiveCard.vue -->
<template>
  <v-col :cols="props.colWidth(props.item.levelType)">
  <v-card
      class="mt-4 hierarchy-card"
      :color="props.getLevelColorCards(props.item.levelType)"
  >
    <v-card-title class="d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <strong>{{ props.getItemName(props.item, locale) }}</strong>
        <span class="text-grey text-caption ml-2">({{ props.item.levelNumber }})</span>
      </div>

      <v-chip :color="props.getLevelColor(props.item.levelType)" size="small" class="level-chip">
        {{ t(props.item.levelType.toLowerCase()) }}
      </v-chip>

    </v-card-title>

    <v-card-subtitle v-if="props.showLocation(props.item.levelType) === 'yes'">
      <strong>{{ t('longitude') }}:</strong> {{ props.item.longitude || '-' }} &nbsp;
      <strong>{{ t('latitude') }}:</strong> {{ props.item.latitude || '-' }}
    </v-card-subtitle>

    <v-card-text>
      <p><strong>{{ t('org_name') }}:</strong>
        <code>{{ props.getLocalizedOrganizationPath(props.item) }}</code>
      </p>
    </v-card-text>

    <v-card-actions>
      <v-btn icon="mdi-pencil" variant="text" size="small" color="black" @click="$emit('edit', item)" />
      <v-btn icon="mdi-delete" variant="text" size="small" color="error"
             @click="$emit('delete', item)" :disabled="props.hasChildren" />
      <v-btn
          icon="mdi-map-outline"
          variant="text"
          size="small"
          color="black"
          @click="$emit('map', item)"
      />
      <v-spacer></v-spacer>
      <v-btn v-if="props.hasChildrenVisible(props.item)" icon @click="$emit('toggle', props.item.id)">
        <v-icon>{{ props.isExpanded(props.item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>



      <!-- Add Child button - include a click.stop directive to prevent event bubbling -->
      <v-btn
          variant="text"
          size="small"
          color="primary"
          @click.stop="$emit('add', props.item)"
          class="add-child-btn"
      >
        <v-icon>mdi-plus-circle-outline</v-icon>
        <v-tooltip activator="parent">
          {{ t('add_child') }}
        </v-tooltip>
      </v-btn>





    </v-card-actions>

    <v-expand-transition>
      <div v-if="props.isExpanded(props.item.id)" class="nested-cards pl-4">
        <RecursiveCard
            v-for="child in props.getFilteredChildren(props.item.id)"
            :key="child.id"
            :item="child"
            :level="props.level + 1"
            :get-item-name="props.getItemName"
            :get-localized-organization-path="props.getLocalizedOrganizationPath"
            :get-level-color="props.getLevelColor"
            :get-level-color-cards="props.getLevelColorCards"
            :show-location="props.showLocation"
            :col-width="props.colWidth"
            :get-filtered-children="props.getFilteredChildren"
            :is-expanded="props.isExpanded"
            :has-children-visible="props.hasChildrenVisible"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @toggle="$emit('toggle', $event)"
            @map="$emit('map', $event)"
            @add="$emit('add', $event)"
        />
      </div>
    </v-expand-transition>
  </v-card>
  </v-col>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();
const props = defineProps({
  item: Object,
  level: Number,
  isExpanded: Function,  // Changed from Boolean to Function
  hasChildrenVisible: Function, // Added new prop
  getFilteredChildren: Function,
  getItemName: Function,
  getLocalizedOrganizationPath: Function,
  getLevelColor: Function,
  getLevelColorCards: Function,
  showLocation: Function,
  colWidth: Function
});

defineEmits(['edit', 'delete', 'toggle', 'map', 'add']);

</script>

<style scoped>
/* Level chip style for organization type labels */
.level-chip {
  min-width: 100px;
  justify-content: center;
  text-transform: uppercase;
  font-weight: bold;
  border: 1px solid;
  background-color: white !important;
}
.add-child-btn {
  /* Make the button more visible */
  opacity: 1 !important;
  transition: transform 0.2s ease;
}
.add-child-btn:hover {
  transform: scale(1.1);
}
</style>