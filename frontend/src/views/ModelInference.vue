<template>
  <div class="model-inference">
    <!-- 车流量预测模型调用 -->
    <el-card class="inference-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Van /></el-icon>
            车流量预测模型调用
          </span>
          <el-tag type="info">版本：0120_version_1</el-tag>
        </div>
      </template>

      <el-form :model="trafficForm" label-width="140px" label-position="left">
        <!-- 道路名称或类型 -->
        <el-form-item label="道路选择" required>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-input
                v-model="trafficForm.roadName"
                placeholder="输入道路名称"
                clearable
              />
            </el-col>
            <el-col :span="12">
              <el-select
                v-model="trafficForm.roadType"
                placeholder="选择道路类型"
                clearable
                style="width: 100%"
              >
                <el-option label="高速公路" value="highway" />
                <el-option label="城市快速路" value="expressway" />
                <el-option label="主干道" value="main_road" />
                <el-option label="次干道" value="secondary_road" />
                <el-option label="支路" value="branch_road" />
                <el-option label="乡村公路" value="rural_road" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-col>
          </el-row>
          <div class="form-tip">道路名称和道路类型至少填写一项</div>
        </el-form-item>

        <!-- 时间区间 -->
        <el-form-item label="预测时间区间" required>
          <el-date-picker
            v-model="trafficForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 推理按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :icon="MagicStick"
            :loading="trafficForm.inferring"
            @click="runTrafficInference"
            :disabled="!canRunTrafficInference"
          >
            开始推理
          </el-button>
          <el-button size="large" @click="resetTrafficForm">重置</el-button>
        </el-form-item>

        <!-- 推理结果 -->
        <el-form-item v-if="trafficForm.completed">
          <div class="result-section">
            <el-alert
              title="推理完成！"
              type="success"
              :closable="false"
              show-icon
            >
              <template #default>
                <div class="result-info">
                  <div>预测数据点数：{{ trafficForm.result.count }}</div>
                  <div>预测时间范围：{{ trafficForm.result.timeRange }}</div>
                </div>
              </template>
            </el-alert>
            <el-button type="primary" size="large" :icon="Download" @click="downloadTrafficResult" class="download-btn">
              下载预测结果
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 污染物浓度预测模型调用 -->
    <el-card class="inference-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><DataAnalysis /></el-icon>
            污染物浓度预测模型调用
          </span>
          <el-tag type="info">版本：0121_version_1</el-tag>
        </div>
      </template>

      <el-form :model="pollutantForm" label-width="140px" label-position="left">
        <!-- 排放清单文件 -->
        <el-form-item label="排放清单文件" required>
          <el-upload
            ref="emissionUploadRef"
            class="upload-area"
            drag
            :auto-upload="false"
            :on-change="handleEmissionFileChange"
            accept=".csv"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                排放清单数据，CSV格式文件
              </div>
            </template>
          </el-upload>
          <div v-if="pollutantForm.emissionFile" class="file-info">
            <el-tag closable @close="clearEmissionFile" type="success">
              {{ pollutantForm.emissionFile.name }}
            </el-tag>
          </div>
        </el-form-item>

        <!-- 气象文件 -->
        <el-form-item label="气象文件" required>
          <el-upload
            ref="weatherUploadRef"
            class="upload-area"
            drag
            :auto-upload="false"
            :on-change="handleWeatherFileChange"
            accept=".csv"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                气象数据，CSV格式文件
              </div>
            </template>
          </el-upload>
          <div v-if="pollutantForm.weatherFile" class="file-info">
            <el-tag closable @close="clearWeatherFile" type="success">
              {{ pollutantForm.weatherFile.name }}
            </el-tag>
          </div>
        </el-form-item>

        <!-- 历史污染物浓度文件 -->
        <el-form-item label="历史浓度文件" required>
          <el-upload
            ref="historyUploadRef"
            class="upload-area"
            drag
            :auto-upload="false"
            :on-change="handleHistoryFileChange"
            accept=".csv"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                历史污染物浓度数据，CSV格式文件
              </div>
            </template>
          </el-upload>
          <div v-if="pollutantForm.historyFile" class="file-info">
            <el-tag closable @close="clearHistoryFile" type="success">
              {{ pollutantForm.historyFile.name }}
            </el-tag>
          </div>
        </el-form-item>

        <!-- 时间区间 -->
        <el-form-item label="预测时间区间" required>
          <el-date-picker
            v-model="pollutantForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 污染物类型 -->
        <el-form-item label="污染物类型" required>
          <el-select v-model="pollutantForm.pollutantType" placeholder="选择预测的污染物类型" style="width: 100%">
            <el-option label="PM2.5" value="pm25" />
            <el-option label="NO2" value="no2" />
            <el-option label="PM10" value="pm10" />
            <el-option label="O3" value="o3" />
            <el-option label="CO" value="co" />
          </el-select>
        </el-form-item>

        <!-- 推理按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :icon="MagicStick"
            :loading="pollutantForm.inferring"
            @click="runPollutantInference"
            :disabled="!canRunPollutantInference"
          >
            开始推理
          </el-button>
          <el-button size="large" @click="resetPollutantForm">重置</el-button>
        </el-form-item>

        <!-- 推理结果 -->
        <el-form-item v-if="pollutantForm.completed">
          <div class="result-section">
            <el-alert
              title="推理完成！"
              type="success"
              :closable="false"
              show-icon
            >
              <template #default>
                <div class="result-info">
                  <div>预测数据点数：{{ pollutantForm.result.count }}</div>
                  <div>预测时间范围：{{ pollutantForm.result.timeRange }}</div>
                  <div>预测污染物：{{ pollutantForm.result.pollutantName }}</div>
                </div>
              </template>
            </el-alert>
            <el-button type="primary" size="large" :icon="Download" @click="downloadPollutantResult" class="download-btn">
              下载预测结果
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Van, DataAnalysis, MagicStick, UploadFilled, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const trafficForm = ref({
  roadName: '',
  roadType: '',
  timeRange: [],
  inferring: false,
  completed: false,
  result: {
    count: 0,
    timeRange: ''
  }
})

