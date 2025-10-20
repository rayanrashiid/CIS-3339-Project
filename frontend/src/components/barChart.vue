<template>
  <div>
    <canvas class="p-10" ref="attendanceChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables, Colors } from 'chart.js'

Chart.register(...registerables)
Chart.register(Colors)

const props = defineProps({
  label: {
    type: Array
  },
  chartData: {
    type: Array
  }
})

const attendanceChart = ref(null)

onMounted(() => {
  if (!attendanceChart.value) {
    return
  }

  new Chart(attendanceChart.value, {
    type: 'bar',
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
      scales: {
        y: {
          ticks: {
            stepSize: 1
          }
        },
        x: {
          gridLines: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Attendance Chart'
        }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  })
})
</script>

