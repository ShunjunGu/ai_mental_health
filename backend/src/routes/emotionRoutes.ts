import express from 'express';
import { authenticate, isStudent, isTeacherOrAdmin } from '../middlewares/auth';
import {
  createEmotionRecord,
  getEmotionRecords,
  getEmotionRecordById,
  deleteEmotionRecord,
  getEmotionStatistics,
  analyzeEmotion
} from '../controllers/emotionController';

const router = express.Router();

// 创建情绪记录（仅学生）
router.post('/', authenticate, isStudent, createEmotionRecord);

// 获取用户的情绪记录列表（仅学生或教师/管理员查看指定学生）
router.get('/', authenticate, getEmotionRecords);

// 获取情绪记录详情（仅学生或教师/管理员查看指定学生）
router.get('/:id', authenticate, getEmotionRecordById);

// 删除情绪记录（仅学生）
router.delete('/:id', authenticate, isStudent, deleteEmotionRecord);

// 获取用户情绪统计（仅学生或教师/管理员查看指定学生）
router.get('/statistics', authenticate, getEmotionStatistics);

// 分析情绪（无需身份验证，用于前端直接分析）
router.post('/analyze', analyzeEmotion);

export default router;