# 🌲 班级树洞 V2.0

> Node.js + SQLite 全栈匿名留言板

## 项目简介

这是一个基于 Node.js + Express + SQLite 的全栈树洞应用，支持匿名留言发布、实时数据同步和RESTful API接口。从V1.0的纯前端版本升级而来，实现了真正的数据持久化。

## 技术栈

### 后端
- **Node.js** - JavaScript运行环境
- **Express.js** - Web应用框架
- **SQLite3** - 轻量级数据库
- **CORS** - 跨域资源共享
- **Body-Parser** - 请求体解析

### 前端
- **HTML5** - 语义化标签
- **CSS3** - 现代样式特性
- **JavaScript ES6+** - 原生JS + Fetch API
- **响应式设计** - 移动端适配

## 项目结构

```
tree-hole-v2/
├── backend/                 # 后端代码
│   ├── server.js           # 主服务器文件
│   ├── package.json        # 依赖配置
│   ├── database/
│   │   ├── init.js         # 数据库初始化脚本
│   │   └── messages.db     # SQLite数据库文件
│   ├── models/
│   │   └── Message.js      # 数据模型
│   └── routes/
│       └── messages.js     # API路由
├── frontend/               # 前端代码
│   ├── index.html         # 主页面
│   ├── script.js          # 前端逻辑
│   └── style.css          # 样式文件
└── README.md              # 项目说明
```

## 快速开始

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 完整启动流程

#### 第一步：安装后端依赖
```bash
# 进入后端目录
cd backend

# 安装依赖包
npm install
```

#### 第二步：初始化数据库
```bash
# 在backend目录下执行
npm run init-db
```
执行成功后会看到类似输出：
```
✅ 成功连接到SQLite数据库
✅ messages表创建成功
📝 插入示例数据...
✅ 插入示例数据 1: ID 1
✅ 插入示例数据 2: ID 2
✅ 插入示例数据 3: ID 3
✅ 插入示例数据 4: ID 4
✅ 数据库初始化完成，连接已关闭
```

#### 第三步：启动后端服务器
```bash
# 生产模式启动
npm start

# 或开发模式启动（推荐，支持热重载）
npm run dev
```

启动成功后会看到：
```
🌲 ================================
🌲  班级树洞 V2.0 服务器启动成功!
🌲 ================================
🚀 服务器地址: http://localhost:3000
📡 API地址: http://localhost:3000/api
📊 数据库: SQLite (backend/database/messages.db)
🌲 ================================
✅ 数据库连接正常
```

#### 第四步：访问应用
打开浏览器访问: `http://localhost:3000`

### 开发模式启动（推荐）

如果你要进行开发，建议使用开发模式：

```bash
# 安装开发依赖（如果还没安装）
cd backend
npm install -g nodemon

# 启动开发模式
npm run dev
```

开发模式的优势：
- 代码修改后自动重启服务器
- 实时查看日志输出
- 便于调试和开发

### 验证安装

#### 1. 验证后端API
在浏览器中访问 `http://localhost:3000/api`，应该看到API信息：
```json
{
  "name": "班级树洞 API",
  "version": "2.0.0",
  "description": "Node.js + SQLite RESTful API",
  "endpoints": {
    "GET /api/messages": "获取所有留言",
    "POST /api/messages": "创建新留言",
    "DELETE /api/messages/:id": "删除指定留言",
    "GET /api/messages/:id": "获取指定留言"
  }
}
```

#### 2. 验证前端功能
- 页面正常加载
- 可以发布留言
- 可以点赞留言
- 可以删除留言
- API状态显示"连接正常"

### 常见问题解决

#### 问题1：端口被占用
```
Error: listen EADDRINUSE: address already in use :::3000
```
**解决方案**：
```bash
# 查找占用3000端口的进程
netstat -ano | findstr :3000  # Windows
lsof -ti:3000                 # macOS/Linux

# 杀死进程或更改端口
set PORT=3001 && npm start    # Windows
PORT=3001 npm start           # macOS/Linux
```

#### 问题2：SQLite安装失败
```
Error: Cannot find module 'sqlite3'
```
**解决方案**：
```bash
# 重新安装sqlite3
npm uninstall sqlite3
npm install sqlite3 --build-from-source

# 如果还是失败，尝试全局安装构建工具
npm install -g windows-build-tools  # Windows
```

