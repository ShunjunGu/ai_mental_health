import React, { useState, useEffect, useContext } from 'react';
import { Card, Table, Typography, Input, Select, Tag, message, Row, Col, Statistic, Button, Spin, Space, Modal } from 'antd';
import { SearchOutlined, UserOutlined, TeamOutlined, LoginOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { EmotionContext, emotionToColors, emotionToColorsDark } from '../App';
import { useDarkMode } from '../contexts/DarkModeContext';
import { api } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
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
  const [classFilter, setClassFilter] = useState<string | undefined>();
  const [gradeFilter, setGradeFilter] = useState<string | undefined>();
  const [genderFilter, setGenderFilter] = useState<string | undefined>();
  // 移除用户相关状态
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { emotion } = useContext(EmotionContext);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  // 获取当前情绪对应的颜色
  const getCurrentColors = () => {
    const colorMap = isDarkMode ? emotionToColorsDark : emotionToColors;
    return colorMap[emotion.toLowerCase()] || (isDarkMode ? emotionToColorsDark.neutral : emotionToColors.neutral);
  };

  // 获取卡片背景色
  const getCardBackground = () => {
    return isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  };

  // 获取输入框背景色
  const getInputBackground = () => {
    return isDarkMode ? 'var(--bg-secondary)' : 'rgba(255, 255, 255, 0.95)';
  };

  // 获取输入框边框色
  const getInputBorderColor = () => {
    return isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
  };

  // 获取统计卡片背景色
  const getStatisticBackground = (color: string) => {
    if (isDarkMode) {
      return 'rgba(255, 255, 255, 0.05)';
    }
    return color;
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
            background: getCardBackground(),
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
          <Paragraph style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text, marginBottom: '32px' }}>
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
            background: getCardBackground(),
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
          <Paragraph style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text, marginBottom: '32px' }}>
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

  // 打开删除确认对话框
  const showDeleteConfirm = (user: User) => {
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };

  // 关闭删除确认对话框
  const handleCancel = () => {
    setDeleteModalVisible(false);
    setUserToDelete(null);
    setConfirmLoading(false);
  };

  // 确认删除用户
  const handleDelete = async () => {
    if (!userToDelete) return;

    setConfirmLoading(true);
    try {
      await api.delete(`/api/users/${userToDelete._id}`);
      message.success('用户删除成功');
      setDeleteModalVisible(false);
      // 重新获取用户列表
      await fetchAllUsers();
    } catch (error: any) {
      console.error('删除用户失败:', error);
      message.error(error.response?.data?.message || '删除用户失败');
    } finally {
      setConfirmLoading(false);
      setUserToDelete(null);
    }
  };

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

    // 班级筛选
    if (classFilter) {
      result = result.filter(user => user.class === classFilter);
    }

    // 年级筛选
    if (gradeFilter) {
      result = result.filter(user => user.grade === gradeFilter);
    }

    // 性别筛选
    if (genderFilter) {
      result = result.filter(user => user.gender === genderFilter);
    }

    setFilteredUsers(result);
  }, [searchText, roleFilter, classFilter, gradeFilter, genderFilter, users]);

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 80,
      render: (text: string) => <span style={{ fontSize: '12px', color: isDarkMode ? '#808080' : '#999' }}>{text.split('_')[1]}</span>,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string) => <strong style={{ color: isDarkMode ? '#e0e0e0' : 'inherit' }}>{text}</strong>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
      render: (text: string) => <span style={{ color: isDarkMode ? '#b0b0b0' : 'inherit' }}>{text}</span>,
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
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => {
        // 判断是否可以删除该用户
        // 1. 不能删除自己
        // 2. 普通管理员不能删除管理员账号
        // 3. 超级管理员（superadmin@test.edu.cn）可以删除管理员账号，但不能删除其他超级管理员
        const isCurrentUserSuperAdmin = user?.email === 'superadmin@test.edu.cn';
        const isUserToDeleteSuperAdmin = record.email === 'superadmin@test.edu.cn';
        const canDelete = 
          record._id !== user?._id && 
          (record.role !== 'admin' || 
           (isCurrentUserSuperAdmin && !isUserToDeleteSuperAdmin));
        
        return (
          <Space size="middle">
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
              disabled={!canDelete}
              title={!canDelete ? (
                record._id === user?._id ? '不能删除自己的账号' :
                record.email === 'superadmin@test.edu.cn' ? '不能删除其他超级管理员' :
                '只有超级管理员才能删除管理员账号'
              ) : ''}
            >
              移除
            </Button>
          </Space>
        );
      },
    },
  ];

  // 统计数据
  const statistics = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        style={{
          background: getCardBackground(),
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
          <Paragraph style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text, marginBottom: '0' }}>
            查看和管理所有注册用户信息
          </Paragraph>
        </div>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: isDarkMode ? '#b0b0b0' : 'inherit' }}>总用户数</span>}
              value={statistics.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              style={{
                background: getStatisticBackground('rgba(24, 144, 255, 0.1)'),
                padding: '16px',
                borderRadius: '8px',
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: isDarkMode ? '#b0b0b0' : 'inherit' }}>学生</span>}
              value={statistics.students}
              valueStyle={{ color: '#52c41a' }}
              style={{
                background: getStatisticBackground('rgba(82, 196, 26, 0.1)'),
                padding: '16px',
                borderRadius: '8px',
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: isDarkMode ? '#b0b0b0' : 'inherit' }}>教师</span>}
              value={statistics.teachers}
              valueStyle={{ color: '#faad14' }}
              style={{
                background: getStatisticBackground('rgba(250, 173, 20, 0.1)'),
                padding: '16px',
                borderRadius: '8px',
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: isDarkMode ? '#b0b0b0' : 'inherit' }}>管理员</span>}
              value={statistics.admins}
              valueStyle={{ color: '#ff4d4f' }}
              style={{
                background: getStatisticBackground('rgba(255, 77, 79, 0.1)'),
                padding: '16px',
                borderRadius: '8px',
              }}
            />
          </Col>
        </Row>

        {/* 搜索和筛选 */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
            <Input.Search
              placeholder="搜索姓名、邮箱、学号/工号、电话"
              allowClear
              size="large"
              style={{
                width: 450,
                maxWidth: '100%',
                background: getInputBackground(),
                borderColor: getInputBorderColor()
              }}
              onSearch={() => setSearchText(searchText)}
              onChange={(e) => setSearchText(e.target.value)}
              enterButton={
                <Button type="primary" size="large" icon={<SearchOutlined />}>
                  搜索
                </Button>
              }
            />
            <Select
              placeholder="筛选角色"
              allowClear
              size="large"
              style={{
                width: 150,
                background: getInputBackground()
              }}
              onChange={(value) => setRoleFilter(value)}
            >
              <Option value="student">学生</Option>
              <Option value="teacher">教师</Option>
              <Option value="admin">管理员</Option>
            </Select>
            <Select
              placeholder="筛选性别"
              allowClear
              size="large"
              style={{
                width: 150,
                background: getInputBackground()
              }}
              onChange={(value) => setGenderFilter(value)}
            >
              <Option value="male">男</Option>
              <Option value="female">女</Option>
              <Option value="other">其他</Option>
            </Select>
            <Select
              placeholder="筛选年级"
              allowClear
              size="large"
              style={{
                width: 150,
                background: getInputBackground()
              }}
              onChange={(value) => setGradeFilter(value)}
            >
              {Array.from(new Set(users.filter(u => u.grade).map(u => u.grade))).map(grade => (
                <Option key={grade} value={grade}>{grade}</Option>
              ))}
            </Select>
            <Select
              placeholder="筛选班级"
              allowClear
              size="large"
              style={{
                width: 150,
                background: getInputBackground()
              }}
              onChange={(value) => setClassFilter(value)}
            >
              {Array.from(new Set(users.filter(u => u.class).map(u => u.class))).map(className => (
                <Option key={className} value={className}>{className}</Option>
              ))}
            </Select>
          </div>
          <span style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text, whiteSpace: 'nowrap' }}>
            显示 {filteredUsers.length} / 共 {users.length} 位用户
          </span>
        </div>

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
            background: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
          }}
        />

        {/* 删除确认对话框 */}
        <Modal
          title="确认删除"
          open={deleteModalVisible}
          onOk={handleDelete}
          confirmLoading={confirmLoading}
          onCancel={handleCancel}
          okText="确认"
          cancelText="取消"
          okButtonProps={{
            danger: true,
          }}
          style={{
            borderRadius: '16px',
          }}
          bodyStyle={{
            background: getCardBackground(),
            borderBottom: `1px solid ${getInputBorderColor()}`,
          }}
          headerStyle={{
            background: getCardBackground(),
            borderBottom: `1px solid ${getInputBorderColor()}`,
            borderRadius: '16px 16px 0 0',
          }}
          footerStyle={{
            background: getCardBackground(),
            borderTop: `1px solid ${getInputBorderColor()}`,
            borderRadius: '0 0 16px 16px',
          }}
        >
          {userToDelete && (
            <div>
              <p style={{ marginBottom: '16px' }}>确定要删除用户 <strong>{userToDelete.name}</strong> 吗？</p>
              <p style={{ marginBottom: '0', color: '#ff4d4f' }}>此操作不可恢复，请谨慎操作！</p>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default AdminDashboard;
