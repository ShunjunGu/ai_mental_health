import React, { useState, createContext, useContext } from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Layout, Menu, Typography, Button, Avatar, Dropdown, Space } from 'antd'
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom'
import { UserOutlined, LogoutOutlined, TeamOutlined } from '@ant-design/icons'
import './index.css'

// 导入组件
import EmotionRecognition from './components/EmotionRecognition'
import EmotionHistory from './components/EmotionHistory'
import EmotionAnalysis from './components/EmotionAnalysis'
import UserProfile from './components/UserProfile'
import Login from './components/Login'
import Register from './components/Register'
import AdminDashboard from './components/AdminDashboard'
import PrivateRoute from './components/PrivateRoute'

// 导入认证上下文
import { AuthProvider, useAuth } from './contexts/AuthContext'



// 创建情绪上下文
interface EmotionContextType {
  emotion: string
  setEmotion: (emotion: string) => void
}

// 创建情绪上下文
export const EmotionContext = createContext<EmotionContextType>({
  emotion: 'neutral',
  setEmotion: () => {}
})

// 情绪到颜色的映射
export const emotionToColors: Record<string, {
  background: string
  primary: string
  secondary: string
  text: string
}> = {
  happy: {
    background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
    primary: '#FF9800',
    secondary: '#FFB74D',
    text: '#E65100'
  },
  sad: {
    background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    primary: '#2196F3',
    secondary: '#64B5F6',
    text: '#0D47A1'
  },
  angry: {
    background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
    primary: '#F44336',
    secondary: '#EF5350',
    text: '#B71C1C'
  },
  anxious: {
    background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
    primary: '#FF9800',
    secondary: '#FFB74D',
    text: '#E65100'
  },
  fearful: {
    background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
    primary: '#9C27B0',
    secondary: '#BA68C8',
    text: '#4A148C'
  },
  fear: {
    background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
    primary: '#9C27B0',
    secondary: '#BA68C8',
    text: '#4A148C'
  },
  surprised: {
    background: 'linear-gradient(135deg, #FFF8E1 0%, #FFF176 100%)',
    primary: '#FFC107',
    secondary: '#FFD54F',
    text: '#F57F17'
  },
  surprise: {
    background: 'linear-gradient(135deg, #FFF8E1 0%, #FFF176 100%)',
    primary: '#FFC107',
    secondary: '#FFD54F',
    text: '#F57F17'
  },
  neutral: {
    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    primary: '#4CAF50',
    secondary: '#81C784',
    text: '#2E7D32'
  }
}

// 用户菜单组件
const UserMenu = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // 处理登出
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // 用户菜单选项
  const menuItems = [
    {
      key: 'profile',
      label: (
        <Link to="/profile">
          <Space>
            <UserOutlined />
            个人中心
          </Space>
        </Link>
      ),
    },
    {
      key: 'logout',
      label: (
        <Space onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <LogoutOutlined />
          退出登录
        </Space>
      ),
    },
  ]

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Space style={{ cursor: 'pointer' }}>
        <Avatar
          icon={<UserOutlined />}
          style={{ 
            backgroundColor: '#1890ff',
            marginRight: '8px'
          }}
        />
        <span>{user?.name || '用户'}</span>
      </Space>
    </Dropdown>
  )
}

// 导航组件
const AppNavigation = () => {
  const navigate = useNavigate()
  const [current, setCurrent] = useState('recognition')
  const { isAuthenticated } = useAuth()
  const { emotion } = useContext(EmotionContext)

  const handleClick = (e: any) => {
    setCurrent(e.key)
    // 映射key到正确的路由路径
    const routeMap: Record<string, string> = {
      recognition: '/',
      history: '/history',
      analysis: '/analysis',
      profile: '/profile',
      admin: '/admin'
    }
    navigate(routeMap[e.key] || '/')
  }

  const getCurrentColors = () => {
    const lowerEmotion = emotion.toLowerCase();
    const colors = emotionToColors[lowerEmotion];
    console.log('Current emotion:', emotion);
    console.log('Lowercase emotion:', lowerEmotion);
    console.log('Colors found:', colors);
    return colors || emotionToColors.neutral;
  }

  return (
    <Layout style={{ 
        minHeight: '100vh',
        background: getCurrentColors().background,
        transition: 'all 0.5s ease'
      }}>
      <Layout.Header 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: `2px solid ${getCurrentColors().primary}`
        }}
      >
        <Typography.Title 
          level={3} 
          style={{ 
            margin: 0, 
            color: getCurrentColors().primary,
            fontWeight: '700'
          }}
        >
          AI情绪识别
        </Typography.Title>

        <Menu
          onClick={handleClick}
          selectedKeys={[current]}
          mode="horizontal"
          style={{
            borderBottom: 'none',
            backgroundColor: 'transparent',
            color: getCurrentColors().text
          }}
          theme="light"
          items={[
            {
              key: 'recognition',
              label: <Link to="/" style={{ color: getCurrentColors().text, fontWeight: current === 'recognition' ? '700' : '500' }}>情绪识别</Link>,
            },
            {
              key: 'history',
              label: <Link to="/history" style={{ color: getCurrentColors().text, fontWeight: current === 'history' ? '700' : '500' }}>历史记录</Link>,
            },
            {
              key: 'analysis',
              label: <Link to="/analysis" style={{ color: getCurrentColors().text, fontWeight: current === 'analysis' ? '700' : '500' }}>情绪分析</Link>,
            },
            {
              key: 'profile',
              label: <Link to="/profile" style={{ color: getCurrentColors().text, fontWeight: current === 'profile' ? '700' : '500' }}>个人中心</Link>,
            },
            {
              key: 'admin',
              label: <Link to="/admin" style={{ color: getCurrentColors().text, fontWeight: current === 'admin' ? '700' : '500' }}><TeamOutlined /> 后台管理</Link>,
            },
          ]}
        />

        <div>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Space>
              <Button 
                style={{
                  color: getCurrentColors().primary,
                  border: `1px solid ${getCurrentColors().primary}`
                }}
                onClick={() => navigate('/register')}
              >
                注册
              </Button>
              <Button 
                type="primary" 
                style={{
                  background: `linear-gradient(135deg, ${getCurrentColors().primary}, ${getCurrentColors().secondary})`,
                  border: 'none'
                }}
                onClick={() => navigate('/login')}
              >
                登录
              </Button>
            </Space>
          )}
        </div>
      </Layout.Header>

      <Layout.Content style={{ padding: '24px' }}>
        <Routes>
          {/* 公共路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 受保护的路由 */}
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<EmotionRecognition />} />
            <Route path="history" element={<EmotionHistory />} />
            <Route path="analysis" element={<EmotionAnalysis />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Routes>
      </Layout.Content>

      <Layout.Footer 
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          color: getCurrentColors().text,
          borderTop: `2px solid ${getCurrentColors().primary}`
        }}
      >
        AI校园心理健康平台 ©2024 Created by Trae AI
      </Layout.Footer>
    </Layout>
  )
}

// 主应用组件
const App: React.FC = () => {
  const [emotion, setEmotion] = useState('neutral')

  console.log('App emotion state:', emotion);

  return (
    <AuthProvider>
      <EmotionContext.Provider value={{ emotion, setEmotion }}>
        <ConfigProvider locale={zhCN}>
          <Router>
            <AppNavigation />
          </Router>
        </ConfigProvider>
      </EmotionContext.Provider>
    </AuthProvider>
  )
}

export default App