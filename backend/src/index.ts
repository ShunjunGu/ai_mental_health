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
const PORT = process.env.PORT || 5000;

// 中间件配置
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 路由配置
app.use('/api/users', userRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/teacher-support', teacherDecisionSupportRoutes);

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'AI校园心理健康平台后端服务运行正常' });
});

// 连接数据库
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-mental-health';
    await mongoose.connect(mongoURI);
    console.log('MongoDB数据库连接成功');
  } catch (error) {
    console.error('MongoDB数据库连接失败:', error);
    process.exit(1);
  }
};

// 启动服务器
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
};

startServer();