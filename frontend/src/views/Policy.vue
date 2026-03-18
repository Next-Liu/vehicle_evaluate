<template>
  <div class="policy">
    <!-- 场景列表 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span class="title">政策情景管理</span>
          <el-button type="primary" :icon="Plus" @click="openManageDialog">管理场景</el-button>
        </div>
      </template>

      <el-table :data="scenarios" style="width: 100%" stripe>
        <el-table-column prop="name" label="场景名称" width="120" />
        <el-table-column prop="description" label="政策描述">
          <template #default="{ row }">
            <div class="description">{{ row.description }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetails(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 排放清单结果 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span class="title">全年排放清单结果</span>
        </div>
      </template>

      <div ref="emissionChartRef" style="height: 450px"></div>
    </el-card>

    <!-- 减排效益 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span class="title">减排效益（相对2025基准）</span>
        </div>
      </template>

      <div ref="reductionChartRef" style="height: 450px"></div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetailDialog" :title="`${currentScenario.name} - 详情`" width="800px">
      <div class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="场景名称">{{ currentScenario.name }}</el-descriptions-item>
          <el-descriptions-item label="政策描述">{{ currentScenario.description }}</el-descriptions-item>
          <el-descriptions-item label="小型客车新能源占比">{{ currentScenario.passengerEV }}</el-descriptions-item>
          <el-descriptions-item label="中重型货车新能源占比">{{ currentScenario.truckEV }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>排放清单</h4>
          <el-table :data="[currentScenario.emission]" style="width: 100%" size="small">
            <el-table-column prop="CO" label="CO (kt)" />
            <el-table-column prop="HC" label="HC (kt)" />
            <el-table-column prop="NOx" label="NOx (kt)" />
            <el-table-column prop="PM25" label="PM2.5 (kt)" />
            <el-table-column prop="PM10" label="PM10 (kt)" />
          </el-table>
        </div>

        <div class="detail-section" v-if="currentScenario.reduction">
          <h4>减排效益</h4>
          <el-table :data="[currentScenario.reduction]" style="width: 100%" size="small">
            <el-table-column prop="PM25" label="PM2.5减排率" />
            <el-table-column prop="NO2" label="NO2减排率" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 管理场景对话框 -->
    <el-dialog v-model="showManageDialog" title="管理场景" width="900px">
      <el-table :data="scenarios" style="width: 100%" border>
        <el-table-column prop="name" label="场景名称" width="100" />
        <el-table-column prop="passengerEV" label="小型客车新能源占比" width="150" />
        <el-table-column prop="truckEV" label="中重型货车新能源占比" width="150" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editScenario(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="deleteScenario(row)" :disabled="row.name === '2025'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="showManageDialog = false">关闭</el-button>
        <el-button type="primary" @click="addNewScenario">添加新场景</el-button>
      </template>
    </el-dialog>

    <!-- 编辑/添加场景对话框 -->
    <el-dialog v-model="showEditDialog" :title="editMode === 'add' ? '添加新场景' : '编辑场景'" width="600px">
      <el-form :model="scenarioForm" label-width="180px">
        <el-form-item label="场景名称">
          <el-input v-model="scenarioForm.name" placeholder="如: S5" :disabled="editMode === 'edit'" />
        </el-form-item>
        <el-form-item label="小型客车新能源占比">
          <el-input v-model="scenarioForm.passengerEV" placeholder="如: 27.2%" />
        </el-form-item>
        <el-form-item label="中重型货车新能源占比">
          <el-input v-model="scenarioForm.truckEV" placeholder="如: 1.5%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveScenario">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

// 场景数据
const scenarios = ref([
  {
    name: '2025',
    passengerEV: '7.2%',
    truckEV: '1.5%',
    description: '小型客车新能源占比7.2%，中重型货车新能源占比1.5%',
    emission: {
      CO: '33.06',
      HC: '3.25',
      NOx: '27.95',
      PM25: '1.33',
      PM10: '0.42'
    },
    reduction: null
  },
  {
    name: 'S1',
    passengerEV: '27.2%',
    truckEV: '1.5%',
    description: '小型客车新能源占比27.2%，中重型货车新能源占比1.5%',
    emission: {
      CO: '32.55',
      HC: '3.19',
      NOx: '27.49',
      PM25: '1.31',
      PM10: '0.40'
    },
    reduction: {
      PM25: '1.21%',
      NO2: '1.22%'
    }
  },
  {
    name: 'S2',
    passengerEV: '7.2%',
    truckEV: '10%',
    description: '小型客车新能源占比7.2%，中重型货车新能源占比10%',
    emission: {
      CO: '31.59',
      HC: '3.13',
      NOx: '24.65',
      PM25: '1.20',
      PM10: '0.32'
    },
    reduction: {
      PM25: '3.56%',
      NO2: '5.83%'
    }
  },
  {
    name: 'S3',
    passengerEV: '7.2%',
    truckEV: '25%',
    description: '小型客车新能源占比7.2%，中重型货车新能源占比25%',
    emission: {
      CO: '28.39',
      HC: '2.98',
      NOx: '20.11',
      PM25: '0.98',
      PM10: '0.29'
    },
    reduction: {
      PM25: '8.89%',
      NO2: '12.05%'
    }
  },
  {
    name: 'S4',
    passengerEV: '27.2%',
    truckEV: '25%',
    description: '小型客车新能源占比27.2%，中重型货车新能源占比25%',
    emission: {
      CO: '28.87',
      HC: '2.93',
      NOx: '19.67',
      PM25: '0.96',
      PM10: '0.28'
    },
    reduction: {
      PM25: '9.52%',
      NO2: '12.53%'
    }
  }
])

const showDetailDialog = ref(false)
const showManageDialog = ref(false)
const showEditDialog = ref(false)
const editMode = ref('add')
const emissionChartRef = ref(null)
const reductionChartRef = ref(null)

const currentScenario = ref({
  name: '',
  passengerEV: '',
  truckEV: '',
  description: '',
  emission: {},
  reduction: null
})

const scenarioForm = ref({
  name: '',
  passengerEV: '',
  truckEV: ''
})

const viewDetails = (row) => {
  currentScenario.value = row
  showDetailDialog.value = true
}

const openManageDialog = () => {
  showManageDialog.value = true
}

const editScenario = (row) => {
  editMode.value = 'edit'
  scenarioForm.value = {
    name: row.name,
    passengerEV: row.passengerEV,
    truckEV: row.truckEV
  }
  showEditDialog.value = true
  showManageDialog.value = false
}

const deleteScenario = (row) => {
  ElMessageBox.confirm(`确定要删除场景 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = scenarios.value.findIndex(s => s.name === row.name)
    if (index > -1) {
      scenarios.value.splice(index, 1)
      ElMessage.success('删除成功')
      initCharts()
    }
  }).catch(() => {})
}

const addNewScenario = () => {
  editMode.value = 'add'
  scenarioForm.value = {
    name: '',
    passengerEV: '',
    truckEV: ''
  }
  showEditDialog.value = true
  showManageDialog.value = false
}

const saveScenario = () => {
  if (!scenarioForm.value.name || !scenarioForm.value.passengerEV || !scenarioForm.value.truckEV) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const description = `小型客车新能源占比${scenarioForm.value.passengerEV}，中重型货车新能源占比${scenarioForm.value.truckEV}`

  if (editMode.value === 'add') {
    // 添加新场景
    scenarios.value.push({
      name: scenarioForm.value.name,
      passengerEV: scenarioForm.value.passengerEV,
      truckEV: scenarioForm.value.truckEV,
      description: description,
      emission: {
        CO: '0',
        HC: '0',
        NOx: '0',
        PM25: '0',
        PM10: '0'
      },
      reduction: {
        PM25: '0%',
        NO2: '0%'
      }
    })
    ElMessage.success('添加成功')
  } else {
    // 编辑场景
    const index = scenarios.value.findIndex(s => s.name === scenarioForm.value.name)
    if (index > -1) {
      scenarios.value[index].passengerEV = scenarioForm.value.passengerEV
      scenarios.value[index].truckEV = scenarioForm.value.truckEV
      scenarios.value[index].description = description
      ElMessage.success('修改成功')
    }
  }

  showEditDialog.value = false
  initCharts()
}

// 初始化排放清单图表
const initEmissionChart = () => {
  const chart = echarts.init(emissionChartRef.value)

  const scenarioNames = scenarios.value.map(s => s.name)
  const coData = scenarios.value.map(s => parseFloat(s.emission.CO))
  const hcData = scenarios.value.map(s => parseFloat(s.emission.HC))
  const noxData = scenarios.value.map(s => parseFloat(s.emission.NOx))
  const pm25Data = scenarios.value.map(s => parseFloat(s.emission.PM25))
  const pm10Data = scenarios.value.map(s => parseFloat(s.emission.PM10))

  const option = {
    title: {
      text: '各场景全年排放清单对比',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['CO', 'HC', 'NOx', 'PM2.5', 'PM10'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '80',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: scenarioNames
    },
    yAxis: {
      type: 'value',
      name: '排放量 (kt)'
    },
    series: [
      {
        name: 'CO',
        type: 'bar',
        data: coData
      },
      {
        name: 'HC',
        type: 'bar',
        data: hcData
      },
      {
        name: 'NOx',
        type: 'bar',
        data: noxData
      },
      {
        name: 'PM2.5',
        type: 'bar',
        data: pm25Data
      },
      {
        name: 'PM10',
        type: 'bar',
        data: pm10Data
      }
    ]
  }

  chart.setOption(option)
  return chart
}

// 初始化减排效益图表
const initReductionChart = () => {
  const chart = echarts.init(reductionChartRef.value)

  // 过滤出2025之后的场景
  const reductionScenarios = scenarios.value.filter(s => s.name !== '2025')
  const scenarioNames = reductionScenarios.map(s => s.name)
  const pm25Data = reductionScenarios.map(s => parseFloat(s.reduction?.PM25 || '0'))
  const no2Data = reductionScenarios.map(s => parseFloat(s.reduction?.NO2 || '0'))

  const option = {
    title: {
      text: '各场景减排效益对比（相对2025基准）',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        let result = params[0].name + '<br/>'
        params.forEach(item => {
          result += `${item.seriesName}: ${item.value}%<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['PM2.5', 'NO2'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '80',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: scenarioNames
    },
    yAxis: {
      type: 'value',
      name: '减排率 (%)',
      max: Math.max(...pm25Data, ...no2Data) * 1.2
    },
    series: [
      {
        name: 'PM2.5',
        type: 'bar',
        data: pm25Data,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: 'NO2',
        type: 'bar',
        data: no2Data,
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  }

  chart.setOption(option)
  return chart
}

const initCharts = () => {
  const emissionChart = initEmissionChart()
  const reductionChart = initReductionChart()

  // 响应式调整
  window.addEventListener('resize', () => {
    emissionChart.resize()
    reductionChart.resize()
  })
}

onMounted(() => {
  initCharts()
})
</script>

<style scoped>
.policy {
  padding: 0;
}

.section-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.description {
  font-size: 14px;
  color: #666;
}

.detail-content {
  padding: 10px 0;
}

.detail-section {
  margin-top: 24px;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}
</style>
