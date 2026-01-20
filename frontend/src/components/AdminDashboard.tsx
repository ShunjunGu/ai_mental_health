import React, { useState, useEffect, useContext } from 'react';
import { Card, Table, Typography, Input, Select, Space, Tag, message, Row, Col, Statistic, Button, Spin } from 'antd';
import { SearchOutlined, UserOutlined, TeamOutlined, EyeOutlined, LoginOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { EmotionContext, emotionToColors } from '../App';
import { api } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// 用户接口定义
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  teacherId?: string;
  phone?: string;
  gender?: string;
  age?: number;
  grade?: string;
  class?: string;
  department?: string;
  avatar?: string;
  isActive: boolean;
}

// 角色中文映射
const roleMap: Record<string, string> = {
  student: '学生',
  teacher: '教师',
  counselor: '心理咨询师',
  admin: '管理员'
};

// 性别中文映射
const genderMap: Record<string, string> = {
  male: '男',
  female: '女',
  other: '其他'
};

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const { emotion } = useContext(EmotionContext);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // 获取当前情绪对应的颜色
  const getCurrentColors = () => {
    return emotionToColors[emotion.toLowerCase()] || emotionToColors.neutral;
  };
  
  // 检查访问权限
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        message.warning('请先登录后访问管理后台');
      } else if (user?.role !== 'admin') {
        message.error('您没有权限访问管理后台');
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);
  
  // 如果正在加载认证状态，显示加载中
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '70vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }
  
  // 如果未登录，显示登录提示
  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '70vh' 
      }}>
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${getCurrentColors().primary}`,
            borderRadius: '16px',
            boxShadow: `0 8px 32px rgba(${getCurrentColors().primary.replace('#', '')}, 0.2)`,
            padding: '48px',
            textAlign: 'center'
          }}
        >
          <Title level={2} style={{ color: getCurrentColors().primary, marginBottom: '24px' }}>
            请先登录
          </Title>
          <Paragraph style={{ color: getCurrentColors().text, marginBottom: '32px' }}>
            访问管理后台需要先登录账号
          </Paragraph>
          <Button
            type="primary"
            icon={<LoginOutlined />}
            size="large"
            style={{
              background: `linear-gradient(135deg, ${getCurrentColors().primary}, ${getCurrentColors().secondary})`,
              border: 'none',
              padding: '10px 32px'
            }}
            onClick={() => navigate('/login')}
          >
            立即登录
          </Button>
        </Card>
      </div>
    );
  }
  
  // 如果不是管理员，显示权限不足提示
  if (user?.role !== 'admin') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '70vh' 
      }}>
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${getCurrentColors().primary}`,
            borderRadius: '16px',
            boxShadow: `0 8px 32px rgba(${getCurrentColors().primary.replace('#', '')}, 0.2)`,
            padding: '48px',
            textAlign: 'center'
          }}
        >
          <Title level={2} style={{ color: getCurrentColors().primary, marginBottom: '24px' }}>
            权限不足
          </Title>
          <Paragraph style={{ color: getCurrentColors().text, marginBottom: '32px' }}>
            只有管理员才能访问管理后台
          </Paragraph>
          <Button
            type="primary"
            size="large"
            style={{
              background: `linear-gradient(135deg, ${getCurrentColors().primary}, ${getCurrentColors().secondary})`,
              border: 'none',
              padding: '10px 32px'
            }}
            onClick={() => navigate('/')}
          >
            返回首页
          </Button>
        </Card>
      </div>
    );
  }

  // 获取所有用户
  const fetchAllUsers = async () => {
    setDataLoading(true);
    try {
      const response = await api.get<{ message: string; users: User[] }>('/api/users/all');
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
      message.success(`成功加载 ${response.data.users.length} 位用户`);
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      message.error(error.response?.data?.message || '获取用户列表失败');
    } finally {
      setDataLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // 搜索和筛选
  useEffect(() => {
    let result = users;

    // 文本搜索
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(lowerSearchText) ||
        user.email.toLowerCase().includes(lowerSearchText) ||
        user.studentId?.toLowerCase().includes(lowerSearchText) ||
        user.teacherId?.toLowerCase().includes(lowerSearchText) ||
        user.phone?.toLowerCase().includes(lowerSearchText)
      );
    }

    // 角色筛选
    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [searchText, roleFilter, users]);

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 80,
      render: (text: string) => <span style={{ fontSize: '12px', color: '#999' }}>{text.split('_')[1]}</span>,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => {
        const colors: Record<string, string> = {
          student: 'blue',
          teacher: 'green',
          counselor: 'purple',
          admin: 'red',
        };
        return <Tag color={colors[role]}>{roleMap[role] || role}</Tag>;
      },
    },
    {
      title: '学号/工号',
      key: 'idNumber',
      width: 140,
      render: (_, record) => record.studentId || record.teacherId || '-',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender?: string) => gender ? genderMap[gender] : '-',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80,
      render: (age?: number) => age || '-',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone?: string) => phone || '-',
    },
    {
      title: '年级/部门',
      key: 'organization',
      width: 140,
      render: (_, record) => record.grade || record.department || '-',
    },
    {
      title: '班级',
      dataIndex: 'class',
      key: 'class',
      width: 140,
      render: (classInfo?: string) => classInfo || '-',
    },
  ];

  // 统计数据
  const statistics = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    counselors: users.filter(u => u.role === 'counselor').length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: `2px solid ${getCurrentColors().primary}`,
          borderRadius: '16px',
          boxShadow: `0 8px 32px rgba(${getCurrentColors().primary.replace('#', '')}, 0.2)`,
        }}
      >
        {/* 页面标题 */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Title
            level={2}
            style={{
              color: getCurrentColors().primary,
              fontWeight: '700',
              marginBottom: '8px'
            }}
          >
            <TeamOutlined style={{ marginRight: '12px' }} />
            用户管理后台
          </Title>
          <Paragraph style={{ color: getCurrentColors().text, marginBottom: '0' }}>
            查看和管理所有注册用户信息
          </Paragraph>
        </div>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Statistic
              title="总用户数"
              value={statistics.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              style={{
                background: 'rgba(24, 144, 255, 0.1)',
                padding: '16px',
                borderRadius: '8px',
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="学生"
              value={statistics.students}
              valueStyle={{ color: '#52c41a' }}
              style={{
                background: 'rgba(82, 196, 26, 0.1)',
                padding: '16px',
                borderRadius: '8px',
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="教师"
              value={statistics.teachers}
              valueStyle={{ color: '#faad14' }}
              style={{
                background: 'rgba(250, 173, 20, 0.1)',
                padding: '16px',
                borderRadius: '8px',
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="心理咨询师"
              value={statistics.counselors}
              valueStyle={{ color: '#722ed1' }}
              style={{
                background: 'rgba(114, 46, 209, 0.1)',
                padding: '16px',
                borderRadius: '8px',
              }}
            />
          </Col>
        </Row>

        {/* 搜索和筛选 */}
        <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Space.Compact block>
              <Input
                placeholder="搜索姓名、邮箱、学号/工号、电话"
                allowClear
                size="large"
                style={{ width: 350 }}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={() => setSearchText(searchText)}
              >
                搜索
              </Button>
            </Space.Compact>
            <Select
              placeholder="筛选角色"
              allowClear
              size="large"
              style={{ width: 150 }}
              onChange={(value) => setRoleFilter(value)}
            >
              <Option value="student">学生</Option>
              <Option value="teacher">教师</Option>
              <Option value="counselor">心理咨询师</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Space>
          <Space>
            <span style={{ color: getCurrentColors().text }}>
              显示 {filteredUsers.length} / 共 {users.length} 位用户
            </span>
          </Space>
        </Space>

        {/* 用户表格 */}
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="_id"
          loading={dataLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            showQuickJumper: true,
          }}
          scroll={{ x: 1200 }}
          rowHoverable
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
          }}
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;
