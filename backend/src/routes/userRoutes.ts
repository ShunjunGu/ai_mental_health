import express from 'express';
import { authenticate } from '../middlewares/auth';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  changePassword
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

export default router;