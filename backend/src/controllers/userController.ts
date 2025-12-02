import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';
import fs from 'fs';
import path from 'path';

// 文件存储路径
const usersFilePath = path.join(__dirname, '../../data/users.json');

// 确保数据目录存在
const ensureDataDir = () => {
  const dataDir = path.dirname(usersFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// 读取用户数据
const readUsersFromFile = (): IUser[] => {
  ensureDataDir();
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('读取用户数据失败:', error);
    return [];
  }
};

// 写入用户数据
const writeUsersToFile = (users: IUser[]): void => {
  ensureDataDir();
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('写入用户数据失败:', error);
  }
};

// 内存存储用户数据（当MongoDB不可用时使用）
interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string;
  teacherId?: string;
  phone: string;
  gender: string;
  age: number;
  grade?: string;
  class?: string;
  department?: string;
  avatar?: string;
  comparePassword?: (password: string) => Promise<boolean>;
}

// 从文件加载用户数据
let memoryUsers: IUser[] = readUsersFromFile();
let nextUserId = Math.max(...memoryUsers.map(user => parseInt(user._id.split('_')[1] || '0')), 0) + 1;

// 生成JWT令牌的函数
const generateToken = (userId: string, role: UserRole) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'default-secret-key', {
    expiresIn: '24h',
  });
};

// 用户注册
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, studentId, teacherId, phone, gender, age, grade, class: studentClass, department } = req.body;

    console.log('接收到注册请求:', { name, email, role });

    // 使用内存存储
    // 检查邮箱是否已存在
    const existingUser = memoryUsers.find(user => user.email === email);
    if (existingUser) {
      res.status(400).json({ message: '该邮箱已被注册' });
      return;
    }

    // 检查学号/工号是否已存在
    if (studentId) {
      const existingStudent = memoryUsers.find(user => user.studentId === studentId);
      if (existingStudent) {
        res.status(400).json({ message: '该学号已被注册' });
        return;
      }
    }

    if (teacherId) {
      const existingTeacher = memoryUsers.find(user => user.teacherId === teacherId);
      if (existingTeacher) {
        res.status(400).json({ message: '该工号已被注册' });
        return;
      }
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const newUser: IUser = {
      _id: `user_${nextUserId++}`,
      name,
      email,
      password: hashedPassword,
      role,
      studentId,
      teacherId,
      phone,
      gender,
      age,
      grade,
      class: studentClass,
      department,
      // 添加密码比较方法
      comparePassword: async (password: string) => {
        return await bcrypt.compare(password, newUser.password);
      }
    };

    // 保存到内存
    memoryUsers.push(newUser);
    // 写入文件
    writeUsersToFile(memoryUsers);
    console.log('用户注册成功，当前用户数:', memoryUsers.length);

    // 生成JWT令牌
    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      message: '用户注册成功',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        studentId: newUser.studentId,
        teacherId: newUser.teacherId,
        phone: newUser.phone,
        gender: newUser.gender,
        age: newUser.age,
        grade: newUser.grade,
        class: newUser.class,
        department: newUser.department
      },
      token
    });
  } catch (error) {
    console.error('用户注册失败:', error);
    res.status(500).json({ message: '用户注册失败', error });
  }
};

// 用户登录
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('接收到登录请求:', { email });

    // 使用内存存储
    // 检查用户是否存在
    const user = memoryUsers.find(user => user.email === email);
    if (!user) {
      res.status(401).json({ message: '邮箱或密码错误' });
      return;
    }

    // 检查密码是否正确
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(401).json({ message: '邮箱或密码错误' });
      return;
    }

    // 生成JWT令牌
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: '用户登录成功',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        teacherId: user.teacherId,
        phone: user.phone,
        gender: user.gender,
        age: user.age,
        grade: user.grade,
        class: user.class,
        department: user.department
      },
      token
    });
  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(500).json({ message: '用户登录失败', error });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const user = memoryUsers.find(user => user._id === userId);

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // 创建不包含密码的用户信息副本
    const { password, comparePassword, ...userWithoutPassword } = user;

    res.status(200).json({
      message: '获取用户信息成功',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '获取用户信息失败', error });
  }
};

// 更新用户信息
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { name, phone, gender, age, avatar } = req.body;

    console.log('接收到更新用户信息请求:', { userId });

    // 使用内存存储
    const userIndex = memoryUsers.findIndex(user => user._id === userId);
    if (userIndex === -1) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // 更新用户信息
    memoryUsers[userIndex] = {
      ...memoryUsers[userIndex],
      name,
      phone,
      gender,
      age,
      avatar
    };
    // 写入文件
    writeUsersToFile(memoryUsers);

    // 创建不包含密码的用户信息副本
    const { password, comparePassword, ...userWithoutPassword } = memoryUsers[userIndex];

    res.status(200).json({
      message: '更新用户信息成功',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ message: '更新用户信息失败', error });
  }
};

// 更改密码
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    // 使用内存存储
    const userIndex = memoryUsers.findIndex(user => user._id === userId);
    if (userIndex === -1) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    const user = memoryUsers[userIndex];

    // 检查当前密码是否正确
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      res.status(401).json({ message: '当前密码错误' });
      return;
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    user.password = hashedPassword;
    // 写入文件
    writeUsersToFile(memoryUsers);

    res.status(200).json({ message: '密码更改成功' });
  } catch (error) {
    console.error('更改密码失败:', error);
    res.status(500).json({ message: '更改密码失败', error });
  }
};

// 临时端点：获取所有用户（仅用于调试）
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('获取所有用户请求，当前用户数:', memoryUsers.length);
    console.log('用户列表:', memoryUsers.map(user => ({ id: user._id, email: user.email, name: user.name })));
    
    // 返回用户信息，但不包含密码
    const usersWithoutPasswords = memoryUsers.map(({ password, comparePassword, ...user }) => user);
    
    res.status(200).json({
      message: '获取用户列表成功',
      users: usersWithoutPasswords
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '获取用户列表失败', error });
  }
};