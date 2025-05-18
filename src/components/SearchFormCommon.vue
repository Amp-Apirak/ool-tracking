<!-- SearchFormCommon.vue -->

<template>
  <v-form>
    <v-row>
      <v-col v-for="(field, index) in fieldsConfig" :key="index" :cols="field.cols || 12">
        <component
            :is="getComponentType(field.type)"
            v-model="formData[field.name]"
            v-bind="field.props"
            :label="field.label"
            dense
            outlined
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-btn color="primary" @click="handleSearch">Search</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  name: 'SearchFormCommon',
  props: {
    fieldsConfig: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    onSearch: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      formData: { ...this.modelValue }, // Clone to keep original data reactive
    };
  },
  watch: {
    modelValue: {
      handler(newVal) {
        this.formData = { ...newVal };
      },
      deep: true,
    },
    formData: {
      handler(newVal) {
        this.$emit('update:modelValue', newVal);
      },
      deep: true,
    },
  },
  methods: {
    getComponentType(type) {
      const components = {
        text: 'v-text-field',
        select: 'v-select',
        date: 'v-date-picker',
      };
      return components[type] || 'v-text-field';
    },
    handleSearch() {
      this.onSearch(this.formData);
    },
  },
};
</script>
