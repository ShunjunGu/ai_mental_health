import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserRole } from '../types';

// 认证中间件
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    res.status(401).json({ message: '未提供认证令牌' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ message: '无效的认证令牌' });
    return;
  }

  // 将用户ID和角色添加到请求对象中
  (req as any).user = {
    userId: decoded.userId,
    role: decoded.role
  };

  next();
};

// 角色授权中间件
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role as UserRole)) {
      res.status(403).json({ message: '没有权限访问该资源' });
      return;
    }
    next();
  };
};

// 学生角色中间件
export const isStudent = authorize(UserRole.STUDENT);

// 教师角色中间件
export const isTeacher = authorize(UserRole.TEACHER);

// 咨询师角色中间件
export const isCounselor = authorize(UserRole.COUNSELOR);

// 管理员角色中间件
export const isAdmin = authorize(UserRole.ADMIN);

// 教师或管理员角色中间件
export const isTeacherOrAdmin = authorize(UserRole.TEACHER, UserRole.ADMIN);
// 咨询师或管理员角色中间件
export const isCounselorOrAdmin = authorize(UserRole.COUNSELOR, UserRole.ADMIN);
