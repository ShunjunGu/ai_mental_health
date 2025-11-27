import express from 'express';
import { authenticate, isTeacherOrAdmin } from '../middlewares/auth';
import {
  getStudentOverview,
  getInterventionSuggestions,
  getClassReport,
  getGradeReport,
  getTeacherClasses
} from '../controllers/teacherDecisionSupportController';

const router = express.Router();

// 获取教师所教班级列表
router.get('/classes', authenticate, isTeacherOrAdmin, getTeacherClasses);

// 获取学生心理健康概览
router.get('/students/:studentId/overview', authenticate, isTeacherOrAdmin, getStudentOverview);

// 生成智能干预建议
router.get('/students/:studentId/suggestions', authenticate, isTeacherOrAdmin, getInterventionSuggestions);

// 获取班级心理健康报表
router.get('/classes/:grade/:class/report', authenticate, isTeacherOrAdmin, getClassReport);

// 获取年级心理健康报表
router.get('/grades/:grade/report', authenticate, isTeacherOrAdmin, getGradeReport);

export default router;