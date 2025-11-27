# AI情绪识别校园心理健康SaaS平台

## 项目简介

这是一个基于AI情绪识别技术的校园心理健康管理SaaS平台，旨在帮助学校及时发现和干预学生心理健康问题，为教师和管理者提供决策支持。

## 技术栈

### 前端
- React.js
- TypeScript
- Vite

### 后端
- Node.js
- TypeScript

## 项目结构

```
├── backend/        # 后端代码
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── middlewares/   # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── services/      # 业务逻辑
│   │   ├── types/         # 类型定义
│   │   └── utils/         # 工具函数
│   └── tsconfig.json
├── frontend/       # 前端代码
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── services/      # API服务
│   │   ├── store/         # 状态管理
│   │   ├── types/         # 类型定义
│   │   └── utils/         # 工具函数
│   └── vite.config.ts
└── .gitignore
```

## 核心功能

1. **情绪识别**：基于AI技术识别学生的情绪状态
2. **教师决策支持**：为教师提供学生心理健康分析和建议
3. **预警系统**：对异常情绪状态进行预警
4. **心理咨询预约**：提供在线预约心理咨询的功能

## 开始使用

### 后端设置

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

### 前端设置

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

## 贡献指南

欢迎提交Issue和Pull Request。

## 许可证

MIT