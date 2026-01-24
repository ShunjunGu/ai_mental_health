import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
// 导入模型训练函数，但不立即执行
import { trainModel } from './services/emotionRecognitionService';
import { errorHandler } from './middlewares/validation';

// 加载环境变量
dotenv.config();

// 导入路由
import userRoutes from './routes/userRoutes';
import emotionRoutes from './routes/emotionRoutes';
import alertRoutes from './routes/alertRoutes';
import consultationRoutes from './routes/consultationRoutes';
import teacherDecisionSupportRoutes from './routes/teacherDecisionSupportRoutes';

const app = express();
// 配置服务器端口
// 使用.env文件中配置的固定端口
const PORT = parseInt(process.env.PORT || '57215', 10); // 确保PORT是数字类型，默认使用57215端口

// 中间件配置
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// 设置编码处理，确保正确解析中文
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// 修复：设置响应编码为UTF-8（这个中间件可以保留）
app.use((req, res, next) => {
  // 设置响应头
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 修复：完全自定义的JSON解析器，确保在最早阶段正确处理UTF-8编码的中文文本
app.use((req, res, next) => {
  // 如果不是POST/PUT/PATCH请求，或者没有content-type，直接跳过
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && 
      req.headers['content-type'] && 
      req.headers['content-type'].includes('application/json')) {
    
    let rawData = '';
    
    // 监听data事件，收集原始数据
    req.on('data', (chunk) => {
      // 确保使用UTF-8编码处理每个数据块
      rawData += chunk.toString('utf8');
    });
    
    // 监听end事件，处理完整的请求体
    req.on('end', () => {
      try {
        // 解析JSON数据
        req.body = JSON.parse(rawData);
        // 移除调试代码，避免TypeScript错误
        next();
      } catch (e) {
        // 如果解析失败，返回400错误
        res.status(400).json({
          error: 'Invalid JSON format',
          details: e instanceof Error ? e.message : 'Unknown error'
        });
      }
    });
  } else if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
    // 对于URL编码的请求，使用Express的默认解析器
    express.urlencoded({ 
      extended: true, 
      limit: '10mb',
      parameterLimit: 10000,
      inflate: true
    })(req, res, next);
  } else {
    // 对于其他类型的请求，直接跳过
    next();
  }
});

// 注意：我们不再使用Express默认的express.json()解析器，因为它可能导致中文编码问题

// 路由配置
app.use('/api/users', userRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/teacher-support', teacherDecisionSupportRoutes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'AI校园心理健康平台后端服务运行正常' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    message: '请求的资源不存在',
    path: req.path
  });
});

// 全局错误处理中间件（必须放在所有路由之后）
app.use(errorHandler);

// 连接数据库
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-mental-health';
    await mongoose.connect(mongoURI);
    console.log('MongoDB数据库连接成功');
    return true;
  } catch (error) {
    console.error('MongoDB数据库连接失败:', error);
    console.log('服务器将以降级模式启动（部分功能可能受限）');
    return false;
  }
};

// 启动服务器
const startServer = async () => {
  // 连接数据库
  await connectDB();

  try {
    // 捕获app.listen可能抛出的错误
    const server = app.listen(PORT, () => {
      // 获取实际分配的端口号
      const address = server.address();
      let actualPort: number;
      
      // 处理address可能是string或AddressInfo的情况
      if (typeof address === 'string') {
        // 如果address是字符串格式，尝试从字符串中提取端口号
        const match = address.match(/:(\d+)$/);
        actualPort = match ? parseInt(match[1], 10) : PORT;
      } else if (address && typeof address === 'object' && 'port' in address) {
        // 如果address是对象且有port属性
        actualPort = typeof address.port === 'number' ? address.port : PORT;
      } else {
        // 默认使用配置的端口号
        actualPort = PORT;
      }
      
      console.log(`服务器运行在 http://localhost:${actualPort}`);
      if (mongoose.connection.readyState === 1) {
        console.log('数据库连接成功，所有功能正常运行');
      } else {
        console.log('注意：数据库连接失败，部分功能可能受限，使用文件存储模式');
      }
      console.log('服务器状态: 正在监听端口', actualPort);
      
      // 服务器启动后，在后台异步训练模型
      console.log('准备在后台训练NLP情绪分析模型...');
      trainModel().catch(error => {
        console.error('模型训练失败，但不影响服务器运行:', error);
      });
    });

    // 监听服务器错误事件
    server.on('error', (error) => {
      console.error('服务器错误:', error);
    });

    // 监听进程终止事件
    process.on('SIGINT', () => {
      console.log('接收到中断信号，关闭服务器...');
      server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('启动服务器时发生错误:', error);
  }
};

startServer();