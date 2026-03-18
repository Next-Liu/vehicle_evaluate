<template>
  <div class="users-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" :icon="Plus" @click="openAddDialog">添加用户</el-button>
        </div>
      </template>

      <el-table :data="users" style="width: 100%" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'primary'">
              {{ row.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="canTrainModel" label="模型训练权限" width="150">
          <template #default="{ row }">
            <el-switch
              v-model="row.canTrainModel"
              @change="handleTrainPermissionChange(row)"
              :disabled="row.role === 'ADMIN'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editUser(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="deleteUser(row)" :disabled="row.username === 'admin'">删除</el-button>
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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="showUserDialog"
      :title="dialogMode === 'add' ? '添加用户' : '编辑用户'"
      width="600px"
    >
      <el-form :model="userForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="dialogMode === 'edit'" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" v-if="dialogMode === 'add'">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="普通用户" value="USER" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型训练权限" v-if="userForm.role !== 'ADMIN'">
          <el-switch v-model="userForm.canTrainModel" />
          <span style="margin-left: 10px; color: #999;">是否允许该用户训练模型</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUserDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const users = ref([
  {
    id: 1,
    username: 'zhangwei',
    email: 'zhangwei@csee.org.cn',
    role: 'ADMIN',
    canTrainModel: true,
    createTime: '2025-12-20 10:00:00'
  },
  {
    id: 2,
    username: 'lihua',
    email: 'lihua@csee.org.cn',
    role: 'USER',
    canTrainModel: true,
    createTime: '2026-01-15 14:30:00'
  },
  {
    id: 3,
    username: 'wangming',
    email: 'wangming@tsinghua.edu.cn',
    role: 'USER',
    canTrainModel: false,
    createTime: '2026-01-25 09:20:00'
  },
  {
    id: 4,
    username: 'chenxi',
    email: 'chenxi@pku.edu.cn',
    role: 'USER',
    canTrainModel: false,
    createTime: '2026-01-28 16:45:00'
  },
  {
    id: 5,
    username: 'liuyang',
    email: 'liuyang@csee.org.cn',
    role: 'USER',
    canTrainModel: true,
    createTime: '2026-02-01 11:15:00'
  }
])

const showUserDialog = ref(false)
const dialogMode = ref('add')
const currentPage = ref(1)
const pageSize = ref(10)
const userForm = ref({
  id: null,
  username: '',
  email: '',
  password: '',
  role: 'USER',
  canTrainModel: false
})

const total = computed(() => users.value.length)

const openAddDialog = () => {
  dialogMode.value = 'add'
  userForm.value = {
    id: null,
    username: '',
    email: '',
    password: '',
    role: 'USER',
    canTrainModel: false
  }
  showUserDialog.value = true
}

const editUser = (row) => {
  dialogMode.value = 'edit'
  userForm.value = {
    id: row.id,
    username: row.username,
    email: row.email,
    password: '',
    role: row.role,
    canTrainModel: row.canTrainModel
  }
  showUserDialog.value = true
}

const saveUser = () => {
  if (!userForm.value.username || !userForm.value.email) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (dialogMode.value === 'add') {
    if (!userForm.value.password) {
      ElMessage.warning('请输入密码')
      return
    }
    const newUser = {
      id: users.value.length + 1,
      username: userForm.value.username,
      email: userForm.value.email,
      role: userForm.value.role,
      canTrainModel: userForm.value.role === 'ADMIN' ? true : userForm.value.canTrainModel,
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    }
    users.value.push(newUser)
    ElMessage.success('用户添加成功')
  } else {
    const index = users.value.findIndex(u => u.id === userForm.value.id)
    if (index > -1) {
      users.value[index].email = userForm.value.email
      users.value[index].role = userForm.value.role
      users.value[index].canTrainModel = userForm.value.role === 'ADMIN' ? true : userForm.value.canTrainModel
      ElMessage.success('用户信息更新成功')
    }
  }

  showUserDialog.value = false
}

const deleteUser = (row) => {
  ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = users.value.findIndex(u => u.id === row.id)
    if (index > -1) {
      users.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleTrainPermissionChange = (row) => {
  const status = row.canTrainModel ? '已授予' : '已取消'
  ElMessage.success(`${row.username} ${status}模型训练权限`)
}
</script>

<style scoped>
.users-management {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
