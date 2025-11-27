import mongoose, { Schema, Document } from 'mongoose';
import { EmotionType, RecognitionType } from '../types';

// 情绪记录接口定义
export interface IEmotionRecord extends Document {
  userId: mongoose.Types.ObjectId;
  type: RecognitionType;
  content?: string; // 文本内容，仅文本识别有
  fileUrl?: string; // 文件URL，仅语音和图像识别有
  emotion: EmotionType;
  score: number; // 情绪得分，0-100
  additionalEmotions?: { [key in EmotionType]?: number };
  createdAt: Date;
}

// 情绪记录模式定义
const EmotionRecordSchema: Schema<IEmotionRecord> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: Object.values(RecognitionType),
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    trim: true
  },
  emotion: {
    type: String,
    enum: Object.values(EmotionType),
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  additionalEmotions: {
    type: Map,
    of: Number
  }
}, {
  timestamps: true
});

// 创建并导出情绪记录模型
export default mongoose.model<IEmotionRecord>('EmotionRecord', EmotionRecordSchema);