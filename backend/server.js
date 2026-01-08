/**
 * 树洞 V2.0 主服务器
 * Node.js + Express + SQLite
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// 导入路由
const messagesRouter = require('./routes/messages');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// Render部署配置
if (process.env.NODE_ENV === 'production') {
    // 生产环境下自动初始化数据库
    const initDb = require('./database/init');
}

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(bodyParser.json()); // 解析JSON请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析URL编码请求体

// 信任代理（用于获取真实IP）
app.set('trust proxy', true);

// 请求日志中间件
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

// 静态文件服务（提供前端文件）
app.use(express.static(path.join(__dirname, '../frontend')));

// API路由
app.use('/api/messages', messagesRouter);

// 根路径重定向到前端页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API根路径 - 服务器信息
app.get('/api', (req, res) => {
    res.json({
        name: '班级树洞 API',
        version: '2.0.0',
        description: 'Node.js + SQLite RESTful API',
        status: 'running',
        endpoints: {
            'GET /api/messages': '获取所有留言',
            'POST /api/messages': '创建新留言',
            'DELETE /api/messages/:id': '删除指定留言',
            'GET /api/messages/:id': '获取指定留言'
        },
        timestamp: new Date().toISOString()
    });
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString() 
    });
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在',
        path: req.originalUrl
    });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
    console.error('💥 服务器错误:', err.stack);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 检查数据库是否存在
const dbPath = path.join(__dirname, 'database/messages.db');
if (!fs.existsSync(dbPath)) {
    console.log('⚠️  数据库文件不存在，请先运行: npm run init-db');
}

// 启动服务器
app.listen(PORT, () => {
    console.log('================================');
    console.log('  班级树洞 V2.0 服务器启动成功!');
    console.log('================================');
    console.log(`服务器地址: http://localhost:${PORT}`);
    console.log(`API地址: http://localhost:${PORT}/api`);
    console.log(`数据库: SQLite (${dbPath})`);
    console.log('================================');
    
    // 检查数据库状态
    if (fs.existsSync(dbPath)) {
        console.log('✅ 数据库连接正常');
    } else {
        console.log('❌ 数据库未初始化，请运行: npm run init-db');
    }
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});

module.exports = app;