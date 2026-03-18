<template>
  <div class="feature-analysis">
    <!-- 污染物选择 -->
    <el-card class="selector-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><DataAnalysis /></el-icon>
            特征贡献分析
          </span>
          <el-radio-group v-model="selectedPollutant" size="large" @change="handlePollutantChange">
            <el-radio-button label="NO2">NO₂（二氧化氮）</el-radio-button>
            <el-radio-button label="PM25">PM2.5（细颗粒物）</el-radio-button>
          </el-radio-group>
        </div>
      </template>
    </el-card>

    <!-- 气象特征贡献 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Cloudy /></el-icon>
            气象特征贡献度排名
          </span>
        </div>
      </template>
      <div class="feature-ranking">
        <div
          v-for="(item, index) in featureData[selectedPollutant].weather"
          :key="index"
          class="ranking-item"
        >
          <div class="ranking-number">{{ index + 1 }}</div>
          <div class="ranking-info">
            <div class="ranking-name">{{ item.name }}</div>
            <div class="ranking-trend">
              <el-tag :type="item.type === '正' ? 'danger' : 'success'" effect="dark">
                {{ item.type }}相关
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 道路排放特征贡献 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Van /></el-icon>
            道路排放特征贡献度排名（前五名）
          </span>
        </div>
      </template>
      <div class="feature-ranking">
        <div
          v-for="(item, index) in featureData[selectedPollutant].emission"
          :key="index"
          class="ranking-item"
        >
          <div class="ranking-number">{{ index + 1 }}</div>
          <div class="ranking-info">
            <div class="ranking-name">{{ item.name }}</div>
            <div class="ranking-trend">
              <el-tag type="success" effect="dark">
                正相关
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 风向分析 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Compass /></el-icon>
            {{ selectedPollutant === 'NO2' ? 'NO₂' : 'PM2.5' }}高浓度条件下的风向分布
          </span>
        </div>
      </template>
      <div ref="windChartRef" style="height: 450px"></div>
      <div class="legend-info">
        <el-icon><InfoFilled /></el-icon>
        <span>展示{{ selectedPollutant === 'NO2' ? 'NO₂' : 'PM2.5' }}高浓度条件下的风向比例（前20%）</span>
      </div>
    </el-card>

    <!-- 治理建议 -->
    <el-card class="suggestion-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Document /></el-icon>
            污染治理建议
          </span>
        </div>
      </template>
      <div class="suggestion-content">
        <div class="suggestion-item" v-for="(item, index) in suggestions" :key="index">
          <div class="suggestion-icon">
            <el-icon><Tickets /></el-icon>
          </div>
          <div class="suggestion-text">{{ item }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  Cloudy,
  Van,
  Compass,
  Document,
  DataAnalysis,
  InfoFilled,
  Tickets
} from '@element-plus/icons-vue'

const selectedPollutant = ref('NO2')
const emissionChartRef = ref()
const windChartRef = ref()
let emissionChart = null
let windChart = null

