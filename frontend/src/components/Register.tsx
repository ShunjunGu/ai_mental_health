import React, { useState, useContext, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, message, Divider, Row, Col, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, TeamOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { EmotionContext, emotionToColors, emotionToColorsDark } from '../contexts/EmotionContext';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';

const { Title, Paragraph } = Typography;
const { Password } = Input;
const { Option } = Select;

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { emotion } = useContext(EmotionContext);
  const { register } = useAuth();
  const { isDarkMode } = useDarkMode();
  
  // 获取当前角色值（添加默认值保护）
  const role = Form.useWatch(['role'], form) || 'student';
  
  // 设置表单初始值
  useEffect(() => {
    form.setFieldValue('role', 'student');
  }, [form]);
  
  // 监听表单值变化
  const handleValuesChange = (changedValues: any) => {
    // 当角色改变时，重置相关字段
    if (changedValues.role) {
      if (changedValues.role === 'student') {
        form.setFieldsValue({ teacherId: undefined, department: undefined });
      } else {
        form.setFieldsValue({ studentId: undefined, grade: undefined, class: undefined });
      }
    }
  };

  // 获取当前情绪对应的颜色
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

    return colorMap[lowerEmotion] || (isDarkMode ? emotionToColorsDark.neutral : emotionToColors.neutral);
  };

  // 获取卡片背景色
  const getCardBackground = () => {
    return isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.9)';
  };

  // 获取输入框背景色
  const getInputBackground = () => {
    return isDarkMode ? 'var(--bg-secondary)' : 'rgba(255, 255, 255, 0.9)';
  };

  // 处理注册提交
  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      await register(values);
      message.success('注册成功！');
      navigate('/');
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start', 
      minHeight: '100vh',
      padding: '24px'
    }}>
      <Card 
        className="register-card"
        style={{
          width: '100%',
          maxWidth: '600px',
          background: getCardBackground(),
          backdropFilter: 'blur(10px)',
          border: `2px solid ${getCurrentColors().primary}`,
          borderRadius: '16px',
          boxShadow: `0 8px 32px rgba(${getCurrentColors().primary.replace('#', '')}, 0.2)`,
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title 
            level={2} 
            style={{ 
              color: getCurrentColors().primary, 
              fontWeight: '700',
              marginBottom: '8px'
            }}
          >
            创建账户
          </Title>
          <Paragraph 
            style={{ 
              color: getCurrentColors().text, 
              marginBottom: '0'
            }}
          >
            加入AI校园心理健康平台，开启情绪之旅
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          autoComplete="off"
          onValuesChange={handleValuesChange}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label={<span style={{ color: getCurrentColors().text }}>姓名</span>}
                rules={[{ required: true, message: '请输入您的姓名' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: getCurrentColors().primary }} />}
                  placeholder="请输入姓名"
                  style={{
                    border: `2px solid ${getCurrentColors().secondary}`,
                    borderRadius: '8px',
                    color: getCurrentColors().text,
                    background: getInputBackground(),
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="email"
                label={<span style={{ color: getCurrentColors().text }}>邮箱</span>}
                rules={[
                  { required: true, message: '请输入您的邮箱' },
                  { type: 'email', message: '请输入正确的邮箱格式' }
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: getCurrentColors().primary }} />}
                  placeholder="请输入邮箱"
                  style={{
                    border: `2px solid ${getCurrentColors().secondary}`,
                    borderRadius: '8px',
                    color: getCurrentColors().text,
                    background: getInputBackground(),
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="password"
                label={<span style={{ color: getCurrentColors().text }}>密码</span>}
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码长度不能少于6个字符' }
                ]}
              >
                <Password
                  prefix={<LockOutlined style={{ color: getCurrentColors().primary }} />}
                  placeholder="请输入密码"
                  style={{
                    border: `2px solid ${getCurrentColors().secondary}`,
                    borderRadius: '8px',
                    color: getCurrentColors().text,
                    background: getInputBackground(),
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="phone"
                label={<span style={{ color: getCurrentColors().text }}>电话</span>}
                rules={[{ required: true, message: '请输入您的电话' }]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: getCurrentColors().primary }} />}
                  placeholder="请输入电话"
                  style={{
                    border: `2px solid ${getCurrentColors().secondary}`,
                    borderRadius: '8px',
                    color: getCurrentColors().text,
                    background: getInputBackground(),
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label={<span style={{ color: getCurrentColors().text }}>角色</span>}
                rules={[{ required: true, message: '请选择您的角色' }]}
              >
                <Select
                  placeholder="请选择角色"
                  prefix={<TeamOutlined style={{ color: getCurrentColors().primary }} />}
                  style={{
                    border: `2px solid ${getCurrentColors().secondary}`,
                    borderRadius: '8px',
                    color: getCurrentColors().text,
                    background: getInputBackground(),
                    transition: 'border-color 0.3s ease'
                  }}
                >
                  <Option value="student">学生</Option>
                  <Option value="teacher">教师</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={<span style={{ color: getCurrentColors().text }}>性别</span>}
                rules={[{ required: true, message: '请选择您的性别' }]}
              >
                <Select
                  placeholder="请选择性别"
                  style={{
                    border: `2px solid ${getCurrentColors().secondary}`,
                    borderRadius: '8px',
                    color: getCurrentColors().text,
                    background: getInputBackground(),
                    transition: 'border-color 0.3s ease'
                  }}
                >
                  <Option value="male">男</Option>
                  <Option value="female">女</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="age"
                label={<span style={{ color: getCurrentColors().text }}>年龄</span>}
                rules={[{ required: true, message: '请输入您的年龄' }, { type: 'number', min: 0, max: 150, message: '请输入有效的年龄' }]}
                getValueFromEvent={(e: React.ChangeEvent<HTMLInputElement>) => {
                  // 确保返回数字类型而不是字符串
                  return e.target.value ? Number(e.target.value) : undefined;
                }}
              >
                <Input
                  type="number"
                  placeholder="请输入年龄"
                  style={{
                    border: `2px solid ${getCurrentColors().secondary}`,
                    borderRadius: '8px',
                    color: getCurrentColors().text,
                    background: getInputBackground(),
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={role === 'student' ? 'studentId' : 'teacherId'}
                label={<span style={{ color: getCurrentColors().text }}>{role === 'student' ? '学号' : '工号'}</span>}
                dependencies={['role']}
                rules={[{ required: true, message: `请输入您的${role === 'student' ? '学号' : '工号'}` }]}
              >
                <Input
                  placeholder={`请输入${role === 'student' ? '学号' : '工号'}`}
                  style={{
                    border: `2px solid ${getCurrentColors().secondary}`,
                    borderRadius: '8px',
                    color: getCurrentColors().text,
                    background: getInputBackground(),
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 学生特有字段 */}
          {role === 'student' && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="grade"
                  label={<span style={{ color: getCurrentColors().text }}>年级</span>}
                  rules={[{ required: true, message: '请输入您的年级' }]}
                >
                  <Input
                    placeholder="请输入年级（如：大三）"
                    style={{
                      border: `2px solid ${getCurrentColors().secondary}`,
                      borderRadius: '8px',
                      color: getCurrentColors().text,
                      background: getInputBackground(),
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="class"
                  label={<span style={{ color: getCurrentColors().text }}>班级</span>}
                  rules={[{ required: true, message: '请输入您的班级' }]}
                >
                  <Input
                    placeholder="请输入班级（如：软件工程1班）"
                    style={{
                      border: `2px solid ${getCurrentColors().secondary}`,
                      borderRadius: '8px',
                      color: getCurrentColors().text,
                      background: getInputBackground(),
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* 教师和咨询师特有字段 */}
          {(role === 'teacher' || role === 'counselor') && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="department"
                  label={<span style={{ color: getCurrentColors().text }}>部门/科室</span>}
                  rules={[{ required: true, message: '请输入您的部门或科室' }]}
                >
                  <Input
                    placeholder="请输入部门或科室"
                    style={{
                      border: `2px solid ${getCurrentColors().secondary}`,
                      borderRadius: '8px',
                      color: getCurrentColors().text,
                      background: getInputBackground(),
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item style={{ marginBottom: '24px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                background: `linear-gradient(135deg, ${getCurrentColors().primary}, ${getCurrentColors().secondary})`,
                border: 'none',
                color: '#FFFFFF',
                fontWeight: '700',
                borderRadius: '8px',
                padding: '10px',
                transition: 'all 0.3s ease'
              }}
            >
              注册
            </Button>
          </Form.Item>

          <Divider style={{ margin: '16px 0' }}>
            <span style={{ color: getCurrentColors().text }}>已有账户？</span>
          </Divider>

          <Link to="/login" style={{ width: '100%' }}>
            <Button
              type="default"
              style={{
                width: '100%',
                border: `2px solid ${getCurrentColors().primary}`,
                color: getCurrentColors().primary,
                fontWeight: '700',
                borderRadius: '8px',
                padding: '10px',
                transition: 'all 0.3s ease'
              }}
            >
              立即登录
            </Button>
          </Link>
        </Form>
      </Card>
    </div>
  );
};

export default Register;