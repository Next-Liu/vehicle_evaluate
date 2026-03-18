<template>
  <div class="air-quality">
    <!-- 地图卡片 -->
    <el-card class="map-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Location /></el-icon>
            苏州市国控点分布图
          </span>
          <el-radio-group v-model="mapPollutant" size="small" @change="handleMapPollutantChange">
            <el-radio-button label="aqi">AQI</el-radio-button>
            <el-radio-button label="pm25">PM2.5</el-radio-button>
            <el-radio-button label="pm10">PM10</el-radio-button>
            <el-radio-button label="no2">NO₂</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="mapChartRef" style="height: 650px">
        <div v-if="mapLoading" class="map-loading">
          <el-icon class="is-loading" :size="40"><Loading /></el-icon>
          <p>地图加载中...</p>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><DataAnalysis /></el-icon>
            苏州市国控点实时监测数据（12个站点）
          </span>
          <el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新数据</el-button>
        </div>
      </template>

      <el-table :data="stations" style="width: 100%" stripe border max-height="500">
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="name" label="站点名称" width="130" />
        <el-table-column prop="region" label="行政区域" width="110">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.region }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="详细地址" min-width="220" show-overflow-tooltip />
        <el-table-column prop="aqi" label="AQI" width="95" align="center">
          <template #default="{ row }">
            <el-tag :type="getAqiType(row.aqi)" size="large" effect="dark">{{ row.aqi }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="95" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" effect="dark">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pm25" label="PM2.5" width="95" align="center">
          <template #default="{ row }">
            <span :class="{ 'high-value': row.pm25 > 75 }">{{ row.pm25 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pm10" label="PM10" width="95" align="center">
          <template #default="{ row }">
            <span :class="{ 'high-value': row.pm10 > 150 }">{{ row.pm10 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="no2" label="NO₂" width="95" align="center">
          <template #default="{ row }">
            <span :class="{ 'high-value': row.no2 > 80 }">{{ row.no2 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="so2" label="SO₂" width="95" align="center">
          <template #default="{ row }">
            <span :class="{ 'high-value': row.so2 > 60 }">{{ row.so2 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="o3" label="O₃" width="95" align="center">
          <template #default="{ row }">
            <span :class="{ 'high-value': row.o3 > 160 }">{{ row.o3 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="co" label="CO" width="95" align="center">
          <template #default="{ row }">
            <span :class="{ 'high-value': row.co > 10 }">{{ row.co }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="legend">
        <el-icon><InfoFilled /></el-icon>
        <span>浓度单位：μg/m³（CO为mg/m³） | 数据更新时间：{{ updateTime }}</span>
      </div>
    </el-card>

    <!-- 趋势图 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><TrendCharts /></el-icon>
            最近24小时空气质量监测（逐小时）
          </span>
          <div>
            <el-select v-model="selectedStation" placeholder="选择站点" style="width: 200px; margin-right: 10px" @change="handleStationChange">
              <el-option label="全部站点（平均）" value="" />
              <el-option v-for="station in stations" :key="station.id" :label="station.name" :value="station.id" />
            </el-select>
            <el-select v-model="selectedPollutant" placeholder="选择污染物" style="width: 150px" @change="handlePollutantChange">
              <el-option label="PM2.5" value="pm25" />
              <el-option label="PM10" value="pm10" />
              <el-option label="NO₂" value="no2" />
              <el-option label="SO₂" value="so2" />
              <el-option label="O₃" value="o3" />
              <el-option label="CO" value="co" />
            </el-select>
          </div>
        </div>
      </template>

      <div ref="hourlyChartRef" style="height: 450px"></div>

      <el-row :gutter="20" style="margin-top: 24px">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <span style="font-size: 12px">PM2.5</span>
            </div>
            <div class="stat-content">
              <div class="stat-value" :style="{ color: getValueColor(hourlyData.pm25[hourlyData.pm25.length - 1], 'pm25') }">
                {{ hourlyData.pm25[hourlyData.pm25.length - 1] }}
              </div>
              <div class="stat-unit">μg/m³</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <span style="font-size: 12px">PM10</span>
            </div>
            <div class="stat-content">
              <div class="stat-value" :style="{ color: getValueColor(hourlyData.pm10[hourlyData.pm10.length - 1], 'pm10') }">
                {{ hourlyData.pm10[hourlyData.pm10.length - 1] }}
              </div>
              <div class="stat-unit">μg/m³</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <span style="font-size: 12px">NO₂</span>
            </div>
            <div class="stat-content">
              <div class="stat-value" :style="{ color: getValueColor(hourlyData.no2[hourlyData.no2.length - 1], 'no2') }">
                {{ hourlyData.no2[hourlyData.no2.length - 1] }}
              </div>
              <div class="stat-unit">μg/m³</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
              <span style="font-size: 12px">SO₂</span>
            </div>
            <div class="stat-content">
              <div class="stat-value" :style="{ color: getValueColor(hourlyData.so2[hourlyData.so2.length - 1], 'so2') }">
                {{ hourlyData.so2[hourlyData.so2.length - 1] }}
              </div>
              <div class="stat-unit">μg/m³</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Location, DataAnalysis, TrendCharts, InfoFilled, Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { mockAirQualityStations, generateHourlyAirQualityData, suzhouRoads } from '@/stores/mockData'
import dayjs from 'dayjs'

const mapChartRef = ref()
const hourlyChartRef = ref()
const stations = ref([])
const selectedStation = ref('')
const selectedPollutant = ref('pm25')
const mapPollutant = ref('aqi')
const hourlyData = ref(generateHourlyAirQualityData())
const updateTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const mapLoading = ref(true)
let mapChart = null
let hourlyChart = null
let refreshTimer = null

const pollutantNames = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  no2: 'NO₂',
  so2: 'SO₂',
  o3: 'O₃',
  co: 'CO',
  aqi: 'AQI'
}

// AQI 颜色标准（国标）
const getAqiColor = (aqi) => {
  if (aqi <= 50) return '#00e400'
  if (aqi <= 100) return '#ffff00'
  if (aqi <= 150) return '#ff7e00'
  if (aqi <= 200) return '#ff0000'
  if (aqi <= 300) return '#99004c'
  return '#7e0023'
}

const getAqiType = (aqi) => {
  if (aqi <= 50) return 'success'
  if (aqi <= 100) return ''
  if (aqi <= 150) return 'warning'
  if (aqi <= 200) return 'warning'
  return 'danger'
}

const getLevelType = (level) => {
  const map = {
    '优': 'success',
    '良': '',
    '轻度污染': 'warning',
    '中度污染': 'danger',
    '重度污染': 'danger'
  }
  return map[level] || 'info'
}

const getValueColor = (value, type) => {
  const thresholds = {
    pm25: { high: 75, mid: 35 },
    pm10: { high: 150, mid: 50 },
    no2: { high: 80, mid: 40 },
    so2: { high: 60, mid: 20 },
    o3: { high: 160, mid: 100 },
    co: { high: 10, mid: 4 },
    aqi: { high: 100, mid: 50 }
  }
  const t = thresholds[type]
  if (value > t.high) return '#f56c6c'
  if (value > t.mid) return '#e6a23c'
  return '#67c23a'
}

const handleRefresh = () => {
  stations.value = mockAirQualityStations
  hourlyData.value = generateHourlyAirQualityData()
  updateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  initMapChart()
  initHourlyChart()
  ElMessage.success('数据已刷新')
}

const handleStationChange = () => {
  initHourlyChart()
}

const handlePollutantChange = () => {
  initHourlyChart()
}

const handleMapPollutantChange = () => {
  initMapChart()
}

// 注册苏州地图
const registerSuzhouMap = () => {
  fetch('/suzhou.json')
    .then(response => response.json())
    .then(data => {
      echarts.registerMap('苏州', data)
      initMapChart()
    })
    .catch(err => {
      console.error('加载苏州地图失败:', err)
      ElMessage.error('地图加载失败，请刷新重试')
    })
}

// 初始化地图
const initMapChart = () => {
  if (!mapChart) {
    mapChart = echarts.init(mapChartRef.value)
  }

  mapLoading.value = true

  const pollutant = mapPollutant.value

  // 准备站点数据
  const scatterData = stations.value.map(station => {
    return {
      name: station.name,
      value: [station.lng, station.lat, station[pollutant], station.aqi, station.level],
      itemStyle: {
        color: getAqiColor(station.aqi)
      }
    }
  })

  // 准备道路数据
  const roadLines = suzhouRoads.map(road => ({
    name: road.name,
    coords: road.coords
  }))

  const option = {
    backgroundColor: '#e3f0fd',
    title: {
      text: '苏州市国控点分布',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
      formatter: (params) => {
        const station = stations.value.find(s => s.name === params.name)
        if (station) {
          return `
            <div style="padding: 12px; min-width: 220px;">
              <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px;">
                ${station.name}
              </div>
              <div style="color: #666; font-size: 13px; line-height: 2;">
                <div><span style="color: #999;">📍 区域：</span><strong>${station.region}</strong></div>
                <div><span style="color: #999;">📍 地址：</span>${station.address}</div>
                <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                  <div style="display: flex; align-items: center; margin-bottom: 6px;">
                    <span style="display: inline-block; width: 16px; height: 16px; background: ${getAqiColor(station.aqi)}; margin-right: 8px; border-radius: 50%;"></span>
                    <strong style="font-size: 15px;">AQI：${station.aqi}</strong>
                    <span style="margin-left: 8px; padding: 2px 8px; background: ${getAqiColor(station.aqi)}; color: white; border-radius: 10px; font-size: 12px;">${station.level}</span>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px;">
                  <div style="padding: 4px; background: white;">PM2.5：<strong>${station.pm25}</strong> μg/m³</div>
                  <div style="padding: 4px; background: white;">PM10：<strong>${station.pm10}</strong> μg/m³</div>
                  <div style="padding: 4px; background: white;">NO₂：<strong>${station.no2}</strong> μg/m³</div>
                  <div style="padding: 4px; background: white;">SO₂：<strong>${station.so2}</strong> μg/m³</div>
                  <div style="padding: 4px; background: white;">O₃：<strong>${station.o3}</strong> μg/m³</div>
                  <div style="padding: 4px; background: white;">CO：<strong>${station.co}</strong> mg/m³</div>
                </div>
              </div>
            </div>
          `
        }
        return params.name
      }
    },
    geo: {
      map: '苏州',
      roam: true,
      zoom: 1.2,
      center: [120.5853, 31.2989],
      label: {
        show: false
      },
      itemStyle: {
        areaColor: '#cde6f7',
        borderColor: '#8da2c8',
        borderWidth: 2
      },
      emphasis: {
        itemStyle: {
          areaColor: '#b3d9e8'
        }
      }
    },
    series: [
      // 道路网络
      {
        type: 'lines',
        coordinateSystem: 'geo',
        lineStyle: {
          color: '#ffffff',
          width: 2,
          opacity: 0.8,
          curveness: 0.2
        },
        data: roadLines
      },
      // 国控点散点
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: (val) => {
          const aqi = val[3]
          return Math.max(10, Math.min(20, aqi / 6))
        },
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke',
          scale: 4,
          period: 6
        },
        label: {
          show: true,
          formatter: '{b}',
          position: 'bottom',
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50',
          textShadowColor: '#fff',
          textShadowBlur: 3
        },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.3)'
        },
        emphasis: {
          scale: 1.3,
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 3
          }
        }
      }
    ],
    visualMap: {
      show: true,
      min: 0,
      max: 200,
      left: 'left',
      bottom: '5%',
      calculable: true,
      text: ['高', '低'],
      textStyle: {
        color: '#666'
      },
      inRange: {
        color: ['#00e400', '#ffff00', '#ff7e00', '#ff0000', '#99004c']
      }
    }
  }

  setTimeout(() => {
    mapChart.setOption(option)
    mapLoading.value = false
  }, 300)
}

// 初始化小时图表
const initHourlyChart = () => {
  if (!hourlyChart) {
    hourlyChart = echarts.init(hourlyChartRef.value)
  }

  const pollutant = selectedPollutant.value
  const data = hourlyData.value[pollutant]
  const color = getValueColor(data[data.length - 1], pollutant)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: { color: '#333' },
      formatter: (params) => {
        const param = params[0]
        const stationName = selectedStation.value
          ? stations.value.find(s => s.id === selectedStation.value)?.name
          : '全部站点平均'
        return `
          <div style="padding: 8px;">
            <div style="font-size: 13px; color: #999;">${param.name}</div>
            <div style="font-size: 13px; color: #999;">${stationName}</div>
            <div style="font-size: 16px; font-weight: bold; margin-top: 4px;">
              ${pollutantNames[pollutant]}: ${param.value}${pollutant === 'co' ? ' mg/m³' : ' μg/m³'}
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hourlyData.value.hours,
      boundaryGap: false,
      axisLabel: {
        rotate: 30,
        interval: 2,
        fontSize: 11,
        color: '#666'
      },
      axisLine: {
        lineStyle: { color: '#ddd' }
      }
    },
    yAxis: {
      type: 'value',
      name: pollutant === 'co' ? '浓度 (mg/m³)' : '浓度 (μg/m³)',
      nameTextStyle: {
        fontSize: 12,
        color: '#666'
      },
      axisLabel: {
        fontSize: 11,
        color: '#666'
      },
      axisLine: {
        lineStyle: { color: '#ddd' }
      },
      splitLine: {
        lineStyle: { color: '#f0f0f0' }
      }
    },
    series: [{
      name: pollutantNames[pollutant],
      type: 'line',
      data: data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3,
        color: color
      },
      itemStyle: {
        color: color,
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: color + '40' },
          { offset: 1, color: color + '05' }
        ])
      }
    }]
  }

  hourlyChart.setOption(option)
}

onMounted(() => {
  stations.value = mockAirQualityStations
  hourlyData.value = generateHourlyAirQualityData()
  updateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')

  // 注册地图并初始化
  registerSuzhouMap()
  initHourlyChart()

  // 窗口大小改变时重绘图表
  window.addEventListener('resize', () => {
    mapChart && mapChart.resize()
    hourlyChart && hourlyChart.resize()
  })

  // 模拟实时数据更新
  refreshTimer = setInterval(() => {
    hourlyData.value = generateHourlyAirQualityData()
    updateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
    initHourlyChart()
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  if (mapChart) {
    mapChart.dispose()
  }
  if (hourlyChart) {
    hourlyChart.dispose()
  }
  window.removeEventListener('resize', () => {})
})

// 监听地图污染物变化
watch(mapPollutant, () => {
  initMapChart()
})
</script>

<style scoped>
.air-quality {
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

.map-card,
.table-card,
.chart-card {
  margin-bottom: 25px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.map-card :deep(.el-card__header),
.table-card :deep(.el-card__header),
.chart-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
  padding: 18px 20px;
}

.map-card :deep(.el-card__body),
.table-card :deep(.el-card__body),
.chart-card :deep(.el-card__body) {
  padding: 20px;
}

.map-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.map-loading .el-icon {
  color: #667eea;
}

.map-loading p {
  margin-top: 15px;
  font-size: 15px;
  font-weight: 500;
}

:deep(.el-table) {
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  font-weight: 600;
}

:deep(.el-table--border) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
  border: none;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

:deep(.el-radio-button__inner) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.high-value {
  color: #f56c6c;
  font-weight: bold;
}

.legend {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 12px;
  background: #f0f9ff;
  border-left: 3px solid #409eff;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-unit {
  font-size: 13px;
  color: #999;
}
</style>
