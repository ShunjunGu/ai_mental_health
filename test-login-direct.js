const http = require('http');

// 加载环境变量
require('dotenv').config();

// 测试登录API - 配置说明：
// 1. 请确保在项目根目录创建.env文件并添加以下环境变量：
//    TEST_EMAIL=your_test_email@example.com
//    TEST_PASSWORD=your_test_password
//    TEST_HOSTNAME=localhost
//    TEST_PORT=57215
// 2. 或者直接修改下面的配置值进行测试

// 从环境变量获取配置，如不存在则使用默认值
const email = process.env.TEST_EMAIL || 'your_test_email@example.com';
const password = process.env.TEST_PASSWORD || 'your_test_password';
const hostname = process.env.TEST_HOSTNAME || 'localhost';
const port = process.env.TEST_PORT || 57215;

// 测试登录API
const loginData = JSON.stringify({
  email: email,
  password: password
});

const options = {
  hostname: hostname,
  port: port,
  path: '/api/users/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('直接测试后端登录API...');
console.log(`测试配置：hostname=${hostname}, port=${port}, email=${email}`);
console.log('请求数据:', loginData);
console.log('请求URL:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => {
    rawData += chunk;
  });
  res.on('end', () => {
    console.log('响应头:', res.headers);
    try {
      const parsedData = JSON.parse(rawData);
      console.log('响应数据:', parsedData);
      if (res.statusCode === 200) {
        console.log('登录成功！');
        console.log('生成的token:', parsedData.token);
      } else {
        console.log('登录失败！');
      }
    } catch (e) {
      console.error('解析响应失败:', e.message);
      console.error('原始响应:', rawData);
    }
  });
});

req.on('error', (e) => {
  console.error(`请求错误: ${e.message}`);
});

req.write(loginData);
req.end();