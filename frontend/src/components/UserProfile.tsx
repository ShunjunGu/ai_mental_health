import React, { useState, useContext, useEffect } from 'react'
import { Card, Typography, Form, Input, Button, Avatar, Space, Row, Col, Switch, message } from 'antd'
import { UserOutlined, EditOutlined, SaveOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons'
import { EmotionContext, emotionToColors, emotionToColorsDark } from '../contexts/EmotionContext'
import { useAuth } from '../contexts/AuthContext'
import { useDarkMode } from '../contexts/DarkModeContext'
import { emotionService } from '../services/emotionService'

const { Title, Paragraph } = Typography

const UserProfile: React.FC = () => {
  const [form] = Form.useForm()
  const [editing, setEditing] = useState(false)
  const { emotion } = useContext(EmotionContext)
  const { user, updateUser } = useAuth()
  const { isDarkMode } = useDarkMode()

  // 情绪统计数据
  const [monthlyAnalysisCount, setMonthlyAnalysisCount] = useState(0)
  const [emotionStabilityIndex, setEmotionStabilityIndex] = useState(0)
  const [recentEmotionStatus, setRecentEmotionStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // 获取当前情绪对应的颜色
  const getCurrentColors = () => {
    const lowerEmotion = emotion.toLowerCase()
    const colorMap = isDarkMode ? emotionToColorsDark : emotionToColors

    // 如果是初始状态（neutral），使用纯色背景
    if (lowerEmotion === 'neutral') {
      return {
        background: isDarkMode ? '#0a1628' : '#ffffff',
        primary: isDarkMode ? '#8b5cf6' : '#177ddc',
        secondary: isDarkMode ? '#a78bfa' : '#3b82f6',
        text: isDarkMode ? '#e8eaf0' : '#1a1a1a'
      }
    }

    return colorMap[lowerEmotion] || (isDarkMode ? emotionToColorsDark.neutral : emotionToColors.neutral)
  }

  // 获取卡片背景色
  const getCardBackground = () => {
    return isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.85)'
  }

  // 获取输入框背景色
  const getInputBackground = () => {
    return isDarkMode ? 'var(--bg-secondary)' : 'rgba(255, 255, 255, 0.9)'
  }

  // 使用真实用户信息或默认值
  const userInfo = user || {
    name: '用户',
    email: '',
    phone: '',
    school: '',
    major: '',
    grade: ''
  }

  const handleEdit = () => {
    setEditing(true)
    form.setFieldsValue(userInfo)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      console.log('保存用户信息:', values)
      await updateUser(values)
      message.success('用户信息更新成功')
      setEditing(false)
    } catch (error) {
      console.error('更新用户信息失败:', error)
      message.error('更新用户信息失败，请稍后重试')
    }
  }

  const handleCancel = () => {
    setEditing(false)
  }

  // 获取用户情绪统计数据
  const fetchEmotionStatistics = async () => {
    setIsLoading(true)
    
    try {
      // 获取本月分析次数（无论用户是否登录）
      const count = await emotionService.getMonthlyAnalysisCount()
      setMonthlyAnalysisCount(count)
      console.log('本月分析次数:', count)
    } catch (error) {
      console.error('获取本月分析次数失败:', error)
      setMonthlyAnalysisCount(0)
    }
    
    try {
      // 只有登录用户才获取情绪稳定指数和状态
      if (user && localStorage.getItem('token')) {
        // 获取情绪统计数据计算稳定指数
        const statistics = await emotionService.getEmotionStatistics()
        console.log('情绪统计数据:', statistics)
        
        if (statistics.length > 0) {
          // 简单计算情绪稳定指数（基于平均分）
          // 由于我们现在使用的是stats端点，averageScore可能为0，我们可以基于情绪分布来计算
          const totalCount = statistics.reduce((sum, item) => sum + item.count, 1)
          
          // 简单的情绪评分算法：积极情绪（happy, calm等）得分高，消极情绪（angry, anxious等）得分低
          let totalScore = 0
          statistics.forEach(item => {
            let baseScore = 50 // 基础分数
            
            // 根据情绪类型调整分数
            switch (item.emotion.toLowerCase()) {
              case 'happy':
              case 'calm':
              case 'grateful':
                baseScore = 80
                break
              case 'neutral':
              case 'surprised':
                baseScore = 60
                break
              case 'sad':
              case 'tired':
                baseScore = 40
                break
              case 'angry':
              case 'anxious':
              case 'fearful':
                baseScore = 20
                break
            }
            
            totalScore += baseScore * item.count
          })
          
          const averageScore = totalScore / totalCount
          const stabilityIndex = Math.round(averageScore)
          setEmotionStabilityIndex(stabilityIndex)
          
          // 根据平均分确定状态
          if (stabilityIndex >= 70) {
            setRecentEmotionStatus('良好')
          } else if (stabilityIndex >= 50) {
            setRecentEmotionStatus('一般')
          } else {
            setRecentEmotionStatus('需要关注')
          }
        }
      } else {
        // 未登录用户显示默认状态
        setRecentEmotionStatus('')
        setEmotionStabilityIndex(0)
      }
    } catch (error) {
      console.error('获取情绪稳定指数失败:', error)
      // 即使获取稳定指数失败，也不影响组件的其他功能
    } finally {
      setIsLoading(false)
    }
  }

  // 组件加载时获取数据
  useEffect(() => {
    fetchEmotionStatistics()
  }, [user])

  return (
    <div>
      <Title 
        level={2} 
        style={{ 
          color: getCurrentColors().text, 
          fontWeight: '700',
          marginBottom: '16px'
        }}
      >
        个人中心
      </Title>
      <Paragraph 
        style={{ 
          color: getCurrentColors().text, 
          marginBottom: '32px'
        }}
      >
        管理您的个人信息和账户设置
      </Paragraph>

      <Row gutter={[24, 24]}>
        <Col span={24} lg={8}>
          <Card
            className="card"
            style={{
              background: getCardBackground(),
              backdropFilter: 'blur(10px)',
              border: `2px solid ${getCurrentColors().primary}`,
              borderRadius: '12px',
              boxShadow: `0 4px 16px rgba(${getCurrentColors().primary.replace('#', '')}, 0.15)`,
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={128}
                icon={<UserOutlined style={{ color: getCurrentColors().primary }} />}
                style={{
                  marginBottom: 16,
                  background: `linear-gradient(135deg, ${getCurrentColors().primary}, ${getCurrentColors().secondary})`
                }}
              />
              <Title
                level={3}
                style={{
                  color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                  fontWeight: '700'
                }}
              >
                {userInfo.name}
              </Title>
              <Paragraph
                style={{
                  color: isDarkMode ? '#b0b0b0' : getCurrentColors().text,
                  opacity: 0.8
                }}
              >
                {userInfo.school && userInfo.major && userInfo.grade ?
                  `${userInfo.school} · ${userInfo.major} · ${userInfo.grade}` :
                  '请完善个人信息'
                }
              </Paragraph>
              <Button
                type="primary"
                icon={editing ? <SaveOutlined /> : <EditOutlined />}
                onClick={editing ? handleSave : handleEdit}
                style={{
                  marginRight: 8,
                  background: `linear-gradient(135deg, ${getCurrentColors().primary}, ${getCurrentColors().secondary})`,
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                {editing ? '保存' : '编辑资料'}
              </Button>
              {editing && (
                <Button
                  onClick={handleCancel}
                  style={{
                    border: `2px solid ${getCurrentColors().secondary}`,
                    color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  取消
                </Button>
              )}
            </div>
          </Card>

          <Card
            className="card"
            style={{
              background: getCardBackground(),
              backdropFilter: 'blur(10px)',
              border: `2px solid ${getCurrentColors().primary}`,
              borderRadius: '12px',
              boxShadow: `0 4px 16px rgba(${getCurrentColors().primary.replace('#', '')}, 0.15)`,
              transition: 'all 0.3s ease'
            }}
          >
            <Title
              level={4}
              style={{
                color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                fontWeight: '700'
              }}
            >
              心理健康状态
            </Title>
            <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 16 }}>
              <div>
                <strong style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>最近情绪状态：</strong>
                <span style={{
                  marginLeft: 8,
                  color: recentEmotionStatus === '良好' ?
                    getCurrentColors().primary :
                    recentEmotionStatus === '一般' ?
                    '#faad14' : '#f5222d',
                  fontWeight: '700'
                }}>
                  {isLoading ? '加载中...' : recentEmotionStatus || '暂无数据'}
                </span>
              </div>
              <div>
                <strong style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>本月分析次数：</strong>
                <span style={{ marginLeft: 8, color: getCurrentColors().primary, fontWeight: '700' }}>
                  {isLoading ? '加载中...' : `${monthlyAnalysisCount}次`}
                </span>
              </div>
              <div>
                <strong style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>情绪稳定指数：</strong>
                <span style={{
                  marginLeft: 8,
                  color: emotionStabilityIndex >= 80 ?
                    getCurrentColors().primary :
                    emotionStabilityIndex >= 60 ?
                    '#faad14' : '#f5222d',
                  fontWeight: '700'
                }}>
                  {isLoading ? '加载中...' : (emotionStabilityIndex > 0 ? `${emotionStabilityIndex}分` : '暂无数据')}
                </span>
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={24} lg={16}>
          <Card
            className="card"
            style={{
              background: getCardBackground(),
              backdropFilter: 'blur(10px)',
              border: `2px solid ${getCurrentColors().primary}`,
              borderRadius: '12px',
              boxShadow: `0 4px 16px rgba(${getCurrentColors().primary.replace('#', '')}, 0.15)`,
              transition: 'all 0.3s ease'
            }}
          >
            <Title
              level={4}
              style={{
                color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                fontWeight: '700'
              }}
            >
              个人信息
            </Title>
            <Form
              form={form}
              layout="vertical"
              disabled={!editing}
              initialValues={userInfo}
            >
              <Row gutter={16}>
                <Col span={24} lg={12}>
                  <Form.Item
                    name="name"
                    label={<span style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>姓名</span>}
                    rules={[{ required: true, message: '请输入姓名' }]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: getCurrentColors().primary }} />}
                      placeholder="请输入姓名"
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                        background: getInputBackground(),
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={24} lg={12}>
                  <Form.Item
                    name="email"
                    label={<span style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>邮箱</span>}
                    rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入正确的邮箱格式' }]}
                  >
                    <Input
                      placeholder="请输入邮箱"
                      prefix={<MailOutlined style={{ color: getCurrentColors().primary }} />}
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                        background: getInputBackground(),
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24} lg={12}>
                  <Form.Item
                    name="phone"
                    label={<span style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>电话</span>}
                    rules={[{ required: true, message: '请输入电话' }]}
                  >
                    <Input
                      placeholder="请输入电话"
                      prefix={<PhoneOutlined style={{ color: getCurrentColors().primary }} />}
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                        background: getInputBackground(),
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={24} lg={12}>
                  <Form.Item
                    name="school"
                    label={<span style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>学校</span>}
                    rules={[{ required: true, message: '请输入学校' }]}
                  >
                    <Input
                      placeholder="请输入学校"
                      prefix={<HomeOutlined style={{ color: getCurrentColors().primary }} />}
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                        background: getInputBackground(),
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24} lg={12}>
                  <Form.Item
                    name="major"
                    label={<span style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>专业</span>}
                    rules={[{ required: true, message: '请输入专业' }]}
                  >
                    <Input
                      placeholder="请输入专业"
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                        background: getInputBackground(),
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={24} lg={12}>
                  <Form.Item
                    name="grade"
                    label={<span style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>年级</span>}
                    rules={[{ required: true, message: '请输入年级' }]}
                  >
                    <Input
                      placeholder="请输入年级"
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                        background: getInputBackground(),
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card
            className="card"
            style={{
              background: getCardBackground(),
              backdropFilter: 'blur(10px)',
              border: `2px solid ${getCurrentColors().primary}`,
              borderRadius: '12px',
              boxShadow: `0 4px 16px rgba(${getCurrentColors().primary.replace('#', '')}, 0.15)`,
              transition: 'all 0.3s ease'
            }}
          >
            <Title
              level={4}
              style={{
                color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                fontWeight: '700'
              }}
            >
              账户设置
            </Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>通知设置</span>
                <Switch
                  defaultChecked
                  checkedChildren="开"
                  unCheckedChildren="关"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>情绪报告推送</span>
                <Switch
                  defaultChecked
                  checkedChildren="开"
                  unCheckedChildren="关"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>隐私保护</span>
                <Switch
                  defaultChecked
                  checkedChildren="开"
                  unCheckedChildren="关"
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default UserProfile