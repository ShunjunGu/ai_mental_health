import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest, authService } from '../services/authService';

// 定义认证上下文类型
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件Props类型
interface AuthProviderProps {
  children: ReactNode;
}

// 认证提供者组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 初始化时检查用户登录状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      // 检查是否有token，只有有token时才尝试从服务器获取用户信息
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        if (authService.isAuthenticated()) {
          // 从服务器获取最新的用户信息
          const user = await authService.getCurrentUserFromServer();
          setUser(user);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 如果获取失败，清除本地存储的用户信息
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 登录方法
  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (error: any) {
      console.error('登录失败:', error);
      throw error.response?.data?.message || '登录失败，请检查您的邮箱和密码';
    } finally {
      setIsLoading(false);
    }
  };

  // 注册方法
  const register = async (userData: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
    } catch (error: any) {
      console.error('注册失败:', error);
      throw error.response?.data?.message || '注册失败，请稍后重试';
    } finally {
      setIsLoading(false);
    }
  };

  // 登出方法
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // 更新用户信息方法
  const updateUser = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateUser(userData);
      setUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  // 提供的上下文值
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义钩子，便于使用认证上下文
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;