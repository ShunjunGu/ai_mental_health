import { Request, Response } from 'express';
import ConsultationAppointment from '../models/ConsultationAppointment';
import ConsultationRecord from '../models/ConsultationRecord';
import User from '../models/User';
import { AppointmentStatus, ConsultationEffect } from '../types';

// 创建咨询预约
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.userId;
    const { counselorId, appointmentTime, notes } = req.body;

    // 验证请求参数
    if (!counselorId || !appointmentTime) {
      res.status(400).json({ message: '咨询师ID和预约时间不能为空' });
      return;
    }

    // 验证咨询师是否存在且角色正确
    const counselor = await User.findOne({ _id: counselorId, role: 'counselor' });
    if (!counselor) {
      res.status(404).json({ message: '咨询师不存在' });
      return;
    }

    // 检查预约时间是否已被占用
    const existingAppointment = await ConsultationAppointment.findOne({
      counselorId,
      appointmentTime,
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }
    });

    if (existingAppointment) {
      res.status(400).json({ message: '该时间段已被预约' });
      return;
    }

    // 创建预约
    const appointment = new ConsultationAppointment({
      studentId,
      counselorId,
      appointmentTime,
      notes
    });

    await appointment.save();

    res.status(201).json({
      message: '咨询预约创建成功',
      appointment
    });
  } catch (error) {
    console.error('创建咨询预约失败:', error);
    res.status(500).json({ message: '创建咨询预约失败', error });
  }
};

// 获取预约列表
export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { page = 1, limit = 10, status, counselorId, startDate, endDate } = req.query;

    const query: any = {};

    // 根据用户角色过滤预约
    if (user.role === 'student') {
      query.studentId = user.userId;
    } else if (user.role === 'counselor') {
      query.counselorId = user.userId;
    } else if (user.role === 'teacher' || user.role === 'admin') {
      // 教师和管理员可以查看所有预约，或根据咨询师ID过滤
      if (counselorId) {
        query.counselorId = counselorId;
      }
    }

    // 添加过滤条件
    if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
      query.status = status;
    }

    if (startDate) {
      query.appointmentTime = { ...query.appointmentTime, $gte: new Date(startDate as string) };
    }

    if (endDate) {
      query.appointmentTime = { ...query.appointmentTime, $lte: new Date(endDate as string) };
    }

    // 分页查询
    const skip = (Number(page) - 1) * Number(limit);
    const appointments = await ConsultationAppointment.find(query)
      .populate('studentId', 'name studentId grade class email')
      .populate('counselorId', 'name email department')
      .sort({ appointmentTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ConsultationAppointment.countDocuments(query);

    res.status(200).json({
      message: '获取预约列表成功',
      appointments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取预约列表失败:', error);
    res.status(500).json({ message: '获取预约列表失败', error });
  }
};

// 获取预约详情
export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const appointment = await ConsultationAppointment.findById(id)
      .populate('studentId', 'name studentId grade class email')
      .populate('counselorId', 'name email department');

    if (!appointment) {
      res.status(404).json({ message: '预约不存在' });
      return;
    }

    // 验证用户权限
    if (
      user.role === 'student' && appointment.studentId._id.toString() !== user.userId ||
      user.role === 'counselor' && appointment.counselorId._id.toString() !== user.userId
    ) {
      res.status(403).json({ message: '没有权限查看该预约' });
      return;
    }

    res.status(200).json({
      message: '获取预约详情成功',
      appointment
    });
  } catch (error) {
    console.error('获取预约详情失败:', error);
    res.status(500).json({ message: '获取预约详情失败', error });
  }
};

// 确认预约
export const confirmAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const counselorId = (req as any).user.userId;

    // 验证预约是否存在且属于当前咨询师
    const appointment = await ConsultationAppointment.findOne({ _id: id, counselorId });

    if (!appointment) {
      res.status(404).json({ message: '预约不存在或无权限操作' });
      return;
    }

    // 更新预约状态
    appointment.status = AppointmentStatus.CONFIRMED;
    await appointment.save();

    res.status(200).json({
      message: '确认预约成功',
      appointment
    });
  } catch (error) {
    console.error('确认预约失败:', error);
    res.status(500).json({ message: '确认预约失败', error });
  }
};

// 取消预约
export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // 验证预约是否存在
    const appointment = await ConsultationAppointment.findById(id);

    if (!appointment) {
      res.status(404).json({ message: '预约不存在' });
      return;
    }

    // 验证用户权限
    if (
      user.role === 'student' && appointment.studentId.toString() !== user.userId ||
      user.role === 'counselor' && appointment.counselorId.toString() !== user.userId
    ) {
      res.status(403).json({ message: '没有权限取消该预约' });
      return;
    }

    // 更新预约状态
    appointment.status = AppointmentStatus.CANCELLED;
    await appointment.save();

    res.status(200).json({
      message: '取消预约成功',
      appointment
    });
  } catch (error) {
    console.error('取消预约失败:', error);
    res.status(500).json({ message: '取消预约失败', error });
  }
};

