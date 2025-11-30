import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Layout, Menu } from 'antd'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import { HomeOutlined, BarChartOutlined, HistoryOutlined, UserOutlined } from '@ant-design/icons'
import { useState, createContext } from 'react'

// 导入组件
import EmotionRecognition from './components/EmotionRecognition'
import EmotionHistory from './components/EmotionHistory'
import EmotionAnalysis from './components/EmotionAnalysis'
import UserProfile from './components/UserProfile'

const { Header, Content, Footer } = Layout

// 创建情绪上下文
interface EmotionContextType {
  emotion: string
  setEmotion: (emotion: string) => void
}

const EmotionContext = createContext<EmotionContextType>({
  emotion: 'neutral',
  setEmotion: () => {}
})

// 情绪到颜色的映射
const emotionToColors: Record<string, {
  background: string
  primary: string
  secondary: string
  text: string
}> = {
  happy: {
    background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE082 50%, #FFD54F 100%)',
    primary: '#FFD54F',
    secondary: '#FFE082',
    text: '#FF8F00'
  },
  angry: {
    background: 'linear-gradient(135deg, #FFECB3 0%, #FFCCBC 50%, #FFAB91 100%)',
    primary: '#FF5252',
    secondary: '#FFCCBC',
    text: '#D32F2F'
  },
  sad: {
    background: 'linear-gradient(135deg, #E3F2FD 0%, #B3E5FC 50%, #81D4FA 100%)',
    primary: '#2196F3',
    secondary: '#B3E5FC',
    text: '#1565C0'
  },
  fear: {
    background: 'linear-gradient(135deg, #F3E5F5 0%, #D1C4E9 50%, #B39DDB 100%)',
    primary: '#9C27B0',
    secondary: '#D1C4E9',
    text: '#6A1B9A'
  },
  surprise: {
    background: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 50%, #F48FB1 100%)',
    primary: '#E91E63',
    secondary: '#F8BBD0',
    text: '#C2185B'
  },
  neutral: {
    background: 'linear-gradient(135deg, #F5F5F5 0%, #E0F2F1 50%, #B2DFDB 100%)',
    primary: '#4CAF50',
    secondary: '#E0F2F1',
    text: '#2E7D32'
  }
}

function App() {
  const [emotion, setEmotion] = useState('neutral')
  
  // 根据情绪获取颜色配置
  const getEmotionColors = () => {
    return emotionToColors[emotion.toLowerCase()] || emotionToColors.neutral
  }
  
  return (
    <EmotionContext.Provider value={{ emotion, setEmotion }}>
      <ConfigProvider locale={zhCN}>
        <div 
          style={{
            minHeight: '100vh',
            background: getEmotionColors().background,
            transition: 'background 0.5s ease-in-out',
          }}
        >
          <Router>
            <Layout className="layout" style={{ background: 'transparent', minHeight: '100vh' }}>
              <Header 
                style={{
                  background: 'rgba(255, 255, 255, 0.85)', 
                  backdropFilter: 'blur(10px)',
                  borderBottom: `2px solid ${getEmotionColors().primary}`
                }}
              >
                <div 
                  className="logo" 
                  style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: getEmotionColors().text,
                    letterSpacing: '-0.5px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  AI校园心理健康平台
                </div>
                <Menu
                  theme="light"
                  mode="horizontal"
                  defaultSelectedKeys={['1']}
                  items={[
                    { 
                      key: '1', 
                      label: <Link to="/">情绪识别</Link>, 
                      icon: <HomeOutlined /> 
                    },
                    { 
                      key: '2', 
                      label: <Link to="/history">历史记录</Link>, 
                      icon: <HistoryOutlined /> 
                    },
                    { 
                      key: '3', 
                      label: <Link to="/analysis">情绪分析</Link>, 
                      icon: <BarChartOutlined /> 
                    },
                    { 
                      key: '4', 
                      label: <Link to="/profile">个人中心</Link>, 
                      icon: <UserOutlined /> 
                    },
                  ]}
                  style={{
                    background: 'transparent',
                    borderBottom: 'none',
                    color: getEmotionColors().text
                  }}
                  itemStyle={{
                    color: getEmotionColors().text,
                    transition: 'all 0.3s ease'
                  }}
                  selectedKeysStyle={{
                    color: getEmotionColors().primary,
                    fontWeight: '700'
                  }}
                  popupStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: `2px solid ${getEmotionColors().primary}`,
                    borderRadius: '8px'
                  }}
                />
              </Header>
              <Content style={{ background: 'transparent', padding: '40px 50px' }}>
                <div className="site-layout-content">
                  <Routes>
                    <Route path="/" element={<EmotionRecognition />} />
                    <Route path="/history" element={<EmotionHistory />} />
                    <Route path="/analysis" element={<EmotionAnalysis />} />
                    <Route path="/profile" element={<UserProfile />} />
                  </Routes>
                </div>
              </Content>
              <Footer 
                style={{
                  background: 'rgba(255, 255, 255, 0.85)', 
                  backdropFilter: 'blur(10px)', 
                  color: getEmotionColors().text,
                  borderTop: `2px solid ${getEmotionColors().primary}`
                }}
              >
                AI校园心理健康平台 ©2024 Created by Trae AI
              </Footer>
            </Layout>
          </Router>
        </div>
      </ConfigProvider>
    </EmotionContext.Provider>
  )
}

export default App
// 导出情绪上下文和颜色映射，供其他组件使用
export { EmotionContext, emotionToColors }