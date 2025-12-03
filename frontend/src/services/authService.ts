import axios from 'axios';

// 定义用户类型
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  teacherId?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  age?: number;
  grade?: string;
  class?: string;
  department?: string;
  school?: string;
  major?: string;
}

// 定义登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 定义注册请求类型
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  studentId?: string;
  teacherId?: string;
  phone?: string;
  gender?: string;
  age?: number;
  grade?: string;
  class?: string;
  department?: string;
}

// 定义认证响应类型
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// 创建axios实例
export const api = axios.create({
    baseURL: 'http://localhost:57215',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 认证服务
export const authService = {
  // 登录
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/users/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // 注册
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/users/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // 登出
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 获取当前用户信息
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // 从服务器获取当前用户信息
  async getCurrentUserFromServer(): Promise<User> {
    const response = await api.get<{ user: User }>('/api/users/me');
    const user = response.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // 更新用户信息
  async updateUser(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/api/users/me', data);
    const updatedUser = response.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },
};

export default authService;