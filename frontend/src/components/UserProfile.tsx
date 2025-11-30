import React, { useState, useContext } from 'react'
import { Card, Typography, Form, Input, Button, Avatar, Space, Row, Col, Switch } from 'antd'
import { UserOutlined, EditOutlined, SaveOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons'
import { EmotionContext, emotionToColors } from '../App'

const { Title, Paragraph } = Typography

const UserProfile: React.FC = () => {
  const [form] = Form.useForm()
  const [editing, setEditing] = useState(false)
  const { emotion } = useContext(EmotionContext)
  
  // 获取当前情绪对应的颜色
  const getCurrentColors = () => {
    return emotionToColors[emotion.toLowerCase()] || emotionToColors.neutral
  }

  const userInfo = {
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    school: '清华大学',
    major: '计算机科学与技术',
    grade: '大三'
  }

  const handleEdit = () => {
    setEditing(true)
    form.setFieldsValue(userInfo)
  }

  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('保存用户信息:', values)
      setEditing(false)
    })
  }

  const handleCancel = () => {
    setEditing(false)
  }

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
              background: 'rgba(255, 255, 255, 0.85)',
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
                  color: getCurrentColors().text, 
                  fontWeight: '700' 
                }}
              >
                {userInfo.name}
              </Title>
              <Paragraph 
                style={{ 
                  color: getCurrentColors().text, 
                  opacity: 0.8 
                }}
              >
                {userInfo.school} · {userInfo.major} · {userInfo.grade}
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
                    color: getCurrentColors().text,
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
              background: 'rgba(255, 255, 255, 0.85)',
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
                color: getCurrentColors().text, 
                fontWeight: '700' 
              }}
            >
              心理健康状态
            </Title>
            <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 16 }}>
              <div>
                <strong style={{ color: getCurrentColors().text }}>最近情绪状态：</strong>
                <span style={{ marginLeft: 8, color: getCurrentColors().primary, fontWeight: '700' }}>良好</span>
              </div>
              <div>
                <strong style={{ color: getCurrentColors().text }}>本月分析次数：</strong>
                <span style={{ marginLeft: 8, color: getCurrentColors().text, fontWeight: '700' }}>24次</span>
              </div>
              <div>
                <strong style={{ color: getCurrentColors().text }}>情绪稳定指数：</strong>
                <span style={{ marginLeft: 8, color: getCurrentColors().text, fontWeight: '700' }}>85分</span>
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={24} lg={16}>
          <Card 
            className="card"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
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
                color: getCurrentColors().text, 
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
                    label={<span style={{ color: getCurrentColors().text }}>姓名</span>}
                    rules={[{ required: true, message: '请输入姓名' }]}
                  >
                    <Input 
                      placeholder="请输入姓名" 
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: getCurrentColors().text,
                        background: 'rgba(255, 255, 255, 0.9)',
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={24} lg={12}>
                  <Form.Item
                    name="email"
                    label={<span style={{ color: getCurrentColors().text }}>邮箱</span>}
                    rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入正确的邮箱格式' }]}
                  >
                    <Input 
                      placeholder="请输入邮箱" 
                      prefix={<MailOutlined style={{ color: getCurrentColors().primary }} />} 
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: getCurrentColors().text,
                        background: 'rgba(255, 255, 255, 0.9)',
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
                    label={<span style={{ color: getCurrentColors().text }}>电话</span>}
                    rules={[{ required: true, message: '请输入电话' }]}
                  >
                    <Input 
                      placeholder="请输入电话" 
                      prefix={<PhoneOutlined style={{ color: getCurrentColors().primary }} />} 
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: getCurrentColors().text,
                        background: 'rgba(255, 255, 255, 0.9)',
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={24} lg={12}>
                  <Form.Item
                    name="school"
                    label={<span style={{ color: getCurrentColors().text }}>学校</span>}
                    rules={[{ required: true, message: '请输入学校' }]}
                  >
                    <Input 
                      placeholder="请输入学校" 
                      prefix={<HomeOutlined style={{ color: getCurrentColors().primary }} />} 
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: getCurrentColors().text,
                        background: 'rgba(255, 255, 255, 0.9)',
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
                    label={<span style={{ color: getCurrentColors().text }}>专业</span>}
                    rules={[{ required: true, message: '请输入专业' }]}
                  >
                    <Input 
                      placeholder="请输入专业" 
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: getCurrentColors().text,
                        background: 'rgba(255, 255, 255, 0.9)',
                        transition: 'border-color 0.3s ease'
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={24} lg={12}>
                  <Form.Item
                    name="grade"
                    label={<span style={{ color: getCurrentColors().text }}>年级</span>}
                    rules={[{ required: true, message: '请输入年级' }]}
                  >
                    <Input 
                      placeholder="请输入年级" 
                      style={{
                        border: `2px solid ${getCurrentColors().secondary}`,
                        borderRadius: '8px',
                        color: getCurrentColors().text,
                        background: 'rgba(255, 255, 255, 0.9)',
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
              background: 'rgba(255, 255, 255, 0.85)',
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
                color: getCurrentColors().text, 
                fontWeight: '700' 
              }}
            >
              账户设置
            </Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: getCurrentColors().text }}>通知设置</span>
                <Switch 
                  defaultChecked 
                  checkedChildren="开" 
                  unCheckedChildren="关"
                  style={{
                    backgroundColor: getCurrentColors().secondary,
                    '&:checked': {
                      backgroundColor: getCurrentColors().primary
                    }
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: getCurrentColors().text }}>情绪报告推送</span>
                <Switch 
                  defaultChecked 
                  checkedChildren="开" 
                  unCheckedChildren="关"
                  style={{
                    backgroundColor: getCurrentColors().secondary,
                    '&:checked': {
                      backgroundColor: getCurrentColors().primary
                    }
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: getCurrentColors().text }}>隐私保护</span>
                <Switch 
                  defaultChecked 
                  checkedChildren="开" 
                  unCheckedChildren="关"
                  style={{
                    backgroundColor: getCurrentColors().secondary,
                    '&:checked': {
                      backgroundColor: getCurrentColors().primary
                    }
                  }}
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