// 创建咨询记录
export const createConsultationRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const counselorId = (req as any).user.userId;
    const { studentId, appointmentId, startTime, endTime, content, studentFeedback, counselorFeedback, effect, nextAppointmentTime } = req.body;

    // 验证请求参数
    if (!studentId || !startTime || !content) {
      res.status(400).json({ message: '学生ID、开始时间和咨询内容不能为空' });
      return;
    }

    // 验证学生是否存在
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      res.status(404).json({ message: '学生不存在' });
      return;
    }

    // 如果提供了预约ID，验证预约是否存在且属于当前咨询师
    if (appointmentId) {
      const appointment = await ConsultationAppointment.findOne({ _id: appointmentId, counselorId, studentId });
      if (!appointment) {
        res.status(404).json({ message: '预约不存在或无权限操作' });
        return;
      }

      // 更新预约状态为已完成
      appointment.status = AppointmentStatus.COMPLETED;
      await appointment.save();
    }

    // 创建咨询记录
    const consultationRecord = new ConsultationRecord({
      studentId,
      counselorId,
      appointmentId,
      startTime,
      endTime,
      content,
      studentFeedback,
      counselorFeedback,
      effect: effect || ConsultationEffect.FAIR,
      nextAppointmentTime
    });

    await consultationRecord.save();

    res.status(201).json({
      message: '咨询记录创建成功',
      consultationRecord
    });
  } catch (error) {
    console.error('创建咨询记录失败:', error);
    res.status(500).json({ message: '创建咨询记录失败', error });
  }
};

// 获取咨询记录列表
export const getConsultationRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { page = 1, limit = 10, studentId, counselorId, startDate, endDate } = req.query;

    const query: any = {};

    // 根据用户角色过滤咨询记录
    if (user.role === 'student') {
      query.studentId = user.userId;
    } else if (user.role === 'counselor') {
      query.counselorId = user.userId;
    } else if (user.role === 'teacher' || user.role === 'admin') {
      // 教师和管理员可以查看所有咨询记录，或根据学生ID和咨询师ID过滤
      if (studentId) {
        query.studentId = studentId;
      }
      if (counselorId) {
        query.counselorId = counselorId;
      }
    }

    // 添加时间范围过滤
    if (startDate) {
      query.startTime = { ...query.startTime, $gte: new Date(startDate as string) };
    }

    if (endDate) {
      query.startTime = { ...query.startTime, $lte: new Date(endDate as string) };
    }

    // 分页查询
    const skip = (Number(page) - 1) * Number(limit);
    const consultationRecords = await ConsultationRecord.find(query)
      .populate('studentId', 'name studentId grade class email')
      .populate('counselorId', 'name email department')
      .populate('appointmentId')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ConsultationRecord.countDocuments(query);

    res.status(200).json({
      message: '获取咨询记录列表成功',
      consultationRecords,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取咨询记录列表失败:', error);
    res.status(500).json({ message: '获取咨询记录列表失败', error });
  }
};

// 获取咨询记录详情
export const getConsultationRecordById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const consultationRecord = await ConsultationRecord.findById(id)
      .populate('studentId', 'name studentId grade class email')
      .populate('counselorId', 'name email department')
      .populate('appointmentId');

    if (!consultationRecord) {
      res.status(404).json({ message: '咨询记录不存在' });
      return;
    }

    // 验证用户权限
    if (
      user.role === 'student' && consultationRecord.studentId._id.toString() !== user.userId ||
      user.role === 'counselor' && consultationRecord.counselorId._id.toString() !== user.userId
    ) {
      res.status(403).json({ message: '没有权限查看该咨询记录' });
      return;
    }

    res.status(200).json({
      message: '获取咨询记录详情成功',
      consultationRecord
    });
  } catch (error) {
    console.error('获取咨询记录详情失败:', error);
    res.status(500).json({ message: '获取咨询记录详情失败', error });
  }
};

// 更新咨询记录
export const updateConsultationRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const counselorId = (req as any).user.userId;
    const { content, studentFeedback, counselorFeedback, effect, nextAppointmentTime } = req.body;

    // 验证咨询记录是否存在且属于当前咨询师
    const consultationRecord = await ConsultationRecord.findOne({ _id: id, counselorId });

    if (!consultationRecord) {
      res.status(404).json({ message: '咨询记录不存在或无权限操作' });
      return;
    }

    // 更新咨询记录
    if (content !== undefined) consultationRecord.content = content;
    if (studentFeedback !== undefined) consultationRecord.studentFeedback = studentFeedback;
    if (counselorFeedback !== undefined) consultationRecord.counselorFeedback = counselorFeedback;
    if (effect !== undefined) consultationRecord.effect = effect;
    if (nextAppointmentTime !== undefined) consultationRecord.nextAppointmentTime = nextAppointmentTime;

    await consultationRecord.save();

    res.status(200).json({
      message: '更新咨询记录成功',
      consultationRecord
    });
  } catch (error) {
    console.error('更新咨询记录失败:', error);
    res.status(500).json({ message: '更新咨询记录失败', error });
  }
};