const pollutantForm = ref({
  emissionFile: null,
  weatherFile: null,
  historyFile: null,
  timeRange: [],
  pollutantType: 'pm25',
  inferring: false,
  completed: false,
  result: {
    count: 0,
    timeRange: '',
    pollutantName: ''
  }
})

const canRunTrafficInference = computed(() => {
  return (trafficForm.value.roadName || trafficForm.value.roadType) &&
         trafficForm.value.timeRange &&
         trafficForm.value.timeRange.length === 2 &&
         !trafficForm.value.inferring
})

const canRunPollutantInference = computed(() => {
  return pollutantForm.value.emissionFile &&
         pollutantForm.value.weatherFile &&
         pollutantForm.value.historyFile &&
         pollutantForm.value.timeRange &&
         pollutantForm.value.timeRange.length === 2 &&
         pollutantForm.value.pollutantType &&
         !pollutantForm.value.inferring
})

// 文件上传处理
const handleEmissionFileChange = (file) => {
  pollutantForm.value.emissionFile = file.raw
}

const handleWeatherFileChange = (file) => {
  pollutantForm.value.weatherFile = file.raw
}

const handleHistoryFileChange = (file) => {
  pollutantForm.value.historyFile = file.raw
}

// 清除文件
const clearEmissionFile = () => {
  pollutantForm.value.emissionFile = null
}

const clearWeatherFile = () => {
  pollutantForm.value.weatherFile = null
}

const clearHistoryFile = () => {
  pollutantForm.value.historyFile = null
}

// 重置表单
const resetTrafficForm = () => {
  trafficForm.value = {
    roadName: '',
    roadType: '',
    timeRange: [],
    inferring: false,
    completed: false,
    result: {
      count: 0,
      timeRange: ''
    }
  }
}

const resetPollutantForm = () => {
  pollutantForm.value = {
    emissionFile: null,
    weatherFile: null,
    historyFile: null,
    timeRange: [],
    pollutantType: 'pm25',
    inferring: false,
    completed: false,
    result: {
      count: 0,
      timeRange: '',
      pollutantName: ''
    }
  }
}

// 模拟推理过程
const runTrafficInference = () => {
  trafficForm.value.inferring = true
  ElMessage.info('正在进行车流量预测推理...')

  setTimeout(() => {
    trafficForm.value.inferring = false
    trafficForm.value.completed = true

    // 计算预测点数（每小时一个点）
    const startTime = new Date(trafficForm.value.timeRange[0])
    const endTime = new Date(trafficForm.value.timeRange[1])
    const hours = Math.floor((endTime - startTime) / (1000 * 60 * 60))

    trafficForm.value.result = {
      count: hours,
      timeRange: `${trafficForm.value.timeRange[0]} ~ ${trafficForm.value.timeRange[1]}`
    }

    ElMessage.success('车流量预测推理完成！')
  }, 2000)
}

const runPollutantInference = () => {
  pollutantForm.value.inferring = true
  ElMessage.info(`正在进行${pollutantForm.value.pollutantType.toUpperCase()}浓度预测推理...`)

  setTimeout(() => {
    pollutantForm.value.inferring = false
    pollutantForm.value.completed = true

    // 计算预测点数（每小时一个点）
    const startTime = new Date(pollutantForm.value.timeRange[0])
    const endTime = new Date(pollutantForm.value.timeRange[1])
    const hours = Math.floor((endTime - startTime) / (1000 * 60 * 60))

    const pollutantNames = {
      pm25: 'PM2.5',
      no2: 'NO2',
      pm10: 'PM10',
      o3: 'O3',
      co: 'CO'
    }

    pollutantForm.value.result = {
      count: hours,
      timeRange: `${pollutantForm.value.timeRange[0]} ~ ${pollutantForm.value.timeRange[1]}`,
      pollutantName: pollutantNames[pollutantForm.value.pollutantType]
    }

    ElMessage.success('污染物浓度预测推理完成！')
  }, 2000)
}

// 下载结果（模拟）
const downloadTrafficResult = () => {
  // 模拟CSV文件内容
  const csvContent = `时间,道路名称,道路类型,预测车流量
${trafficForm.value.timeRange[0]},${trafficForm.value.roadName || '全部'},${trafficForm.value.roadType || '全部'},150
${trafficForm.value.timeRange[1]},${trafficForm.value.roadName || '全部'},${trafficForm.value.roadType || '全部'},165`

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `traffic_prediction_${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(link.href)

  ElMessage.success('文件下载成功！')
}

const downloadPollutantResult = () => {
  // 模拟CSV文件内容
  const csvContent = `时间,${pollutantForm.value.result.pollutantName}浓度预测值
${pollutantForm.value.timeRange[0]},35.2
${pollutantForm.value.timeRange[1]},38.5`

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${pollutantForm.value.pollutantType}_prediction_${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(link.href)

  ElMessage.success('文件下载成功！')
}
</script>

<style scoped>
.model-inference {
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
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.inference-card {
  margin-bottom: 20px;
}

.upload-area {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  background: #fafafa;
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background: #ecf5ff;
}

:deep(.el-upload__text) {
  font-size: 14px;
  color: #666;
}

:deep(.el-upload__tip) {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.file-info {
  margin-top: 12px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-info > div {
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

.download-btn {
  width: 200px;
}
</style>
