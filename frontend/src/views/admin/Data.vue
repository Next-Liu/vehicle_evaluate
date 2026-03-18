<template>
  <div class="data-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据管理</span>
          <div class="header-actions">
            <el-select v-model="selectedType" placeholder="数据类型" style="width: 150px; margin-right: 10px" @change="filterData">
              <el-option label="全部" value="" />
              <el-option label="空气质量" value="air_quality" />
              <el-option label="排放清单" value="emission" />
              <el-option label="车流量" value="traffic" />
              <el-option label="气象数据" value="weather" />
            </el-select>
            <el-button type="primary" :icon="Plus" @click="openAddDialog">添加数据</el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredData" style="width: 100%" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="数据名称" width="200" />
        <el-table-column prop="type" label="数据类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="数据大小" width="100" />
        <el-table-column prop="records" label="记录数" width="100" />
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column prop="uploader" label="上传者" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewData(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="editData(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="deleteData(row)">删除</el-button>
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

    <!-- 添加/编辑数据对话框 -->
    <el-dialog
      v-model="showDataDialog"
      :title="dialogMode === 'add' ? '添加数据' : '编辑数据'"
      width="600px"
    >
      <el-form :model="dataForm" label-width="100px">
        <el-form-item label="数据名称">
          <el-input v-model="dataForm.name" placeholder="请输入数据名称" />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select v-model="dataForm.type" placeholder="请选择数据类型" style="width: 100%">
            <el-option label="空气质量" value="air_quality" />
            <el-option label="排放清单" value="emission" />
            <el-option label="车流量" value="traffic" />
            <el-option label="气象数据" value="weather" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".csv,.xlsx"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
          <div v-if="dataForm.fileName" class="file-info">
            已选择: {{ dataForm.fileName }}
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dataForm.description" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDataDialog = false">取消</el-button>
        <el-button type="primary" @click="saveData">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看数据对话框 -->
    <el-dialog v-model="showViewDialog" title="数据详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="数据名称">{{ currentData.name }}</el-descriptions-item>
        <el-descriptions-item label="数据类型">{{ getTypeName(currentData.type) }}</el-descriptions-item>
        <el-descriptions-item label="数据大小">{{ currentData.size }}</el-descriptions-item>
        <el-descriptions-item label="记录数">{{ currentData.records }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ currentData.uploadTime }}</el-descriptions-item>
        <el-descriptions-item label="上传者">{{ currentData.uploader }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentData.description || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const dataList = ref([
  {
    id: 1,
    name: '苏州市2022年空气质量数据',
    type: 'air_quality',
    size: '125 MB',
    records: 8760,
    uploadTime: '2026-01-05 10:30:00',
    uploader: 'admin',
    description: '苏州市12个国控点2022年全年逐小时空气质量监测数据'
  },
  {
    id: 2,
    name: '2022年机动车排放清单',
    type: 'emission',
    size: '187 MB',
    records: 8760,
    uploadTime: '2026-01-08 14:20:00',
    uploader: 'admin',
    description: '2022年度机动车污染物排放清单数据'
  },
  {
    id: 3,
    name: '苏州市车流量监测数据',
    type: 'traffic',
    size: '280 MB',
    records: 291736,
    uploadTime: '2026-01-12 09:15:00',
    uploader: 'admin',
    description: '苏州市道路交通流量逐小时监测数据'
  },
  {
    id: 4,
    name: '2022年气象数据',
    type: 'weather',
    size: '53 MB',
    records: 8760,
    uploadTime: '2026-01-15 16:45:00',
    uploader: 'admin',
    description: '苏州市2022年逐小时气象数据（温度、湿度、风速等）'
  }
])

const selectedType = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showDataDialog = ref(false)
const showViewDialog = ref(false)
const dialogMode = ref('add')
const currentData = ref({})
const dataForm = ref({
  id: null,
  name: '',
  type: '',
  fileName: '',
  records: 0,
  description: ''
})

const filteredData = computed(() => {
  if (!selectedType.value) {
    return dataList.value
  }
  return dataList.value.filter(item => item.type === selectedType.value)
})

const total = computed(() => filteredData.value.length)

const getTypeName = (type) => {
  const map = {
    air_quality: '空气质量',
    emission: '排放清单',
    traffic: '车流量',
    weather: '气象数据'
  }
  return map[type] || type
}

const getTypeColor = (type) => {
  const map = {
    air_quality: 'success',
    emission: 'warning',
    traffic: 'danger',
    weather: 'info'
  }
  return map[type] || ''
}

const filterData = () => {
  currentPage.value = 1
}

const openAddDialog = () => {
  dialogMode.value = 'add'
  dataForm.value = {
    id: null,
    name: '',
    type: '',
    fileName: '',
    records: 0,
    description: ''
  }
  showDataDialog.value = true
}

const editData = (row) => {
  dialogMode.value = 'edit'
  dataForm.value = {
    id: row.id,
    name: row.name,
    type: row.type,
    fileName: '',
    records: row.records,
    description: row.description || ''
  }
  showDataDialog.value = true
}

const saveData = () => {
  if (!dataForm.value.name || !dataForm.value.type) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (dialogMode.value === 'add') {
    const newData = {
      id: dataList.value.length + 1,
      name: dataForm.value.name,
      type: dataForm.value.type,
      size: '0 MB',
      records: dataForm.value.records,
      uploadTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      uploader: 'admin',
      description: dataForm.value.description
    }
    dataList.value.push(newData)
    ElMessage.success('数据添加成功')
  } else {
    const index = dataList.value.findIndex(d => d.id === dataForm.value.id)
    if (index > -1) {
      dataList.value[index].name = dataForm.value.name
      dataList.value[index].type = dataForm.value.type
      dataList.value[index].records = dataForm.value.records
      dataList.value[index].description = dataForm.value.description
      ElMessage.success('数据信息更新成功')
    }
  }

  showDataDialog.value = false
}

const deleteData = (row) => {
  ElMessageBox.confirm(`确定要删除数据 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = dataList.value.findIndex(d => d.id === row.id)
    if (index > -1) {
      dataList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const viewData = (row) => {
  currentData.value = row
  showViewDialog.value = true
}

const handleFileChange = (file) => {
  dataForm.value.fileName = file.name
}
</script>

<style scoped>
.data-management {
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

.file-info {
  margin-top: 10px;
  font-size: 12px;
  color: #409eff;
}
</style>
