<template>
  <div class="model-training">
    <!-- 车流量预测模型训练 -->
    <el-card class="training-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Van /></el-icon>
            车流量预测模型训练
          </span>
        </div>
      </template>

      <el-form :model="trafficForm" label-width="140px" label-position="left">
        <!-- 车流量数据 -->
        <el-form-item label="车流量数据" required>
          <el-upload
            ref="trafficUploadRef"
            class="upload-area"
            drag
            :auto-upload="false"
            :on-change="handleTrafficFileChange"
            accept=".csv"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持逐小时车流量数据，CSV格式文件
              </div>
            </template>
          </el-upload>
          <div v-if="trafficForm.trafficFile" class="file-info">
            <el-tag closable @close="clearTrafficFile" type="success">
              {{ trafficForm.trafficFile.name }}
            </el-tag>
          </div>
        </el-form-item>

        <!-- 路网数据 -->
        <el-form-item label="路网数据" required>
          <el-upload
            ref="roadNetworkUploadRef"
            class="upload-area"
            drag
            :auto-upload="false"
            :on-change="handleRoadNetworkFileChange"
            accept=".csv"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                路网拓扑结构数据，CSV格式文件
              </div>
            </template>
          </el-upload>
          <div v-if="trafficForm.roadNetworkFile" class="file-info">
            <el-tag closable @close="clearRoadNetworkFile" type="success">
              {{ trafficForm.roadNetworkFile.name }}
            </el-tag>
          </div>
        </el-form-item>

        <!-- 时间选择 -->
        <el-form-item label="训练时间范围" required>
          <el-date-picker
            v-model="trafficForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 模型参数 -->
        <el-form-item label="模型参数">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="param-item">
                <span class="param-label">训练轮次</span>
                <el-input-number
                  v-model="trafficForm.epochs"
                  :min="10"
                  :max="1000"
                  controls-position="right"
                  class="param-input"
                />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="param-item">
                <span class="param-label">批次大小</span>
                <el-input-number
                  v-model="trafficForm.batchSize"
                  :min="16"
                  :max="256"
                  :step="16"
                  controls-position="right"
                  class="param-input"
                />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="param-item">
                <span class="param-label">学习率</span>
                <el-input-number
                  v-model="trafficForm.learningRate"
                  :min="0.0001"
                  :max="0.1"
                  :step="0.0001"
                  :precision="4"
                  controls-position="right"
                  class="param-input"
                />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="param-item">
                <span class="param-label">优化器</span>
                <el-select v-model="trafficForm.optimizer" class="param-input">
                  <el-option label="Adam" value="adam" />
                  <el-option label="SGD" value="sgd" />
                  <el-option label="RMSprop" value="rmsprop" />
                </el-select>
              </div>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 训练按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :icon="VideoPlay"
            :loading="trafficForm.training"
            @click="startTrafficTraining"
            :disabled="!canStartTrafficTraining"
          >
            开始训练
          </el-button>
          <el-button size="large" @click="resetTrafficForm">重置</el-button>
        </el-form-item>

        <!-- 训练进度 -->
        <el-form-item v-if="trafficForm.training">
          <div class="training-progress">
            <div class="progress-info">
              <span>训练进度：{{ trafficForm.progress }}%</span>
              <span>预计剩余时间：{{ trafficForm.remainingTime }}</span>
            </div>
            <el-progress
              :percentage="trafficForm.progress"
              :color="trafficProgressColor"
              :stroke-width="20"
            />
            <div class="loss-info">
              <span>当前损失：{{ trafficForm.currentLoss }}</span>
              <span>最佳损失：{{ trafficForm.bestLoss }}</span>
            </div>
          </div>
        </el-form-item>

        <!-- 训练结果 -->
        <el-form-item v-if="trafficForm.completed">
          <el-alert
            title="训练完成！"
            type="success"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="training-result">
                <div>模型已保存至：{{ trafficForm.modelPath }}</div>
                <div>R² = {{ trafficForm.metrics.r2 }}</div>
                <div>MAE = {{ trafficForm.metrics.mae }}</div>
                <div>RMSE = {{ trafficForm.metrics.rmse }}</div>
              </div>
            </template>
          </el-alert>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 污染物浓度预测模型训练 -->
    <el-card class="training-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><DataAnalysis /></el-icon>
            污染物浓度预测模型训练
          </span>
        </div>
      </template>

      <el-form :model="pollutantForm" label-width="140px" label-position="left">
        <!-- 排放清单数据 -->
        <el-form-item label="排放清单数据" required>
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
                逐小时排放清单数据，CSV格式文件
              </div>
            </template>
          </el-upload>
          <div v-if="pollutantForm.emissionFile" class="file-info">
            <el-tag closable @close="clearEmissionFile" type="success">
              {{ pollutantForm.emissionFile.name }}
            </el-tag>
          </div>
        </el-form-item>

        <!-- 历史污染物浓度 -->
        <el-form-item label="历史污染物浓度" required>
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
                逐小时历史污染物浓度数据，CSV格式文件
              </div>
            </template>
          </el-upload>
          <div v-if="pollutantForm.historyFile" class="file-info">
            <el-tag closable @close="clearHistoryFile" type="success">
              {{ pollutantForm.historyFile.name }}
            </el-tag>
          </div>
        </el-form-item>

        <!-- 气象数据 -->
        <el-form-item label="气象数据" required>
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
                逐小时气象数据（温度、湿度、风速等），CSV格式文件
              </div>
            </template>
          </el-upload>
          <div v-if="pollutantForm.weatherFile" class="file-info">
            <el-tag closable @close="clearWeatherFile" type="success">
              {{ pollutantForm.weatherFile.name }}
            </el-tag>
          </div>
        </el-form-item>

        <!-- 时间选择 -->
        <el-form-item label="训练时间范围" required>
          <el-date-picker
            v-model="pollutantForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
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

        <!-- 模型参数 -->
        <el-form-item label="模型参数">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="param-item">
                <span class="param-label">训练轮次</span>
                <el-input-number
                  v-model="pollutantForm.epochs"
                  :min="10"
                  :max="1000"
                  controls-position="right"
                  class="param-input"
                />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="param-item">
                <span class="param-label">批次大小</span>
                <el-input-number
                  v-model="pollutantForm.batchSize"
                  :min="16"
                  :max="256"
                  :step="16"
                  controls-position="right"
                  class="param-input"
                />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="param-item">
                <span class="param-label">学习率</span>
                <el-input-number
                  v-model="pollutantForm.learningRate"
                  :min="0.0001"
                  :max="0.1"
                  :step="0.0001"
                  :precision="4"
                  controls-position="right"
                  class="param-input"
                />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="param-item">
                <span class="param-label">优化器</span>
                <el-select v-model="pollutantForm.optimizer" class="param-input">
                  <el-option label="Adam" value="adam" />
                  <el-option label="SGD" value="sgd" />
                  <el-option label="RMSprop" value="rmsprop" />
                </el-select>
              </div>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 训练按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :icon="VideoPlay"
            :loading="pollutantForm.training"
            @click="startPollutantTraining"
            :disabled="!canStartPollutantTraining"
          >
            开始训练
          </el-button>
          <el-button size="large" @click="resetPollutantForm">重置</el-button>
        </el-form-item>

        <!-- 训练进度 -->
        <el-form-item v-if="pollutantForm.training">
          <div class="training-progress">
            <div class="progress-info">
              <span>训练进度：{{ pollutantForm.progress }}%</span>
              <span>预计剩余时间：{{ pollutantForm.remainingTime }}</span>
            </div>
            <el-progress
              :percentage="pollutantForm.progress"
              :color="pollutantProgressColor"
              :stroke-width="20"
            />
            <div class="loss-info">
              <span>当前损失：{{ pollutantForm.currentLoss }}</span>
              <span>最佳损失：{{ pollutantForm.bestLoss }}</span>
            </div>
          </div>
        </el-form-item>

        <!-- 训练结果 -->
        <el-form-item v-if="pollutantForm.completed">
          <el-alert
            title="训练完成！"
            type="success"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="training-result">
                <div>模型已保存至：{{ pollutantForm.modelPath }}</div>
                <div>R² = {{ pollutantForm.metrics.r2 }}</div>
                <div>MAE = {{ pollutantForm.metrics.mae }}</div>
                <div>RMSE = {{ pollutantForm.metrics.rmse }}</div>
              </div>
            </template>
          </el-alert>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据说明提示 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><InfoFilled /></el-icon>
            数据格式说明
          </span>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="时间尺度">
          所有输入数据的时间尺度应为<span class="highlight">逐小时</span>
        </el-descriptions-item>
        <el-descriptions-item label="文件格式">
          支持的文件格式为<span class="highlight">CSV</span>
        </el-descriptions-item>
        <el-descriptions-item label="编码格式">
          推荐使用<span class="highlight">UTF-8</span>编码
        </el-descriptions-item>
        <el-descriptions-item label="数据要求">
          数据文件应包含表头，第一行为字段名称
        </el-descriptions-item>
        <el-descriptions-item label="车流量数据">
          应包含车流量数值等字段
        </el-descriptions-item>
        <el-descriptions-item label="路网数据">
          应包含路段ID、道路类型等字段
        </el-descriptions-item>
        <el-descriptions-item label="排放清单">
          应包含污染物类型、排放量等字段
        </el-descriptions-item>
        <el-descriptions-item label="历史浓度">
          应包含PM2.5、NO2、PM10、O3、CO等字段
        </el-descriptions-item>
        <el-descriptions-item label="气象数据">
          应包含温度、湿度、风速、风向等字段
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Van, DataAnalysis, VideoPlay, UploadFilled, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const trafficForm = ref({
  trafficFile: null,
  roadNetworkFile: null,
  dateRange: [],
  epochs: 100,
  batchSize: 32,
  learningRate: 0.001,
  optimizer: 'adam',
  training: false,
  progress: 0,
  remainingTime: '00:00:00',
  currentLoss: 0,
  bestLoss: Infinity,
  completed: false,
  modelPath: '',
  metrics: { r2: 0, mae: 0, rmse: 0 }
})

