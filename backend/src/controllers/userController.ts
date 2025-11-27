import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { generateToken } from '../utils/jwt';
import { UserRole } from '../types';

// 用户注册
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, studentId, teacherId, phone, gender, age, grade, class: studentClass, department } = req.body;

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: '该邮箱已被注册' });
      return;
    }

    // 检查学号/工号是否已存在
    if (studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        res.status(400).json({ message: '该学号已被注册' });
        return;
      }
    }

    if (teacherId) {
      const existingTeacher = await User.findOne({ teacherId });
      if (existingTeacher) {
        res.status(400).json({ message: '该工号已被注册' });
        return;
      }
    }

    // 创建新用户
    const newUser: IUser = new User({
      name,
      email,
      password,
      role,
      studentId,
      teacherId,
      phone,
      gender,
      age,
      grade,
      class: studentClass,
      department
    });

    await newUser.save();

    // 生成JWT令牌
    const token = generateToken(newUser._id.toString(), newUser.role);

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

    // 检查用户是否存在
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: '邮箱或密码错误' });
      return;
    }

    // 检查密码是否正确
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      res.status(401).json({ message: '邮箱或密码错误' });
      return;
    }

    // 生成JWT令牌
    const token = generateToken(user._id.toString(), user.role);

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
    const user = await User.findById(userId).select('-password');

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json({
      message: '获取用户信息成功',
      user
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

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, gender, age, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json({
      message: '更新用户信息成功',
      user
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

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // 检查当前密码是否正确
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      res.status(401).json({ message: '当前密码错误' });
      return;
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: '密码更改成功' });
  } catch (error) {
    console.error('更改密码失败:', error);
    res.status(500).json({ message: '更改密码失败', error });
  }
};