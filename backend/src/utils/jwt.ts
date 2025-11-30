import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 生成JWT令牌
export const generateToken = (userId: string, role: string): string => {
  try {
    // 使用更简单的方式生成token，避免类型问题
    const token = jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' } // 直接使用字符串字面量
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; role: string };
    return decoded;
  } catch (error) {
    console.error('验证JWT令牌失败:', error);
    return null;
  }
};