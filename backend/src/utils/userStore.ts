import fs from 'fs';
import path from 'path';

// 用户接口定义
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  studentId?: string;
  teacherId?: string;
  phone: string;
  gender: string;
  age: number;
  grade?: string;
  class?: string;
  department?: string;
  avatar?: string;
  comparePassword?: (password: string) => Promise<boolean>;
}

// 文件存储路径
const usersFilePath = path.join(__dirname, '../../data/users.json');

// 确保数据目录存在
const ensureDataDir = () => {
  const dataDir = path.dirname(usersFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// 读取用户数据
const readUsersFromFile = (): IUser[] => {
  ensureDataDir();
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('读取用户数据失败:', error);
    return [];
  }
};

// 写入用户数据
const writeUsersToFile = (users: IUser[]): void => {
  ensureDataDir();
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('写入用户数据失败:', error);
  }
};

// 从文件加载用户数据
let memoryUsers: IUser[] = readUsersFromFile();

// 导出用户存储操作
export const userStore = {
  // 获取所有用户
  getAllUsers: (): IUser[] => {
    return memoryUsers;
  },

  // 根据ID查找用户
  findUserById: (userId: string): IUser | undefined => {
    return memoryUsers.find(user => user._id === userId);
  },

  // 根据邮箱查找用户
  findUserByEmail: (email: string): IUser | undefined => {
    return memoryUsers.find(user => user.email === email);
  },

  // 添加用户
  addUser: (user: IUser): void => {
    memoryUsers.push(user);
    writeUsersToFile(memoryUsers);
  },

  // 更新用户
  updateUser: (userId: string, updatedUser: Partial<IUser>): boolean => {
    const index = memoryUsers.findIndex(user => user._id === userId);
    if (index === -1) {
      return false;
    }
    memoryUsers[index] = { ...memoryUsers[index], ...updatedUser };
    writeUsersToFile(memoryUsers);
    return true;
  },

  // 删除用户
  deleteUser: (userId: string): boolean => {
    const index = memoryUsers.findIndex(user => user._id === userId);
    if (index === -1) {
      return false;
    }
    memoryUsers.splice(index, 1);
    writeUsersToFile(memoryUsers);
    return true;
  },

  // 重新加载用户数据（从文件）
  reloadUsers: (): void => {
    memoryUsers = readUsersFromFile();
  },

  // 检查用户是否存在
  userExists: (userId: string): boolean => {
    return memoryUsers.some(user => user._id === userId);
  }
};
