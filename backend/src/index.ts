import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

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
// 让Node.js自动选择可用端口，避免冲突
const PORT = parseInt(process.env.PORT || '0', 10); // 确保PORT是数字类型，0表示自动选择可用端口

// 中间件配置
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// 设置编码处理，确保正确解析中文
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// 设置JSON解析器
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 设置请求和响应编码为UTF-8
app.use((req, res, next) => {
  // 设置响应头
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // 确保请求体使用UTF-8编码处理
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    (req as any).encoding = 'utf-8';
  }
  
  next();
});

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

// 连接数据库（暂时注释掉，确保服务器能启动）
/* const connectDB = async () => {
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
*/

// 启动服务器
const startServer = async () => {
  // 暂时不连接数据库，直接启动服务器
  console.log('跳过数据库连接，直接启动服务器');

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
      console.log('注意：当前模式下，数据库相关功能将不可用');
      console.log('服务器状态: 正在监听端口', actualPort);
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