import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

// 用户接口定义
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string; // 学号，仅学生角色有
  teacherId?: string; // 工号，仅教师和咨询师角色有
  phone?: string;
  avatar?: string;
  gender?: string;
  age?: number;
  grade?: string; // 年级，仅学生角色有
  class?: string; // 班级，仅学生角色有
  department?: string; // 部门/科室，仅教师和咨询师角色有
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 用户模式定义
const UserSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  teacherId: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    trim: true
  },
  age: {
    type: Number,
    min: 0,
    max: 150
  },
  grade: {
    type: String,
    trim: true
  },
  class: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 密码加密中间件
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 密码比较方法
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 创建并导出用户模型
export default mongoose.model<IUser>('User', UserSchema);