import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

// 邮箱验证正则
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 密码强度验证（至少8位，包含字母和数字）
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

// 手机号验证（中国大陆）
const phoneRegex = /^1[3-9]\d{9}$/;

// 验证中间件工厂函数
const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        return res.status(400).json({
          message: '输入数据验证失败',
          errors: result.array()
        });
      }
    }
    next();
  };
};

// 用户注册验证
export const validateUserRegistration = async (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, password, role, phone, age } = req.body;

  const errors: string[] = [];

  // 必填字段验证
  if (!name || name.trim().length < 2) {
    errors.push('姓名至少需要2个字符');
  }

  if (!email || !emailRegex.test(email)) {
    errors.push('请输入有效的邮箱地址');
  }

  if (!password || password.length < 6) {
    errors.push('密码至少需要6个字符');
  }

  if (!role || !Object.values(UserRole).includes(role)) {
    errors.push('无效的用户角色');
  }

  // 可选字段验证
  if (phone && !phoneRegex.test(phone)) {
    errors.push('请输入有效的手机号码');
  }

  if (age !== undefined && (age < 10 || age > 100)) {
    errors.push('年龄必须在10-100之间');
  }

  if (errors.length > 0) {
    res.status(400).json({
      message: '输入数据验证失败',
      errors
    });
    return;
  }

  // 清理输入数据（防止XSS）
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  if (req.body.studentId) req.body.studentId = req.body.studentId.trim();
  if (req.body.teacherId) req.body.teacherId = req.body.teacherId.trim();
  if (req.body.phone) req.body.phone = req.body.phone.trim();

  next();
};

// 用户登录验证
export const validateUserLogin = async (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  const errors: string[] = [];

  if (!email || !emailRegex.test(email)) {
    errors.push('请输入有效的邮箱地址');
  }

  if (!password || password.length < 6) {
    errors.push('密码至少需要6个字符');
  }

  if (errors.length > 0) {
    res.status(400).json({
      message: '输入数据验证失败',
      errors
    });
    return;
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

// 情绪记录验证
export const validateEmotionRecord = async (req: Request, res: Response, next: NextFunction): void => {
  const { type, content } = req.body;

  const errors: string[] = [];

  if (!type) {
    errors.push('情绪识别类型不能为空');
  }

  // 防止XSS攻击 - 清理用户输入
  if (content && typeof content === 'string') {
    // 移除潜在的HTML/JavaScript标签
    req.body.content = content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  if (errors.length > 0) {
    res.status(400).json({
      message: '输入数据验证失败',
      errors
    });
    return;
  }

  next();
};

// 通用错误处理中间件
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('错误:', err);

  // 不向客户端泄露详细的错误信息
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    message: '服务器内部错误',
    error: isDevelopment ? err.message : '请联系管理员',
    ...(isDevelopment && { stack: err.stack })
  });
};
