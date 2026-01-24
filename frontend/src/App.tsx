import React, { useState, createContext, useContext } from 'react'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Layout, Typography, Button, Avatar, Dropdown, Space } from 'antd'
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom'
import { UserOutlined, LogoutOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import GooeyNav from './components/GooeyNav'
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
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext'
import { EmotionContext, emotionToColors, emotionToColorsDark } from './contexts/EmotionContext'





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
        <span style={{ color: 'var(--text-primary)' }}>{user?.name || '用户'}</span>
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
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const navItems = [
    { label: '情绪识别', href: '#', key: 'recognition' },
    { label: '历史记录', href: '#', key: 'history' },
    { label: '情绪分析', href: '#', key: 'analysis' },
    { label: '个人中心', href: '#', key: 'profile' },
    { label: '后台管理', href: '#', key: 'admin' }
  ];

  const handleNavItemClick = (index: number) => {
    const key = navItems[index].key;
    setCurrent(key);
    // 映射key到正确的路由路径
    const routeMap: Record<string, string> = {
      recognition: '/',
      history: '/history',
      analysis: '/analysis',
      profile: '/profile',
      admin: '/admin'
    }
    navigate(routeMap[key] || '/')
  };

  const getActiveIndex = () => {
    return navItems.findIndex(item => item.key === current);
  };

  const getCurrentColors = () => {
    const lowerEmotion = emotion.toLowerCase();
    const colorMap = isDarkMode ? emotionToColorsDark : emotionToColors;

    // 如果是初始状态（neutral），使用纯色背景
    if (lowerEmotion === 'neutral') {
      return {
        background: isDarkMode ? '#0a1628' : '#ffffff',
        primary: isDarkMode ? '#8b5cf6' : '#177ddc',
        secondary: isDarkMode ? '#a78bfa' : '#3b82f6',
        text: isDarkMode ? '#e8eaf0' : '#1a1a1a'
      };
    }

    const colors = colorMap[lowerEmotion];
    console.log('Current emotion:', emotion);
    console.log('Dark mode:', isDarkMode);
    console.log('Colors found:', colors);
    return colors || (isDarkMode ? emotionToColorsDark.neutral : emotionToColors.neutral);
  }

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: isDarkMode ? '#177ddc' : undefined,
          borderRadius: 8,
        }
      }}
    >
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
            height: '80px',
            lineHeight: '80px',
            padding: '0 32px',
            background: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            borderBottom: `2px solid ${getCurrentColors().primary}`,
            position: 'relative',
            zIndex: 1000
          }}
        >
          {/* 标题区域 */}
          <div style={{ flex: '0 0 auto' }}>
            <Typography.Title
              level={3}
              style={{
                margin: 0,
                color: getCurrentColors().primary,
                fontWeight: '700',
                lineHeight: '80px',
                whiteSpace: 'nowrap'
              }}
            >
              AI情绪识别
            </Typography.Title>
          </div>

          {/* 导航区域 - 居中显示 */}
          <div style={{
            flex: '1 1 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '0 24px'
          }}>
            <div style={{
              position: 'relative',
              height: '60px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <GooeyNav
                items={navItems}
                activeIndex={getActiveIndex()}
                onItemClick={handleNavItemClick}
                particleCount={15}
                particleDistances={[90, 10]}
                particleR={100}
                animationTime={600}
                timeVariance={300}
                colors={[1, 2, 3, 1, 2, 3, 1, 4]}
                primaryColor={getCurrentColors().primary}
                secondaryColor={getCurrentColors().secondary}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* 用户操作区域 */}
          <div style={{
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            gap: '12px'
          }}>
            {/* 夜间模式切换按钮 */}
            <Button
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleDarkMode}
              style={{
                color: getCurrentColors().primary,
                border: `1px solid ${getCurrentColors().primary}`,
                background: 'transparent'
              }}
            >
              {isDarkMode ? '日间' : '夜间'}
            </Button>

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Space size="middle">
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

            {/* 受保护的路由 */}
            <Route path="/" element={<PrivateRoute />}>
              <Route index element={<EmotionRecognition />} />
              <Route path="history" element={<EmotionHistory />} />
              <Route path="analysis" element={<EmotionAnalysis />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Layout.Content>

        <Layout.Footer
          style={{
            background: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
            borderTop: `2px solid ${getCurrentColors().primary}`
          }}
        >
          AI校园心理健康平台 ©2024 Created by Trae AI
        </Layout.Footer>
      </Layout>
    </ConfigProvider>
  )
}

// 主应用组件
const App: React.FC = () => {
  const [emotion, setEmotion] = useState('neutral')

  console.log('App emotion state:', emotion);

  return (
    <AuthProvider>
      <DarkModeProvider>
        <EmotionContext.Provider value={{ emotion, setEmotion }}>
          <Router>
            <AppNavigation />
          </Router>
        </EmotionContext.Provider>
      </DarkModeProvider>
    </AuthProvider>
  )
}

export default App
