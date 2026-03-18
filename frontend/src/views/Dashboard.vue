<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.stationCount }}</div>
              <div class="stat-label">监测站点</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.policyCount }}</div>
              <div class="stat-label">政策情景</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.modelCount }}</div>
              <div class="stat-label">模型数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统功能模块</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8" v-for="module in modules" :key="module.name">
              <div class="module-card" @click="navigateTo(module.path)">
                <div class="module-icon" :style="{ background: module.color }">
                  <el-icon>
                    <component :is="module.icon" />
                  </el-icon>
                </div>
                <div class="module-name">{{ module.name }}</div>
                <div class="module-desc">{{ module.description }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>政策情景列表</span>
            </div>
          </template>
          <el-table :data="scenarios" style="width: 100%">
            <el-table-column prop="name" label="场景名称" width="120" />
            <el-table-column prop="description" label="政策描述" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewPolicy(row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Monitor, Document, DataAnalysis, Van, Odometer, MagicStick, Cpu, TrendCharts } from '@element-plus/icons-vue'

const router = useRouter()

const statistics = ref({
  stationCount: 12,
  policyCount: 5,
  modelCount: 2
})

const scenarios = ref([
  {
    name: '2025',
    description: '小型客车新能源占比7.2%，中重型货车新能源占比1.5%'
  },
  {
    name: 'S1',
    description: '小型客车新能源占比27.2%，中重型货车新能源占比1.5%'
  },
  {
    name: 'S2',
    description: '小型客车新能源占比7.2%，中重型货车新能源占比10%'
  },
  {
    name: 'S3',
    description: '小型客车新能源占比7.2%，中重型货车新能源占比25%'
  },
  {
    name: 'S4',
    description: '小型客车新能源占比27.2%，中重型货车新能源占比25%'
  }
])

const modules = ref([
  {
    name: '空气质量监测',
    description: '苏州市12个国控点实时AQI监测',
    icon: Monitor,
    color: '#409eff',
    path: '/air-quality'
  },
  {
    name: '排放清单',
    description: '2022年度机动车污染物排放统计',
    icon: Van,
    color: '#67c23a',
    path: '/emission'
  },
  {
    name: '污染物预测',
    description: 'PM2.5和NO2浓度预测模型结果',
    icon: DataAnalysis,
    color: '#e6a23c',
    path: '/pollutant-prediction'
  },
  {
    name: '车流量展示',
    description: '道路交通流量预测模型结果',
    icon: Odometer,
    color: '#f56c6c',
    path: '/traffic-flow'
  },
  {
    name: '模型调用',
    description: '车流量和污染物浓度预测推理',
    icon: Cpu,
    color: '#909399',
    path: '/model-inference'
  },
  {
    name: '模型训练',
    description: '深度学习模型训练与管理',
    icon: MagicStick,
    color: '#a18cd1',
    path: '/model-training'
  },
  {
    name: '特征分析',
    description: '气象和排放特征贡献度分析',
    icon: TrendCharts,
    color: '#f56c6c',
    path: '/feature-analysis'
  }
])

const viewPolicy = (row) => {
  router.push('/policy')
}

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.stat-card :deep(.el-card__body) {
  padding: 25px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

.card-header::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-right: 10px;
  border-radius: 2px;
}

.module-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.module-card:hover::before {
  opacity: 1;
}

.module-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  margin: 0 auto 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.module-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

.module-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

:deep(.el-button--text) {
  font-weight: 500;
}
</style>
