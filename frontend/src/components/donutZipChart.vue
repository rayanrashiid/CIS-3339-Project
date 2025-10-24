<template>
  <div class="w-full md:w-2/3 lg:w-1/2 max-w-2xl">
    <canvas class="p-6" ref="zipChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  label: {
    type: Array
  },
  chartData: {
    type: Array
  }
})

const zipChart = ref(null)

onMounted(() => {
  if (!zipChart.value) {
    return
  }

  new Chart(zipChart.value, {
    type: 'doughnut',
    data: {
      labels: props.label,
      datasets: [
        {
          borderWidth: 1,
          data: props.chartData
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Clients by Zip Code'
        }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  })
})
</script>