// 数据
const featureData = {
  NO2: {
    weather: [
      { name: '风速', type: '负', value: 100 },
      { name: '气压', type: '正', value: 85 },
      { name: '湿度', type: '正', value: 78 },
      { name: '温度', type: '负', value: 65 }
    ],
    emission: [
      { name: '一公里内货车NOx排放', type: '正', value: 100 },
      { name: '五公里外货车NOx排放', type: '正', value: 92 },
      { name: '五公里外货车PM10排放', type: '正', value: 88 },
      { name: '一公里内货车PM2.5排放', type: '正', value: 82 },
      { name: '一到五公里内货车CO排放', type: '正', value: 75 }
    ],
    wind: [
      { name: '北风', value: 13 },
      { name: '东北风', value: 19 },
      { name: '东风', value: 20 },
      { name: '东南风', value: 16 },
      { name: '南风', value: 6 },
      { name: '西南风', value: 3 },
      { name: '西风', value: 8 },
      { name: '西北风', value: 15 }
    ]
  },
  PM25: {
    weather: [
      { name: '湿度', type: '正', value: 100 },
      { name: '温度', type: '负', value: 92 },
      { name: '气压', type: '负', value: 85 },
      { name: '风速', type: '负', value: 78 }
    ],
    emission: [
      { name: '五公里外货车NOx排放', type: '正', value: 100 },
      { name: '五公里外货车HC排放', type: '正', value: 95 },
      { name: '一公里内货车PM2.5排放', type: '正', value: 90 },
      { name: '货车PM2.5排放', type: '正', value: 88 },
      { name: '一公里内货车HC排放', type: '正', value: 82 }
    ],
    wind: [
      { name: '北风', value: 18 },
      { name: '东北风', value: 16 },
      { name: '东风', value: 13 },
      { name: '东南风', value: 14 },
      { name: '南风', value: 7 },
      { name: '西南风', value: 5 },
      { name: '西风', value: 12 },
      { name: '西北风', value: 15 }
    ]
  }
}

const suggestions = [
  '对于PM2.5而言，二次形成起着更主导的作用；因此，气象条件对整体影响更为显著。',
  '卡车相关的总氮氧化物排放（考虑到相对较小的5公里半径，这基本上代表了全市卡车的氮氧化物排放）也对PM2.5水平有重大贡献。',
  '由于二氧化氮是一种短寿命物质，车辆的初级排放对其浓度有显著且立竿见影的影响。',
  '从交通管制角度控制PM2.5污染时，仅在有限城市区域内限制高排放车辆，难以显著改善监测点的空气质量。',
  '要实现有效的PM2.5减排，必须在全市范围内大幅削减总氮氧化物（NOx）排放量。'
]

// 初始化风向图表
const initWindChart = () => {
  if (!windChartRef.value) return

  windChart = echarts.init(windChartRef.value)
  const data = featureData[selectedPollutant.value].wind

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    series: [
      {
        name: '风向分布',
        type: 'pie',
        radius: '65%',
        center: ['40%', '50%'],
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: [
              '#667eea',
              '#764ba2',
              '#f093fb',
              '#4facfe',
              '#43e97b',
              '#fa709a',
              '#fee140',
              '#30cfd0'
            ][index % 8]
          }
        })),
        label: {
          show: true,
          formatter: '{b}\n{c}%',
          fontSize: 13,
          fontWeight: 500
        },
        labelLine: {
          length: 20,
          length2: 15,
          smooth: true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  }

  windChart.setOption(option)
}

// 切换污染物
const handlePollutantChange = () => {
  initWindChart()
}

onMounted(() => {
  initWindChart()

  window.addEventListener('resize', () => {
    emissionChart?.resize()
    windChart?.resize()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {})
  emissionChart?.dispose()
  windChart?.dispose()
})
</script>

<style scoped>
.feature-analysis {
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

.selector-card,
.chart-card,
.suggestion-card {
  margin-bottom: 25px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.selector-card :deep(.el-card__header),
.chart-card :deep(.el-card__header),
.suggestion-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
  padding: 18px 20px;
}

.selector-card :deep(.el-card__body),
.chart-card :deep(.el-card__body),
.suggestion-card :deep(.el-card__body) {
  padding: 25px;
}

:deep(.el-radio-button__inner) {
  border-radius: 8px;
  font-weight: 500;
  padding: 12px 20px;
  transition: all 0.3s ease;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  font-weight: 600;
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

.feature-ranking {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.ranking-number {
  width: 45px;
  height: 45px;
  min-width: 45px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.ranking-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ranking-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.ranking-trend :deep(.el-tag) {
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  border: none;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.suggestion-icon {
  width: 45px;
  height: 45px;
  min-width: 45px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.suggestion-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.8;
  color: #374151;
  padding-top: 5px;
}
</style>
