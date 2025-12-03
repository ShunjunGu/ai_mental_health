import { api } from './authService';

export interface EmotionStatistics {
  emotion: string;
  count: number;
  averageScore: number;
}

export interface EmotionAnalysisResult {
  emotion: string;
  confidence: number;
  suggestion: string;
  timestamp: string;
}

export interface EmotionRecord {
  _id: string;
  userId: string;
  type: string;
  content?: string;
  fileUrl?: string;
  emotion: string;
  score: number;
  additionalEmotions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmotionStatisticsResponse {
  message: string;
  statistics: EmotionStatistics[];
}

export interface EmotionRecordsResponse {
  message: string;
  emotionRecords: EmotionRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class EmotionService {
  // 分析文本情绪（无需登录）
  async analyzeTextEmotion(text: string): Promise<EmotionAnalysisResult> {
    const response = await api.post<EmotionAnalysisResult>('/api/emotions/analyze/public', {
      text
    });
    return response.data;
  }

  // 获取用户的情绪统计数据
  async getEmotionStatistics(startDate?: string, endDate?: string): Promise<EmotionStatistics[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    try {
      // 使用stats端点获取统计数据，这样可以确保无论用户是否登录都能获取到正确的数据
      const response = await api.get<any>(
        `/api/emotions/stats${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      // 如果返回的数据包含distribution字段，将其转换为EmotionStatistics格式
      if (response.data.distribution) {
        return Object.entries(response.data.distribution).map(([emotion, count]) => ({
          emotion,
          count: Number(count),
          averageScore: 0 // 简化处理，实际应用中可以根据需要计算平均分
        }));
      }
      
      return [];
    } catch (error) {
      console.error('获取情绪统计数据失败:', error);
      return [];
    }
  }

  // 获取用户的情绪记录列表
  async getEmotionRecords(params: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EmotionRecordsResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.type) queryParams.append('type', params.type);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const response = await api.get<EmotionRecordsResponse>(
      `/api/emotions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  }

  // 创建情绪记录
  async createEmotionRecord(data: {
    type: string;
    content?: string;
    fileUrl?: string;
  }): Promise<{ message: string; emotionRecord: EmotionRecord }> {
    const response = await api.post('/api/emotions', data);
    return response.data;
  }

  // 删除情绪记录
  async deleteEmotionRecord(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/emotions/${id}`);
    return response.data;
  }

  // 获取用户本月情绪分析次数
  async getMonthlyAnalysisCount(): Promise<number> {
    try {
      // 检查是否有token
      const token = localStorage.getItem('token');
      
      // 构建查询参数
      const params = new URLSearchParams();
      params.append('timeRange', 'month');
      
      // 先尝试获取当前用户的记录
      let total = 0;
      
      if (token) {
        // 有token时，先获取用户自己的记录
        const userResponse = await api.get<any>(`/api/emotions/stats?${params.toString()}`);
        total = userResponse.data.total || 0;
        
        // 如果用户自己没有记录，获取公共用户的记录
        if (total === 0) {
          const publicParams = new URLSearchParams();
          publicParams.append('timeRange', 'month');
          publicParams.append('userId', 'public_user');
          const publicResponse = await api.get<any>(`/api/emotions/stats?${publicParams.toString()}`);
          total = publicResponse.data.total || 0;
        }
      } else {
        // 没有token时，直接获取公共用户的记录
        params.append('userId', 'public_user');
        const publicResponse = await api.get<any>(`/api/emotions/stats?${params.toString()}`);
        total = publicResponse.data.total || 0;
      }
      
      return total;
    } catch (error) {
      console.error('获取本月分析次数失败:', error);
      return 0;
    }
  }
}

export const emotionService = new EmotionService();
