# 机动车管控政策效益评估系统

## 项目简介

机动车管控政策效益评估系统是一个通过多源数据融合与深度学习模型相结合，对城市交通排放及空气质量变化进行定量评估的平台，为机动车管控政策的制定、实施与优化提供科学、可靠的决策支持。

## 系统架构

### 技术栈

#### 后端
- **框架**: Spring Boot 3.2
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **时序数据**: InfluxDB
- **ORM**: MyBatis Plus
- **安全**: Spring Security + JWT
- **深度学习**: Python + PyTorch/TensorFlow

#### 前端
- **框架**: Vue 3 + Vite
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **图表**: ECharts

#### 部署
- **容器**: Docker + Docker Compose
- **Web服务器**: Nginx

## 项目结构

```
vehicle-emission-assessment/
├── backend/                    # 后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/com/vehicle/emission/
│   │       │   ├── controller/      # 控制器层
│   │       │   ├── service/         # 服务层
│   │       │   ├── mapper/          # 数据访问层
│   │       │   ├── entity/          # 实体类
│   │       │   ├── dto/             # 数据传输对象
│   │       │   ├── vo/              # 视图对象
│   │       │   ├── config/          # 配置类
│   │       │   ├── utils/           # 工具类
│   │       │   ├── security/        # 安全相关
│   │       │   └── exception/       # 异常处理
│   │       └── resources/
│   │           ├── application.yml  # 配置文件
│   │           └── mapper/          # MyBatis映射文件
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── api/             # API接口
│   │   ├── assets/          # 静态资源
│   │   ├── components/      # 公共组件
│   │   ├── composables/     # 组合式函数
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # 状态管理
│   │   ├── utils/           # 工具函数
│   │   ├── views/           # 页面组件
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
│
├── docker/                     # Docker配置
│   ├── docker-compose.yml
│   └── .env.example
│
├── docs/                       # 文档目录
│   └── 需求分析文档.md
│
└── README.md
```

## 快速开始

### 环境要求

- JDK 17+
- Node.js 20+
- Maven 3.9+
- Docker & Docker Compose
- MySQL 8.0
- Redis
- InfluxDB 2.7

### 使用Docker Compose启动（推荐）

1. 克隆项目
```bash
git clone <repository-url>
cd vehicle-emission-assessment
```

2. 配置环境变量
```bash
cd docker
cp .env.example .env
# 编辑.env文件，修改数据库密码等配置
```

3. 启动所有服务
```bash
docker-compose up -d
```

4. 访问系统
- 前端地址: http://localhost
- 后端API: http://localhost:8080/api
- Druid监控: http://localhost:8080/api/druid

### 手动部署

#### 后端部署

1. 进入后端目录
```bash
cd backend
```

2. 修改配置文件
```bash
# 编辑 src/main/resources/application.yml
# 配置数据库、Redis等连接信息
```

3. 构建项目
```bash
mvn clean package
```

4. 运行
```bash
java -jar target/emission-assessment-1.0.0.jar
```

#### 前端部署

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 开发模式运行
```bash
npm run dev
```

4. 生产构建
```bash
npm run build
```

## 数据库初始化

首次运行需要初始化数据库，请执行 `docker/init.sql` 文件中的SQL语句。

主要数据表：
- `sys_user`: 用户表
- `air_quality`: 空气质量监测数据表
- `traffic_flow`: 交通流量数据表
- `emission_inventory`: 排放清单表
- `policy_scenario`: 政策情景表
- `assessment_result`: 评估结果表

## 用户角色

系统支持两种用户角色：

### 普通用户 (USER)
- 查询空气质量数据
- 查看排放清单
- 进行政策情景模拟
- 查看评估报告
- 数据分析

### 管理员 (ADMIN)
- 用户管理
- 数据管理
- 模型配置
- 系统配置
- 所有普通用户权限

默认管理员账号：
- 用户名: admin
- 密码: admin123

## 主要功能模块

### 1. 数据管理模块
- 交通流量数据采集
- 空气质量监测数据接入
- 气象观测数据接入
- 数据清洗与预处理

### 2. 排放清单模块
- 机动车排放清单构建
- 高时空分辨率排放计算
- 排放数据查询与统计
- 排放空间分布可视化

### 3. 模型管理模块
- 深度学习模型训练
- 模型评估与对比
- 模型部署与推理
- 特征重要性分析

### 4. 政策评估模块
- 政策情景管理
- 政策情景模拟
- 效益定量评估
- 评估报告生成

### 5. 可视化展示模块
- 空气质量时空分布展示
- 排放清单可视化
- 政策对比分析
- 交互式图表

### 6. 系统管理模块
- 用户管理
- 角色权限管理
- 系统配置
- 日志监控

## 开发指南

### 后端开发

1. 代码规范
   - 遵循阿里巴巴Java开发手册
   - 使用Lombok简化代码
   - 统一异常处理

2. API设计
   - RESTful风格
   - 统一返回格式 `Result<T>`
   - JWT认证

3. 数据库
   - 使用MyBatis Plus
   - 逻辑删除
   - 自动填充创建/更新时间

### 前端开发

1. 代码规范
   - 使用ESLint + Prettier
   - Vue 3 Composition API
   - TypeScript类型检查

2. 组件规范
   - 单一职责
   - Props验证
   - 事件命名

3. 状态管理
   - 使用Pinia
   - 模块化组织

## API文档

系统提供Swagger API文档，启动后端服务后访问：
```
http://localhost:8080/api/doc.html
```

## 测试

### 后端测试
```bash
cd backend
mvn test
```

### 前端测试
```bash
cd frontend
npm run lint
```

## 常见问题

1. **数据库连接失败**
   - 检查MySQL服务是否启动
   - 检查application.yml中的数据库配置

2. **Redis连接失败**
   - 检查Redis服务是否启动
   - 检查防火墙设置

3. **前端API请求失败**
   - 检查代理配置 vite.config.js
   - 检查后端服务是否启动

4. **Docker容器启动失败**
   - 检查端口是否被占用
   - 查看容器日志: `docker-compose logs`

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

本项目采用 MIT 许可证

## 联系方式

- 项目地址: [GitHub Repository]
- 问题反馈: [Issues]

---

**机动车管控政策效益评估系统** © 2026
