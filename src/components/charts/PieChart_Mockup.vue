<!-- components/charts/PieChart_Mockup.vue -->
<template>
  <div class="pie-chart">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

const chartRef = ref(null);
let chart = null;

const createChart = () => {
  const ctx = chartRef.value.getContext('2d');

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: props.data.items.map(item => item.label),
      datasets: [{
        data: props.data.items.map(item => item.value),
        backgroundColor: [
          '#1E3050',
          '#3D5A80',
          '#E07A5F',
          '#F2CC8F'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
};

onMounted(() => {
  createChart();
});

watch(() => props.data, () => {
  if (chart) {
    chart.destroy();
  }
  createChart();
}, { deep: true });
</script>

<style scoped>
.pie-chart {
  width: 100%;
  height: 300px;
}
</style>