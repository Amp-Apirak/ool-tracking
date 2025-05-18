<!-- PieChart.vue -->

<template>
  <Pie :data="chartData" :options="chartOptions" />
</template>

<script>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels)

export default {
  name: 'PieChart',
  components: { Pie },
  props: {
    chartData: {
      type: Object,
      required: true
    },
    isFullscreen: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 20
        }
      },
      plugins: {
        legend: {
          position: 'right',
          align: 'center',
          labels: {
            padding: 10,
            boxWidth: 15,
            font: {
              size: 11
            }
          }
        },
        datalabels: {
          color: '#666',
          font: {
            size: 11,
            weight: '500'
          },
          formatter: (value, ctx) => {
            const dataset = ctx.chart.data.datasets[0];
            const total = dataset.data.reduce((acc, data) => acc + data, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return percentage + '%';
          },
          anchor: 'end',
          align: 'end',
          offset: -2,
          display: (context) => {
            const value = context.dataset.data[context.dataIndex];
            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
            return (value / total) > 0.03;
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const dataset = context.chart.data.datasets[0];
              const total = dataset.data.reduce((acc, data) => acc + data, 0);
              const value = dataset.data[context.dataIndex];
              const percentage = ((value / total) * 100).toFixed(2);
              return `${context.label}: ${percentage}%`;
            }
          }
        }
      }
    }
    return { chartOptions }
  }
}
</script>
