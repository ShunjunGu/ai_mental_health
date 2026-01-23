import express from 'express';
import { authenticate } from '../middlewares/auth';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  changePassword,
  getAllUsers,
  deleteUser
} from '../controllers/userController';

const router = express.Router();

// 用户注册
router.post('/register', registerUser);

// 用户登录
router.post('/login', loginUser);

// 获取当前用户信息（需要认证）
router.get('/me', authenticate, getCurrentUser);

// 更新用户信息（需要认证）
router.put('/me', authenticate, updateUser);

// 更改密码（需要认证）
router.put('/change-password', authenticate, changePassword);

// 获取所有用户（需要认证，仅用于后台管理）
router.get('/all', authenticate, getAllUsers);

// 删除用户（需要认证）
router.delete('/:id', authenticate, deleteUser);

export default router;