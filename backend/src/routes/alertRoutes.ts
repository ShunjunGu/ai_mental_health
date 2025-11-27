import express from 'express';
import { authenticate, isTeacherOrAdmin, isCounselorOrAdmin } from '../middlewares/auth';
import {
  getAlerts,
  getAlertById,
  handleAlertById,
  createManualAlert,
  getAlertStatistics
} from '../controllers/alertController';

const router = express.Router();

// 获取预警列表（教师/管理员/咨询师）
router.get('/', authenticate, isTeacherOrAdmin, getAlerts);

// 获取预警详情（教师/管理员/咨询师）
router.get('/:id', authenticate, isTeacherOrAdmin, getAlertById);

// 处理预警（教师/管理员/咨询师）
router.put('/:id/handle', authenticate, isTeacherOrAdmin, handleAlertById);

// 生成手动预警（教师/管理员/咨询师）
router.post('/', authenticate, isTeacherOrAdmin, createManualAlert);

// 获取预警统计（教师/管理员/咨询师）
router.get('/statistics', authenticate, isTeacherOrAdmin, getAlertStatistics);

export default router;