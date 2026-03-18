<template>
  <div class="emission">
    <!-- 2022年全年排放统计 -->
    <el-card class="summary-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><DataAnalysis /></el-icon>
            2022年苏州市机动车污染物排放总量
          </span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="4.8" v-for="item in annualEmission" :key="item.name">
          <div class="pollutant-card" :style="{ background: item.gradient }">
            <div class="pollutant-icon">
              <span :style="{ fontSize: '13px', fontWeight: 'bold' }">{{ item.unit }}</span>
            </div>
            <div class="pollutant-info">
              <div class="pollutant-name">{{ item.name }}</div>
              <div class="pollutant-value">{{ item.value }}</div>
              <div class="pollutant-unit">{{ item.unitLabel }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 道路类型排放分析 -->
    <el-card class="road-emission-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><TrendCharts /></el-icon>
            不同道路类型每小时污染物平均排放
          </span>
          <el-radio-group v-model="selectedPollutant" size="small" @change="handlePollutantChange">
            <el-radio-button label="CO">CO</el-radio-button>
            <el-radio-button label="NOx">NOx</el-radio-button>
            <el-radio-button label="PM2.5">PM2.5</el-radio-button>
            <el-radio-button label="HC">HC</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <div ref="roadChartRef" style="height: 500px"></div>

      <div class="legend-info">
        <el-icon><InfoFilled /></el-icon>
        <span>单位：克/小时 | 数据基于2022年苏州市机动车排放清单计算</span>
      </div>
    </el-card>

    <!-- 车型排放占比分析 -->
    <el-row :gutter="20">
      <!-- 货车排放占比 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="title">
                <el-icon><Van /></el-icon>
                货车排放占比
              </span>
            </div>
          </template>

          <div ref="truckPieRef" style="height: 450px"></div>
        </el-card>
      </el-col>

      <!-- 客车排放占比 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="title">
                <el-icon><Monitor /></el-icon>
                客车排放占比
              </span>
            </div>
          </template>

          <div ref="busPieRef" style="height: 450px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { DataAnalysis, TrendCharts, Van, Monitor, InfoFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const roadChartRef = ref()
const truckPieRef = ref()
const busPieRef = ref()
const selectedPollutant = ref('CO')

let roadChart = null
let truckPieChart = null
let busPieChart = null

// 2022年全年排放数据
const annualEmission = [
  {
    name: 'CO',
    value: '301.94',
    unit: 'CO',
    unitLabel: '千吨',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    name: 'HC',
    value: '17.85',
    unit: 'HC',
    unitLabel: '千吨',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    name: 'NOx',
    value: '28.78',
    unit: 'NOx',
    unitLabel: '千吨',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    name: 'PM2.5',
    value: '1.43',
    unit: 'PM2.5',
    unitLabel: '千吨',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    name: 'PM10',
    value: '2.23',
    unit: 'PM10',
    unitLabel: '千吨',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
]

// 不同道路类型的排放数据
const roadEmissionData = {
  CO: {
    data: [1338.3, 1215.4, 1109.7, 1099.8, 1087.7, 1042.9, 1018.7],
    color: '#667eea',
    gradient: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#667eea' },
      { offset: 1, color: '#764ba2' }
    ])
  },
  NOx: {
    data: [105.6, 77.5, 63.9, 63.1, 58.6, 55.3, 44.3],
    color: '#4facfe',
    gradient: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#4facfe' },
      { offset: 1, color: '#00f2fe' }
    ])
  },
  'PM2.5': {
    data: [9.4, 7.3, 7.1, 5.4, 5.3, 4.1, 3],
    color: '#43e97b',
    gradient: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#43e97b' },
      { offset: 1, color: '#38f9d7' }
    ])
  },
  HC: {
    data: [88.3, 64.2, 60.5, 47.6, 47.5, 39.8, 22.3],
    color: '#f093fb',
    gradient: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#f093fb' },
      { offset: 1, color: '#f5576c' }
    ])
  }
}

// 道路类型（按每种污染物的排放量从高到低排序）
const roadTypes = {
  CO: ['城镇道路', '其他道路', '乡村道路', '省道', '收费高速公路', '国道', '高速公路'],
  NOx: ['城镇道路', '其他道路', '乡村道路', '省道', '收费高速公路', '国道', '高速公路'],
  'PM2.5': ['城镇道路', '其他道路', '省道', '乡村道路', '收费高速公路', '国道', '高速公路'],
  HC: ['城镇道路', '其他道路', '省道', '收费高速公路', '乡村道路', '国道', '高速公路']
}

