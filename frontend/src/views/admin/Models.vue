<template>
  <div class="models-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>模型管理</span>
          <div class="header-actions">
            <el-select v-model="selectedType" placeholder="模型类型" style="width: 150px; margin-right: 10px" @change="filterModels">
              <el-option label="全部" value="" />
              <el-option label="车流量预测" value="traffic" />
              <el-option label="污染物预测" value="pollutant" />
            </el-select>
            <el-button type="primary" :icon="Plus" @click="openAddDialog">添加模型</el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredModels" style="width: 100%" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="模型名称" width="200" />
        <el-table-column prop="type" label="模型类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'traffic' ? 'primary' : 'success'">
              {{ row.type === 'traffic' ? '车流量预测' : '污染物预测' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="130" />
        <el-table-column prop="metrics" label="性能指标" width="200">
          <template #default="{ row }">
            <div class="metrics">
              <span>R²: {{ row.metrics.r2 }}</span>
              <span>MAE: {{ row.metrics.mae }}</span>
              <span>RMSE: {{ row.metrics.rmse }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="creator" label="创建者" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '已发布' : '测试中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewModel(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="editModel(row)">编辑</el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              link
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'active' ? '停用' : '发布' }}
            </el-button>
            <el-button type="danger" link size="small" @click="deleteModel(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 添加/编辑模型对话框 -->
    <el-dialog
      v-model="showModelDialog"
      :title="dialogMode === 'add' ? '添加模型' : '编辑模型'"
      width="700px"
    >
      <el-form :model="modelForm" label-width="120px">
        <el-form-item label="模型名称">
          <el-input v-model="modelForm.name" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="模型类型">
          <el-select v-model="modelForm.type" placeholder="请选择模型类型" style="width: 100%" :disabled="dialogMode === 'edit'">
            <el-option label="车流量预测" value="traffic" />
            <el-option label="污染物预测" value="pollutant" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="modelForm.version" placeholder="如: 0120_version_1" />
        </el-form-item>
        <el-form-item label="模型地址">
          <el-input v-model="modelForm.modelPath" placeholder="请输入云端模型地址，如: https://model-server.example.com/api/models/model.pkl" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="modelForm.description" type="textarea" :rows="3" placeholder="请输入模型描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showModelDialog = false">取消</el-button>
        <el-button type="primary" @click="saveModel">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看模型对话框 -->
    <el-dialog v-model="showViewDialog" title="模型详情" width="900px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="模型名称">{{ currentModel.name }}</el-descriptions-item>
        <el-descriptions-item label="模型类型">
          <el-tag :type="currentModel.type === 'traffic' ? 'primary' : 'success'">
            {{ currentModel.type === 'traffic' ? '车流量预测' : '污染物预测' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="版本">{{ currentModel.version }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentModel.createTime }}</el-descriptions-item>
        <el-descriptions-item label="R²">{{ currentModel.metrics?.r2 }}</el-descriptions-item>
        <el-descriptions-item label="MAE">{{ currentModel.metrics?.mae }}</el-descriptions-item>
        <el-descriptions-item label="RMSE">{{ currentModel.metrics?.rmse }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ currentModel.creator }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentModel.status === 'active' ? 'success' : 'info'">
            {{ currentModel.status === 'active' ? '已发布' : '测试中' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="模型地址" :span="2">
          <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
            <span v-if="!showModelPath" style="color: #999; flex: 1;">••••••••••••••••</span>
            <span v-else style="flex: 1; word-break: break-all;">{{ currentModel.modelPath }}</span>
            <el-icon @click="toggleModelPathVisibility" style="cursor: pointer; flex-shrink: 0;">
              <component :is="showModelPath ? View : Hide" />
            </el-icon>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <div class="model-details" v-if="currentModel.type === 'traffic'">
        <h4>模型配置</h4>
        <el-table :data="getTrafficConfig()" border size="small">
          <el-table-column prop="param" label="参数" width="150" />
          <el-table-column prop="value" label="值" />
        </el-table>
      </div>

      <div class="model-details" v-else>
        <h4>模型配置</h4>
        <el-table :data="getPollutantConfig()" border size="small">
          <el-table-column prop="param" label="参数" width="150" />
          <el-table-column prop="value" label="值" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, View, Hide } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const modelsList = ref([
  {
    id: 1,
    name: '车流量预测模型',
    type: 'traffic',
    version: '0120_version_1',
    algorithm: 'LSTM',
    metrics: {
      r2: 0.837,
      mae: 75.264,
      rmse: 132.697
    },
    createTime: '2026-01-20 10:00:00',
    creator: 'admin',
    status: 'active',
    description: '基于LSTM的车流量预测模型，输入历史车流量和路网数据',
    modelPath: 'https://model-server.example.com/api/models/traffic_flow_0120_version_1.pkl'
  },
  {
    id: 2,
    name: 'PM2.5浓度预测模型',
    type: 'pollutant',
    version: '0121_version_1',
    algorithm: 'GRU',
    metrics: {
      r2: 0.912,
      mae: 8.435,
      rmse: 11.524
    },
    createTime: '2026-01-21 14:30:00',
    creator: 'admin',
    status: 'active',
    description: '基于GRU的PM2.5浓度预测模型，输入排放清单、气象和历史浓度数据',
    modelPath: 'https://model-server.example.com/api/models/pollutant_pm25_0121_version_1.pkl'
  },
  {
    id: 3,
    name: 'NO2浓度预测模型',
    type: 'pollutant',
    version: '0121_version_1',
    algorithm: 'GRU',
    metrics: {
      r2: 0.891,
      mae: 10.114,
      rmse: 14.639
    },
    createTime: '2026-01-21 14:30:00',
    creator: 'admin',
    status: 'active',
    description: '基于GRU的NO2浓度预测模型，输入排放清单、气象和历史浓度数据',
    modelPath: 'https://model-server.example.com/api/models/pollutant_no2_0121_version_1.pkl'
  }
])

const selectedType = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showModelDialog = ref(false)
const showViewDialog = ref(false)
const dialogMode = ref('add')
const currentModel = ref({})
const showModelPath = ref(false)
const modelForm = ref({
  id: null,
  name: '',
  type: '',
  version: '',
  modelPath: '',
  description: ''
})

const filteredModels = computed(() => {
  if (!selectedType.value) {
    return modelsList.value
  }
  return modelsList.value.filter(item => item.type === selectedType.value)
})

const total = computed(() => filteredModels.value.length)

const filterModels = () => {
  currentPage.value = 1
}

const openAddDialog = () => {
  dialogMode.value = 'add'
  modelForm.value = {
    id: null,
    name: '',
    type: '',
    version: '',
    modelPath: '',
    description: ''
  }
  showModelDialog.value = true
}

const editModel = (row) => {
  dialogMode.value = 'edit'
  modelForm.value = {
    id: row.id,
    name: row.name,
    type: row.type,
    version: row.version,
    modelPath: row.modelPath || '',
    description: row.description || ''
  }
  showModelDialog.value = true
}

const saveModel = () => {
  if (!modelForm.value.name || !modelForm.value.type || !modelForm.value.version) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (dialogMode.value === 'add') {
    const newModel = {
      id: modelsList.value.length + 1,
      name: modelForm.value.name,
      type: modelForm.value.type,
      version: modelForm.value.version,
      algorithm: '',
      metrics: {
        r2: 0,
        mae: 0,
        rmse: 0
      },
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      creator: 'admin',
      status: 'testing',
      modelPath: modelForm.value.modelPath,
      description: modelForm.value.description
    }
    modelsList.value.push(newModel)
    ElMessage.success('模型添加成功')
  } else {
    const index = modelsList.value.findIndex(m => m.id === modelForm.value.id)
    if (index > -1) {
      modelsList.value[index].name = modelForm.value.name
      modelsList.value[index].version = modelForm.value.version
      modelsList.value[index].modelPath = modelForm.value.modelPath
      modelsList.value[index].description = modelForm.value.description
      ElMessage.success('模型信息更新成功')
    }
  }

  showModelDialog.value = false
}

const viewModel = (row) => {
  currentModel.value = row
  showModelPath.value = false
  showViewDialog.value = true
}

const toggleModelPathVisibility = () => {
  showModelPath.value = !showModelPath.value
}

const deleteModel = (row) => {
  ElMessageBox.confirm(`确定要删除模型 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = modelsList.value.findIndex(m => m.id === row.id)
    if (index > -1) {
      modelsList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const toggleStatus = (row) => {
  const newStatus = row.status === 'active' ? 'testing' : 'active'
  const statusText = newStatus === 'active' ? '发布' : '停用'

  ElMessageBox.confirm(`确定要${statusText}模型 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = modelsList.value.findIndex(m => m.id === row.id)
    if (index > -1) {
      modelsList.value[index].status = newStatus
      ElMessage.success(`模型已${statusText}`)
    }
  }).catch(() => {})
}

const getTrafficConfig = () => {
  return [
    { param: '输入特征', value: '车流量、路网结构、时间特征' },
    { param: '输出特征', value: '未来车流量预测值' },
    { param: '时间粒度', value: '逐小时' },
    { param: '训练数据量', value: '1,241,351条' },
    { param: '优化器', value: 'Adam' },
    { param: '学习率', value: '0.001' },
    { param: '批次大小', value: '32' },
    { param: '训练轮次', value: '100' }
  ]
}

const getPollutantConfig = () => {
  return [
    { param: '输入特征', value: '排放清单、气象数据、历史浓度' },
    { param: '输出特征', value: '污染物浓度预测值' },
    { param: '时间粒度', value: '逐小时' },
    { param: '训练数据量', value: '6,097条' },
    { param: '优化器', value: 'Adam' },
    { param: '学习率', value: '0.001' },
    { param: '批次大小', value: '32' },
    { param: '训练轮次', value: '100' }
  ]
}
</script>

<style scoped>
.models-management {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.model-details {
  margin-top: 20px;
}

.model-details h4 {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}
</style>