const pollutantForm = ref({
  emissionFile: null,
  historyFile: null,
  weatherFile: null,
  dateRange: [],
  pollutantType: 'pm25',
  epochs: 100,
  batchSize: 32,
  learningRate: 0.001,
  optimizer: 'adam',
  training: false,
  progress: 0,
  remainingTime: '00:00:00',
  currentLoss: 0,
  bestLoss: Infinity,
  completed: false,
  modelPath: '',
  metrics: { r2: 0, mae: 0, rmse: 0 }
})

const canStartTrafficTraining = computed(() => {
  return trafficForm.value.trafficFile &&
         trafficForm.value.roadNetworkFile &&
         trafficForm.value.dateRange &&
         trafficForm.value.dateRange.length === 2 &&
         !trafficForm.value.training
})

const canStartPollutantTraining = computed(() => {
  return pollutantForm.value.emissionFile &&
         pollutantForm.value.historyFile &&
         pollutantForm.weatherFile &&
         pollutantForm.value.dateRange &&
         pollutantForm.value.dateRange.length === 2 &&
         pollutantForm.value.pollutantType &&
         !pollutantForm.value.training
})

const trafficProgressColor = computed(() => {
  const progress = trafficForm.value.progress
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
})

const pollutantProgressColor = computed(() => {
  const progress = pollutantForm.value.progress
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
})

