import { Request, Response } from 'express';
import {
  generateInterventionSuggestions,
  getClassMentalHealthReport,
  getGradeMentalHealthReport,
  getStudentMentalHealthOverview
} from '../services/teacherDecisionSupportService';

// 获取学生心理健康概览
export const getStudentOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const overview = await getStudentMentalHealthOverview(studentId);

    res.status(200).json({
      message: '获取学生心理健康概览成功',
      overview
    });
  } catch (error) {
    console.error('获取学生心理健康概览失败:', error);
    res.status(500).json({ message: '获取学生心理健康概览失败', error });
  }
};

// 生成智能干预建议
export const getInterventionSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const suggestions = await generateInterventionSuggestions(studentId);

    res.status(200).json({
      message: '生成干预建议成功',
      suggestions
    });
  } catch (error) {
    console.error('生成干预建议失败:', error);
    res.status(500).json({ message: '生成干预建议失败', error });
  }
};

// 获取班级心理健康报表
export const getClassReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { grade, class: className } = req.params;
    const report = await getClassMentalHealthReport(grade, className);

    res.status(200).json({
      message: '获取班级心理健康报表成功',
      report
    });
  } catch (error) {
    console.error('获取班级心理健康报表失败:', error);
    res.status(500).json({ message: '获取班级心理健康报表失败', error });
  }
};

// 获取年级心理健康报表
export const getGradeReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { grade } = req.params;
    const report = await getGradeMentalHealthReport(grade);

    res.status(200).json({
      message: '获取年级心理健康报表成功',
      report
    });
  } catch (error) {
    console.error('获取年级心理健康报表失败:', error);
    res.status(500).json({ message: '获取年级心理健康报表失败', error });
  }
};

// 获取教师所教班级列表
export const getTeacherClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    // 这里简化处理，实际应该根据教师ID查询其所教班级
    // 假设教师可以教授多个班级
    const teacherId = (req as any).user.userId;
    
    // 模拟数据，实际应该从数据库中查询
    const classes = [
      { grade: '高一', class: '1班' },
      { grade: '高一', class: '2班' }
    ];

    res.status(200).json({
      message: '获取教师所教班级列表成功',
      classes
    });
  } catch (error) {
    console.error('获取教师所教班级列表失败:', error);
    res.status(500).json({ message: '获取教师所教班级列表失败', error });
  }
};