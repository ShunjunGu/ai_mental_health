import React, { useState, useContext } from 'react';
import { Card, Typography, Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { EmotionContext, emotionToColors } from '../App';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;
const { Password } = Input;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { emotion } = useContext(EmotionContext);
  const { login } = useAuth();

  // 获取当前情绪对应的颜色
  const getCurrentColors = () => {
    return emotionToColors[emotion.toLowerCase()] || emotionToColors.neutral;
  };

  // 处理登录提交
  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values);
      message.success('登录成功！');

      // 获取登录前想要访问的页面，如果没有则默认跳转到首页
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败，请检查您的邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      padding: '24px'
    }}>
      <Card 
        className="login-card"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'rgba(255, 255, 255, 0.9)',
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
            登录账户
          </Title>
          <Paragraph 
            style={{ 
              color: getCurrentColors().text, 
              marginBottom: '0'
            }}
          >
            欢迎回到AI校园心理健康平台
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label={<span style={{ color: getCurrentColors().text }}>邮箱</span>}
            rules={[
              { required: true, message: '请输入您的邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: getCurrentColors().primary }} />}
              placeholder="请输入邮箱"
              style={{
                border: `2px solid ${getCurrentColors().secondary}`,
                borderRadius: '8px',
                color: getCurrentColors().text,
                background: 'rgba(255, 255, 255, 0.9)',
                transition: 'border-color 0.3s ease'
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ color: getCurrentColors().text }}>密码</span>}
            rules={[
              { required: true, message: '请输入您的密码' },
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
                background: 'rgba(255, 255, 255, 0.9)',
                transition: 'border-color 0.3s ease'
              }}
            />
          </Form.Item>

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
              登录
            </Button>
          </Form.Item>

          <Divider style={{ margin: '16px 0' }}>
            <span style={{ color: getCurrentColors().text }}>还没有账户？</span>
          </Divider>

          <Link to="/register" style={{ width: '100%' }}>
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
              立即注册
            </Button>
          </Link>
        </Form>
      </Card>
    </div>
  );
};

export default Login;