// 文件上传处理
const handleTrafficFileChange = (file) => {
  trafficForm.value.trafficFile = file.raw
}

const handleRoadNetworkFileChange = (file) => {
  trafficForm.value.roadNetworkFile = file.raw
}

const handleEmissionFileChange = (file) => {
  pollutantForm.value.emissionFile = file.raw
}

const handleHistoryFileChange = (file) => {
  pollutantForm.value.historyFile = file.raw
}

const handleWeatherFileChange = (file) => {
  pollutantForm.value.weatherFile = file.raw
}

// 清除文件
const clearTrafficFile = () => {
  trafficForm.value.trafficFile = null
}

const clearRoadNetworkFile = () => {
  trafficForm.value.roadNetworkFile = null
}

const clearEmissionFile = () => {
  pollutantForm.value.emissionFile = null
}

const clearHistoryFile = () => {
  pollutantForm.value.historyFile = null
}

const clearWeatherFile = () => {
  pollutantForm.value.weatherFile = null
}

// 重置表单
const resetTrafficForm = () => {
  trafficForm.value = {
    trafficFile: null,
    roadNetworkFile: null,
    dateRange: [],
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    optimizer: 'adam',
    training: false,
    progress: 0,
    remainingTime: '00:00:00',
    currentLoss: 0,
    bestLoss: Infinity,
    completed: false,
    modelPath: '',
    metrics: { r2: 0, mae: 0, rmse: 0 }
  }
}

