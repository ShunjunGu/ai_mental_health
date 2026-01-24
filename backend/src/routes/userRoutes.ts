import express from 'express';
import { authenticate, isAdmin } from '../middlewares/auth';
import { validateUserRegistration, validateUserLogin } from '../middlewares/validation';
import { strictLimiter } from '../middlewares/rateLimit';
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

// 用户注册（添加输入验证和严格速率限制）
router.post('/register', strictLimiter, validateUserRegistration, registerUser);

// 用户登录（添加输入验证和严格速率限制）
router.post('/login', strictLimiter, validateUserLogin, loginUser);

// 获取当前用户信息（需要认证）
router.get('/me', authenticate, getCurrentUser);

// 更新用户信息（需要认证）
router.put('/me', authenticate, updateUser);

// 更改密码（需要认证）
router.put('/change-password', authenticate, changePassword);

// 获取所有用户（需要管理员权限）
router.get('/all', authenticate, isAdmin, getAllUsers);

// 删除用户（需要管理员权限）
router.delete('/:id', authenticate, isAdmin, deleteUser);

export default router;