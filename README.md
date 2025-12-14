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

## 测试配置

### 测试登录API (test-login-direct.js)

该测试文件用于直接测试后端的登录API，帮助开发者验证认证功能是否正常工作。

#### 配置步骤

1. **创建环境变量文件**
   在项目根目录创建一个`.env`文件，用于存储测试所需的敏感信息：
   ```bash
   touch .env
   ```

2. **配置环境变量**
   在`.env`文件中添加以下配置项：
   ```env
   # 测试登录用的邮箱和密码
   TEST_EMAIL=your_test_email@example.com
   TEST_PASSWORD=your_test_password
   
   # 测试服务器配置
   TEST_HOSTNAME=localhost
   TEST_PORT=57215
   ```
   
   - `TEST_EMAIL`: 用于测试登录的邮箱地址
   - `TEST_PASSWORD`: 用于测试登录的密码
   - `TEST_HOSTNAME`: 后端服务器主机名（默认为localhost）
   - `TEST_PORT`: 后端服务器端口（默认为57215）

3. **安装环境变量依赖**
   测试文件使用Node.js的环境变量功能，需要安装`dotenv`依赖：
   ```bash
   npm install dotenv --save-dev
   ```

4. **修改测试文件**（可选）
   如果你不想使用环境变量，也可以直接修改`test-login-direct.js`文件中的默认值：
   ```javascript
   const email = process.env.TEST_EMAIL || 'your_test_email@example.com';
   const password = process.env.TEST_PASSWORD || 'your_test_password';
   const hostname = process.env.TEST_HOSTNAME || 'localhost';
   const port = process.env.TEST_PORT || 57215;
   ```

#### 运行测试

1. **确保后端服务器正在运行**
   测试前请确保后端开发服务器已经启动：
   ```bash
   cd backend
   npm run dev
   ```

2. **运行测试文件**
   在项目根目录执行以下命令运行测试：
   ```bash
   node test-login-direct.js
   ```

#### 测试输出说明

测试运行后，你将看到类似以下的输出信息：
```
直接测试后端登录API...
测试配置：hostname=localhost, port=57215, email=test@example.com
请求数据: {"email":"test@example.com","password":"test1234"}
请求URL: http://localhost:57215/api/users/login
状态码: 200
响应头: { ... }
响应数据: {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
登录成功！
生成的token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 常见问题

1. **环境变量不生效**
   - 确保已安装`dotenv`依赖
   - 确保`.env`文件位于项目根目录
   - 检查环境变量的拼写是否正确

2. **连接错误**
   - 确保后端服务器正在运行
   - 检查`TEST_HOSTNAME`和`TEST_PORT`是否配置正确
   - 验证后端登录API的路径是否为`/api/users/login`

3. **登录失败**
   - 检查`TEST_EMAIL`和`TEST_PASSWORD`是否正确
   - 确保测试用户已在数据库中存在

## 许可证

MIT