// 货车排放数据（排放占比依次减小）
const truckEmissionData = [
  { name: '重型货车', value: 45, itemStyle: { color: '#5470c6' } },
  { name: '中型货车', value: 30, itemStyle: { color: '#91cc75' } },
  { name: '轻型货车', value: 18, itemStyle: { color: '#fac858' } },
  { name: '低速货车', value: 7, itemStyle: { color: '#ee6666' } }
]

// 客车排放数据（排放占比依次减小）
const busEmissionData = [
  { name: '大型客车', value: 42, itemStyle: { color: '#73c0de' } },
  { name: '中型客车', value: 28, itemStyle: { color: '#3ba272' } },
  { name: '小型客车', value: 22, itemStyle: { color: '#fc8452' } },
  { name: '微型客车', value: 8, itemStyle: { color: '#9a60b4' } }
]

// 初始化道路类型排放图表
const initRoadChart = () => {
  if (!roadChart) {
    roadChart = echarts.init(roadChartRef.value)
  }

  const pollutant = selectedPollutant.value
  const data = roadEmissionData[pollutant]
  const categories = roadTypes[pollutant]

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: `${pollutant} 不同道路类型每小时排放量`,
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: { color: '#333' },
      formatter: (params) => {
        const param = params[0]
        return `
          <div style="padding: 10px;">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">${param.name}</div>
            <div style="font-size: 16px; color: ${data.color};">
              ${pollutant}: <strong>${param.value}</strong> 克/小时
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        fontSize: 12,
        color: '#666',
        interval: 0,
        rotate: 20
      },
      axisLine: {
        lineStyle: { color: '#ddd' }
      }
    },
    yAxis: {
      type: 'value',
      name: '克/小时',
      nameTextStyle: {
        fontSize: 13,
        color: '#666',
        padding: [0, 0, 0, -20]
      },
      axisLabel: {
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: { color: '#ddd' }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: pollutant,
        type: 'bar',
        data: data.data,
        barWidth: '50%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: data.gradient
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 12,
          color: '#333',
          formatter: '{c}'
        },
        animationDelay: (idx) => idx * 50
      }
    ],
    animationEasing: 'elasticOut',
    animationDelayUpdate: (idx) => idx * 5
  }

  roadChart.setOption(option, true)
}

// 初始化货车饼图
const initTruckPieChart = () => {
  if (!truckPieChart) {
    truckPieChart = echarts.init(truckPieRef.value)
  }

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: '货车排放占比',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: { color: '#333' },
      formatter: '{a} <br/>{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 13
      }
    },
    series: [
      {
        name: '货车类型',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['60%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          fontSize: 13,
          fontWeight: 'bold',
          formatter: '{b}\n{c}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10
        },
        data: truckEmissionData
      }
    ]
  }

  truckPieChart.setOption(option)
}

// 初始化客车饼图
const initBusPieChart = () => {
  if (!busPieChart) {
    busPieChart = echarts.init(busPieRef.value)
  }

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: '客车排放占比',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: { color: '#333' },
      formatter: '{a} <br/>{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 13
      }
    },
    series: [
      {
        name: '客车类型',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['60%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          fontSize: 13,
          fontWeight: 'bold',
          formatter: '{b}\n{c}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10
        },
        data: busEmissionData
      }
    ]
  }

  busPieChart.setOption(option)
}

const handlePollutantChange = () => {
  initRoadChart()
}

onMounted(() => {
  initRoadChart()
  initTruckPieChart()
  initBusPieChart()

  // 窗口大小改变时重绘图表
  window.addEventListener('resize', () => {
    roadChart && roadChart.resize()
    truckPieChart && truckPieChart.resize()
    busPieChart && busPieChart.resize()
  })
})

onUnmounted(() => {
  if (roadChart) {
    roadChart.dispose()
  }
  if (truckPieChart) {
    truckPieChart.dispose()
  }
  if (busPieChart) {
    busPieChart.dispose()
  }
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.emission {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  padding-left: 15px;
  position: relative;
}

.card-header .title::before {
  content: '';
  position: absolute;
  left: 0;
  width: 5px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.card-header .title .el-icon {
  font-size: 22px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.summary-card,
.road-emission-card {
  margin-bottom: 25px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.summary-card :deep(.el-card__header),
.road-emission-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
  padding: 18px 20px;
}

.summary-card :deep(.el-card__body),
.road-emission-card :deep(.el-card__body) {
  padding: 25px;
}

.pollutant-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 26px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.pollutant-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pollutant-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.pollutant-card:hover::before {
  opacity: 1;
}

.pollutant-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
}

.pollutant-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.pollutant-name {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 6px;
  font-weight: 500;
}

.pollutant-value {
  font-size: 36px;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 6px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pollutant-unit {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.legend-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
}

.legend-info .el-icon {
  color: #667eea;
  font-size: 18px;
}
</style>
