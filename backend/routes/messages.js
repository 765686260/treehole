/**
 * 留言相关路由
 * 实现RESTful API接口
 */
const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// 创建Message实例
const messageModel = new Message();

/**
 * 统一响应格式
 * @param {boolean} success - 是否成功
 * @param {*} data - 响应数据
 * @param {string} message - 响应消息
 * @returns {Object}
 */
const createResponse = (success, data = null, message = '') => {
    return {
        success,
        data,
        message,
        timestamp: new Date().toISOString()
    };
};

/**
 * GET /api/messages
 * 获取所有留言
 */
router.get('/', async (req, res) => {
    try {
        console.log('📖 获取留言列表请求');
        const messages = await messageModel.getAllMessages();
        
        res.json(createResponse(true, messages, '获取留言列表成功'));
        console.log(`✅ 返回 ${messages.length} 条留言`);
        
    } catch (error) {
        console.error('❌ 获取留言失败:', error.message);
        res.status(500).json(createResponse(false, null, '服务器内部错误'));
    }
});

/**
 * POST /api/messages
 * 创建新留言
 */
router.post('/', async (req, res) => {
    try {
        const { content, nickname } = req.body;
        
        // 输入验证
        if (!content || typeof content !== 'string') {
            return res.status(400).json(createResponse(false, null, '留言内容不能为空'));
        }
        
        const trimmedContent = content.trim();
        if (trimmedContent.length === 0) {
            return res.status(400).json(createResponse(false, null, '留言内容不能为空'));
        }
        
        if (trimmedContent.length > 200) {
            return res.status(400).json(createResponse(false, null, '留言内容不能超过200字符'));
        }
        
        // 昵称验证
        let validNickname = '匿名用户';
        if (nickname && typeof nickname === 'string') {
            const trimmedNickname = nickname.trim();
            if (trimmedNickname.length > 0 && trimmedNickname.length <= 20) {
                validNickname = trimmedNickname;
            }
        }
        
        // 获取客户端IP
        const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
        
        console.log('📝 创建新留言:', `${validNickname}: ${trimmedContent.substring(0, 20)}...`);
        const newMessage = await messageModel.createMessage(trimmedContent, validNickname, clientIP);
        
        res.status(201).json(createResponse(true, newMessage, '留言发布成功'));
        console.log(`✅ 新留言创建成功，ID: ${newMessage.id}`);
        
    } catch (error) {
        console.error('❌ 创建留言失败:', error.message);
        res.status(500).json(createResponse(false, null, '服务器内部错误'));
    }
});

/**
 * DELETE /api/messages/:id
 * 删除指定留言
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // 参数验证
        const messageId = parseInt(id);
        if (isNaN(messageId) || messageId <= 0) {
            return res.status(400).json(createResponse(false, null, '无效的留言ID'));
        }
        
        console.log('🗑️ 删除留言请求, ID:', messageId);
        
        // 检查留言是否存在
        const existingMessage = await messageModel.getMessageById(messageId);
        if (!existingMessage) {
            return res.status(404).json(createResponse(false, null, '留言不存在'));
        }
        
        // 执行删除
        const deleted = await messageModel.deleteMessage(messageId);
        
        if (deleted) {
            res.json(createResponse(true, { id: messageId }, '留言删除成功'));
            console.log(`✅ 留言删除成功，ID: ${messageId}`);
        } else {
            res.status(500).json(createResponse(false, null, '删除失败'));
        }
        
    } catch (error) {
        console.error('❌ 删除留言失败:', error.message);
        res.status(500).json(createResponse(false, null, '服务器内部错误'));
    }
});

/**
 * GET /api/messages/:id
 * 获取指定留言（可选接口，用于调试）
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const messageId = parseInt(id);
        
        if (isNaN(messageId) || messageId <= 0) {
            return res.status(400).json(createResponse(false, null, '无效的留言ID'));
        }
        
        const message = await messageModel.getMessageById(messageId);
        
        if (message) {
            res.json(createResponse(true, message, '获取留言成功'));
        } else {
            res.status(404).json(createResponse(false, null, '留言不存在'));
        }
        
    } catch (error) {
        console.error('❌ 获取留言失败:', error.message);
        res.status(500).json(createResponse(false, null, '服务器内部错误'));
    }
});

/**
 * PUT /api/messages/:id/like
 * 点赞留言
 */
router.put('/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const messageId = parseInt(id);
        
        // 参数验证
        if (isNaN(messageId) || messageId <= 0) {
            return res.status(400).json(createResponse(false, null, '无效的留言ID'));
        }
        
        console.log('👍 点赞请求, ID:', messageId);
        
        // 执行点赞
        const updatedMessage = await messageModel.likeMessage(messageId);
        
        res.json(createResponse(true, updatedMessage, '点赞成功'));
        console.log(`✅ 点赞成功，ID: ${messageId}, 当前点赞数: ${updatedMessage.likes}`);
        
    } catch (error) {
        console.error('❌ 点赞失败:', error.message);
        if (error.message === '留言不存在') {
            res.status(404).json(createResponse(false, null, '留言不存在'));
        } else {
            res.status(500).json(createResponse(false, null, '服务器内部错误'));
        }
    }
});

module.exports = router;