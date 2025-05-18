<!-- components/charts/BarChart.vue -->
<template>
  <div class="bar-chart">
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
    type: 'bar',
    data: {
      labels: props.data.labels,
      datasets: props.data.datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ][index],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)'
        ][index],
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
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
.bar-chart {
  width: 100%;
  height: 300px;
}
</style>