import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';
import { userStore, IUser } from '../utils/userStore';
import { generateToken } from '../utils/jwt';

// 生成下一个用户ID
const getNextUserId = (): number => {
  const users = userStore.getAllUsers();
  return Math.max(...users.map(user => parseInt(user._id.split('_')[1] || '0')), 0) + 1;
};

let nextUserId = getNextUserId();

// 生成JWT令牌的函数已从 '../utils/jwt' 导入

// 用户注册
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, studentId, teacherId, phone, gender, age, grade, class: studentClass, department } = req.body;

    console.log('接收到注册请求:', { name, email, role });

    // 检查邮箱是否已存在
    const existingUser = userStore.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: '该邮箱已被注册' });
      return;
    }

    // 检查学号/工号是否已存在
    if (studentId) {
      const users = userStore.getAllUsers();
      const existingStudent = users.find(user => user.studentId === studentId);
      if (existingStudent) {
        res.status(400).json({ message: '该学号已被注册' });
        return;
      }
    }

    if (teacherId) {
      const users = userStore.getAllUsers();
      const existingTeacher = users.find(user => user.teacherId === teacherId);
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

    // 保存到存储
    userStore.addUser(newUser);
    console.log('用户注册成功，当前用户数:', userStore.getAllUsers().length);

    // 生成JWT令牌
    const token = generateToken(newUser._id, newUser.role as UserRole);

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
    const allUsers = userStore.getAllUsers();
    console.log('内存中的用户数量:', allUsers.length);
    console.log('内存中的用户邮箱列表:', allUsers.map(user => user.email));

    // 检查用户是否存在
    const user = userStore.findUserByEmail(email);
    console.log('从文件存储中查找用户:', user ? '找到' : '未找到');

    // 检查密码是否正确
    let isPasswordCorrect = false;
    if (user) {
      // 检查密码是否为哈希值（以$2a$开头）
      if (user.password.startsWith('$2a$')) {
        // 使用bcrypt比较哈希密码
        isPasswordCorrect = await bcrypt.compare(password, user.password);
      } else {
        // 直接比较明文密码（用于测试账号）
        isPasswordCorrect = password === user.password;
      }
      console.log('密码是否正确:', isPasswordCorrect);
    }

    if (!user || !isPasswordCorrect) {
      res.status(401).json({
        message: '邮箱或密码错误',
        user: null,
        token: null
      });
      return;
    }

    // 生成JWT令牌
    const token = generateToken(user._id, user.role as UserRole);

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
    const user = userStore.findUserById(userId);

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // 创建不包含密码的用户信息副本
    // 将 _id 映射为 id 以匹配前端接口
    const { password, comparePassword, _id, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      id: _id
    };

    res.status(200).json({
      message: '获取用户信息成功',
      user: userResponse
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

    const user = userStore.findUserById(userId);
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // 更新用户信息
    userStore.updateUser(userId, {
      name,
      phone,
      gender,
      age,
      avatar
    });

    // 获取更新后的用户
    const updatedUser = userStore.findUserById(userId);
    if (!updatedUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // 创建不包含密码的用户信息副本
    // 将 _id 映射为 id 以匹配前端接口
    const { password, comparePassword, _id, ...userWithoutPassword } = updatedUser;
    const userResponse = {
      ...userWithoutPassword,
      id: _id
    };

    res.status(200).json({
      message: '更新用户信息成功',
      user: userResponse
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

    const user = userStore.findUserById(userId);
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

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
    userStore.updateUser(userId, { password: hashedPassword });

    res.status(200).json({ message: '密码更改成功' });
  } catch (error) {
    console.error('更改密码失败:', error);
    res.status(500).json({ message: '更改密码失败', error });
  }
};

// 临时端点：获取所有用户（仅用于调试）
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = userStore.getAllUsers();
    console.log('获取所有用户请求，当前用户数:', users.length);
    console.log('用户列表:', users.map(user => ({ id: user._id, email: user.email, name: user.name })));

    // 返回用户信息，但不包含密码
    // 将 _id 映射为 id 以匹配前端接口
    const usersWithoutPasswords = users.map(({ password, comparePassword, _id, ...user }) => ({
      ...user,
      id: _id
    }));

    res.status(200).json({
      message: '获取用户列表成功',
      users: usersWithoutPasswords
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '获取用户列表失败', error });
  }
};

// 删除用户
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdToDelete = req.params.id;
    const currentUserId = (req as any).user?.userId;
    const currentUserRole = (req as any).user?.role;

    // 查找当前用户
    const currentUser = userStore.findUserById(currentUserId);
    if (!currentUser) {
      res.status(404).json({ message: '当前用户不存在' });
      return;
    }

    // 检查是否要删除自己
    if (userIdToDelete === currentUserId) {
      res.status(403).json({ message: '不能删除自己的账号' });
      return;
    }

    // 查找要删除的用户
    const userToDelete = userStore.findUserById(userIdToDelete);
    if (!userToDelete) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // 检查权限
    // 1. 普通管理员不能删除管理员账号
    // 2. 超级管理员（superadmin@test.edu.cn）可以删除管理员账号，但不能删除自己
    // 3. 超级管理员不能删除其他超级管理员（如果有的话）
    if (userToDelete.role === 'admin') {
      // 检查当前用户是否是超级管理员
      const isCurrentUserSuperAdmin = currentUser.email === 'superadmin@test.edu.cn';
      const isUserToDeleteSuperAdmin = userToDelete.email === 'superadmin@test.edu.cn';

      if (!isCurrentUserSuperAdmin || isUserToDeleteSuperAdmin) {
        res.status(403).json({ message: '只有超级管理员才能删除管理员账号，且不能删除其他超级管理员' });
        return;
      }
    }

    // 从存储中删除用户
    const deleted = userStore.deleteUser(userIdToDelete);

    if (!deleted) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ message: '删除用户失败', error });
  }
};
