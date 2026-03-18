<template>
  <div class="analysis">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>月度排放与空气质量趋势</span>
              <el-button type="primary" @click="handleRefresh">刷新</el-button>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>车型排放分布</span>
          </template>
          <div ref="vehiclePieChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>区域排放对比</span>
          </template>
          <div ref="regionBarChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>特征贡献度分析</span>
          </template>
          <el-table :data="featureImportance" style="width: 100%">
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="feature" label="特征名称" />
            <el-table-column prop="importance" label="贡献度" width="200">
              <template #default="{ row }">
                <el-progress :percentage="row.importance" :color="getProgressColor(row.importance)" />
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { mockAnalysisData } from '@/stores/mockData'

const trendChartRef = ref()
const vehiclePieChartRef = ref()
const regionBarChartRef = ref()

const featureImportance = ref([
  { feature: '交通流量', importance: 85, description: '道路机动车流量对排放的影响最大' },
  { feature: '平均速度', importance: 72, description: '车辆平均行驶速度影响排放因子' },
  { feature: '车型构成', importance: 68, description: '不同车型的排放特性差异' },
  { feature: '气象条件', importance: 55, description: '温度、湿度等影响污染物扩散' },
  { feature: '道路等级', importance: 45, description: '不同等级道路的排放特征' },
  { feature: '时段分布', importance: 42, description: '高峰期与平峰期的排放差异' }
])

const getProgressColor = (value) => {
  if (value >= 80) return '#f56c6c'
  if (value >= 60) return '#e6a23c'
  return '#409eff'
}

const handleRefresh = () => {
  ElMessage.success('数据已刷新')
}

const initTrendChart = () => {
  const chart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['排放量', '空气质量指数']
    },
    xAxis: {
      type: 'category',
      data: mockAnalysisData.monthlyTrend.dates
    },
    yAxis: [
      {
        type: 'value',
        name: '排放量(吨)',
        position: 'left'
      },
      {
        type: 'value',
        name: 'AQI',
        position: 'right'
      }
    ],
    series: [
      {
        name: '排放量',
        type: 'bar',
        data: mockAnalysisData.monthlyTrend.emission,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '空气质量指数',
        type: 'line',
        yAxisIndex: 1,
        data: mockAnalysisData.monthlyTrend.airQuality,
        smooth: true,
        itemStyle: { color: '#67c23a' }
      }
    ]
  }
  chart.setOption(option)
}

const initVehiclePieChart = () => {
  const chart = echarts.init(vehiclePieChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '车型分布',
        type: 'pie',
        radius: '60%',
        data: mockAnalysisData.vehicleDistribution,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

const initRegionBarChart = () => {
  const chart = echarts.init(regionBarChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: mockAnalysisData.regionalEmission.map(item => item.name)
    },
    yAxis: {
      type: 'value',
      name: '排放量(吨)'
    },
    series: [
      {
        name: '区域排放',
        type: 'bar',
        data: mockAnalysisData.regionalEmission.map(item => item.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

onMounted(() => {
  initTrendChart()
  initVehiclePieChart()
  initRegionBarChart()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