const resetPollutantForm = () => {
  pollutantForm.value = {
    emissionFile: null,
    historyFile: null,
    weatherFile: null,
    dateRange: [],
    pollutantType: 'pm25',
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    optimizer: 'adam',
    training: false,
    progress: 0,
    remainingTime: '00:00:00',
    currentLoss: 0,
    bestLoss: Infinity,
    completed: false,
    modelPath: '',
    metrics: { r2:0, mae: 0, rmse: 0 }
  }
}

// 模拟训练过程
const simulateTraining = (form, modelName) => {
  form.training = true
  form.progress = 0
  form.currentLoss = 1.5
  form.bestLoss = Infinity

  const interval = setInterval(() => {
    form.progress += 2
    form.currentLoss = (form.currentLoss * 0.98 + Math.random() * 0.05).toFixed(6)

    if (parseFloat(form.currentLoss) < form.bestLoss) {
      form.bestLoss = form.currentLoss
    }

    // 计算剩余时间
    const remaining = 100 - form.progress
    const minutes = Math.floor(remaining / 2)
    const seconds = (remaining % 2) * 30
    form.remainingTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    if (form.progress >= 100) {
      clearInterval(interval)
      form.training = false
      form.completed = true
      form.modelPath = `/models/${modelName}_${Date.now()}.pkl`
      form.metrics = {
        r2: (0.85 + Math.random() * 0.1).toFixed(3),
        mae: (5 + Math.random() * 10).toFixed(3),
        rmse: (8 + Math.random() * 12).toFixed(3)
      }
      ElMessage.success(`${modelName}模型训练完成！`)
    }
  }, 500)
}

const startTrafficTraining = () => {
  ElMessage.info('开始训练车流量预测模型...')
  simulateTraining(trafficForm.value, 'traffic_flow')
}

const startPollutantTraining = () => {
  ElMessage.info(`开始训练${pollutantForm.value.pollutantType.toUpperCase()}浓度预测模型...`)
  simulateTraining(pollutantForm.value, pollutantForm.value.pollutantType)
}
</script>

<style scoped>
.model-training {
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

.training-card,
.info-card {
  margin-bottom: 25px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.training-card :deep(.el-card__header),
.info-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
  padding: 18px 20px;
}

.training-card :deep(.el-card__body),
.info-card :deep(.el-card__body) {
  padding: 25px;
}

.upload-area {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  border: 2px dashed #d0d7de;
  border-radius: 12px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  transition: all 0.3s ease;
}

:deep(.el-upload-dragger:hover) {
  border-color: #667eea;
  background: linear-gradient(135deg, #eef2ff 0%, #f8f9fa 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

:deep(.el-icon--upload) {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 10px;
}

:deep(.el-upload__text) {
  font-size: 15px;
  color: #374151;
  font-weight: 500;
}

:deep(.el-upload__text em) {
  color: #667eea;
  font-style: normal;
  font-weight: 600;
}

:deep(.el-upload__tip) {
  font-size: 13px;
  color: #6b7280;
  margin-top: 10px;
  background: rgba(102, 126, 234, 0.05);
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
}

.file-info {
  margin-top: 12px;
}

:deep(.el-tag) {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

:deep(.el-tag .el-icon) {
  color: white;
}

.training-progress {
  width: 100%;
  padding: 25px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 15px;
  color: #374151;
  font-weight: 600;
}

.loss-info {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 13px;
  color: #666;
}

.training-result {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.training-result > div {
  padding: 8px;
  background: #f0f9ff;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.highlight {
  color: #409eff;
  font-weight: bold;
  padding: 0 4px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

:deep(.param-item .el-input-number) {
  height: 40px;
  width: 140px;
}

:deep(.param-item .el-input-number .el-input__wrapper) {
  height: 40px;
}

:deep(.param-item .el-select) {
  width: 140px;
}

:deep(.param-item .el-select .el-select__wrapper) {
  height: 40px;
}
</style>
