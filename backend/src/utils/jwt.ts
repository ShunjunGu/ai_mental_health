import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 统一的JWT密钥配置
const JWT_SECRET = process.env.JWT_SECRET || 'ai-mental-health-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 生成JWT令牌
export const generateToken = (userId: string, role: string): string => {
  try {
    const token = jwt.sign(
      { userId, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return token;
  } catch (error) {
    console.error('生成JWT令牌失败:', error);
    throw error;
  }
};

// 验证JWT令牌
export const verifyToken = (token: string): { userId: string; role: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    return decoded;
  } catch (error) {
    console.error('验证JWT令牌失败:', error);
    return null;
  }
};