#### 问题3：数据库文件不存在
```
❌ 数据库未初始化，请运行: npm run init-db
```
**解决方案**：
```bash
cd backend
npm run init-db
```

#### 问题4：前端无法连接后端
- 确保后端服务器正在运行
- 检查浏览器控制台是否有错误
- 确认访问的是 `http://localhost:3000` 而不是直接打开HTML文件

### 项目结构说明
```
tree-hole-v2/
├── backend/                 # 后端服务器
│   ├── server.js           # 启动这个文件
│   ├── database/
│   │   └── messages.db     # 自动生成的数据库文件
│   └── ...
├── frontend/               # 前端文件（由后端服务器提供）
│   ├── index.html         # 主页面
│   ├── script.js          # 前端逻辑
│   └── style.css          # 样式文件
└── README.md
```

### 下一步
- 尝试发布留言测试功能
- 查看浏览器开发者工具了解API调用
- 修改代码体验热重载功能

## API接口文档

### 基础信息
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`

### 接口列表

#### 1. 获取所有留言
```http
GET /api/messages
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "这是一条留言",
      "time": "2023-11-26 14:30:00"
    }
  ],
  "message": "获取留言列表成功",
  "timestamp": "2023-11-26T06:30:00.000Z"
}
```

#### 2. 创建新留言
```http
POST /api/messages
Content-Type: application/json

{
  "content": "留言内容"
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "content": "留言内容",
    "time": "2023-11-26 14:35:00"
  },
  "message": "留言发布成功",
  "timestamp": "2023-11-26T06:35:00.000Z"
}
```

#### 3. 删除留言
```http
DELETE /api/messages/:id
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 2
  },
  "message": "留言删除成功",
  "timestamp": "2023-11-26T06:40:00.000Z"
}
```

#### 4. 获取单条留言
```http
GET /api/messages/:id
```

## 数据库设计

### messages表结构

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 主键ID | PRIMARY KEY, AUTOINCREMENT |
| content | TEXT | 留言内容 | NOT NULL |
| created_at | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| ip_address | TEXT | IP地址 | 可选 |

## 功能特性

### ✅ 已实现功能
- [x] 匿名留言发布
- [x] 留言列表展示
- [x] 留言删除功能
- [x] 实时字数统计
- [x] 数据持久化存储
- [x] RESTful API接口
- [x] 响应式设计
- [x] 错误处理机制
- [x] 加载状态提示
- [x] API连接状态监控

### 🚀 待扩展功能
- [ ] 用户身份管理
- [ ] 留言点赞功能
- [ ] 留言回复功能
- [ ] 内容审核机制
- [ ] 实时推送通知
- [ ] 数据分页加载
- [ ] 留言搜索功能
- [ ] 管理员后台

## 开发说明

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 开发工具推荐
- VS Code
- Postman (API测试)
- SQLite Browser (数据库查看)

### 代码规范
- 使用ES6+语法
- 统一的错误处理
- 详细的注释说明
- RESTful API设计原则

## 部署指南

### 本地部署
1. 克隆项目
2. 安装依赖: `npm install`
3. 初始化数据库: `npm run init-db`
4. 启动服务: `npm start`

### 生产部署
1. 设置环境变量 `NODE_ENV=production`
2. 配置反向代理 (Nginx)
3. 使用进程管理器 (PM2)
4. 定期备份数据库

## 学习价值

这个项目适合作为Web开发课程的实践案例，涵盖了：

1. **前端技术**: DOM操作、事件处理、Fetch API
2. **后端技术**: Express框架、中间件、路由设计
3. **数据库**: SQLite操作、SQL语句
4. **API设计**: RESTful规范、统一响应格式
5. **工程化**: 项目结构、错误处理、代码规范

## 版本历史

- **V1.0** - 纯前端版本，内存存储
- **V2.0** - 全栈版本，Node.js + SQLite

## 贡献指南

欢迎提交Issue和Pull Request来改进项目！

## 许可证

MIT License

---

**课程**: 信管专业《Web开发技术》  
**作者**: 课程实践项目  
**更新**: 2023年11月