/* 
 * 树洞前端逻辑 V2.0 - API版本
 * 连接Node.js后端，实现真正的数据持久化
 */

// 1. 配置项
const API_BASE_URL = '/api'; // API基础路径
const ENDPOINTS = {
    messages: `${API_BASE_URL}/messages`
};

// 2. 获取DOM元素
const msgInput = document.getElementById('msgInput');
const nicknameInput = document.getElementById('nicknameInput');
const sendBtn = document.getElementById('sendBtn');
const msgList = document.getElementById('msgList');
const charCount = document.getElementById('charCount');
const nicknameCount = document.getElementById('nicknameCount');
const apiStatus = document.getElementById('apiStatus');
const refreshBtn = document.getElementById('refreshBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const errorTips = document.getElementById('errorTips');

// 3. 状态管理
let isLoading = false;
let isSubmitting = false;

/**
 * 更新API连接状态显示
 * @param {string} status - 状态: 'connecting' | 'connected' | 'error'
 * @param {string} message - 状态消息
 */
function updateApiStatus(status, message) {
    const statusMap = {
        connecting: { icon: '🔄', color: '#888', text: message || '连接中...' },
        connected: { icon: '✅', color: '#4a90e2', text: message || 'API连接正常' },
        error: { icon: '❌', color: '#e74c3c', text: message || '连接失败' }
    };
    
    const config = statusMap[status];
    if (config) {
        apiStatus.innerHTML = `${config.icon} ${config.text}`;
        apiStatus.style.color = config.color;
    }
}

/**
 * 显示/隐藏加载状态
 * @param {boolean} show - 是否显示
 */
function toggleLoading(show) {
    isLoading = show;
    loadingIndicator.style.display = show ? 'flex' : 'none';
    errorMessage.style.display = 'none';
}

/**
 * HTML转义函数，防止XSS攻击
 * @param {string} text - 需要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 显示输入错误提示
 * @param {string} message - 错误消息
 */
function showInputError(message) {
    errorTips.textContent = message;
    errorTips.style.display = 'block';
    errorTips.className = 'error-tips show';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        errorTips.className = 'error-tips';
        setTimeout(() => {
            errorTips.style.display = 'none';
        }, 300);
    }, 3000);
}

/**
 * 隐藏输入错误提示
 */
function hideInputError() {
    errorTips.className = 'error-tips';
    setTimeout(() => {
        errorTips.style.display = 'none';
    }, 300);
}

/**
 * HTTP请求封装
 * @param {string} url - 请求URL
 * @param {Object} options - 请求选项
 * @returns {Promise<Object>}
 */
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API请求失败:', error);
        throw error;
    }
}

/**
 * 获取所有留言
 */
async function loadMessages() {
    if (isLoading) return;
    
    try {
        toggleLoading(true);
        updateApiStatus('connecting', '获取留言中...');
        
        const response = await apiRequest(ENDPOINTS.messages);
        
        if (response.success) {
            renderMessages(response.data);
            updateApiStatus('connected', `已加载 ${response.data.length} 条留言`);
        } else {
            throw new Error(response.message);
        }
        
    } catch (error) {
        console.error('获取留言失败:', error);
        showError(`获取留言失败: ${error.message}`);
        updateApiStatus('error', '获取失败');
    } finally {
        toggleLoading(false);
    }
}

/**
 * 显示错误信息
 * @param {string} message - 错误消息
 */
function showError(message) {
    loadingIndicator.style.display = 'none';
    errorMessage.style.display = 'flex';
    errorMessage.querySelector('.error-text').textContent = message;
}

/**
 * 渲染留言列表
 * @param {Array} messages - 留言数组
 */
function renderMessages(messages) {
    msgList.innerHTML = '';
    
    if (messages.length === 0) {
        msgList.innerHTML = `
            <li class="empty-state">
                <div class="empty-icon">💭</div>
                <div class="empty-text">还没有留言，来发布第一条吧！</div>
            </li>
        `;
        return;
    }
    
    messages.forEach(msg => {
        const li = document.createElement('li');
        li.className = 'message-card';
        li.setAttribute('data-id', msg.id);

        // 安全地处理内容
        const divContent = document.createElement('div');
        divContent.className = 'msg-content';
        divContent.textContent = msg.content;

        // 创建用户信息区
        const divUser = document.createElement('div');
        divUser.className = 'msg-user';
        divUser.innerHTML = `
            <span class="nickname">${escapeHtml(msg.nickname || '匿名用户')}</span>
            <span class="time">${msg.time}</span>
        `;

        // 创建交互区（点赞和删除）
        const divActions = document.createElement('div');
        divActions.className = 'msg-actions';
        divActions.innerHTML = `
            <button class="btn-like ${msg.likes > 0 ? 'liked' : ''}" onclick="likeMessage(${msg.id})" data-likes="${msg.likes}">
                👍 <span class="like-count">${msg.likes}</span>
            </button>
            <button class="btn-delete" onclick="deleteMessage(${msg.id})">删除</button>
        `;

        li.appendChild(divContent);
        li.appendChild(divUser);
        li.appendChild(divActions);
        msgList.appendChild(li);
    });
}

/**
 * 输入验证函数
 * @returns {Object} 验证结果
 */
function validateInput() {
    const content = msgInput.value.trim();
    const nickname = nicknameInput.value.trim();
    
    // 内容验证
    if (content.length === 0) {
        return { valid: false, message: '请输入留言内容后再发送！' };
    }
    
    if (content.length > 200) {
        return { valid: false, message: '留言内容不能超过200字符！' };
    }
    
    // 昵称验证
    if (nickname.length > 20) {
        return { valid: false, message: '昵称不能超过20字符！' };
    }
    
    return { valid: true, content, nickname: nickname || '匿名用户' };
}

/**
 * 发送新留言
 */
async function sendMessage() {
    if (isSubmitting) return;
    
    // 输入验证
    const validation = validateInput();
    if (!validation.valid) {
        showInputError(validation.message);
        return;
    }
    
    try {
        isSubmitting = true;
        hideInputError();
        
        // UI反馈
        const originalText = sendBtn.textContent;
        sendBtn.textContent = '发送中...';
        sendBtn.disabled = true;
        
        updateApiStatus('connecting', '发送留言中...');
        
        const response = await apiRequest(ENDPOINTS.messages, {
            method: 'POST',
            body: JSON.stringify({ 
                content: validation.content,
                nickname: validation.nickname 
            })
        });
        
        if (response.success) {
            // 重置输入框
            msgInput.value = '';
            nicknameInput.value = '';
            charCount.textContent = '0/200';
            nicknameCount.textContent = '0/20';
            charCount.style.color = '#888';
            
            // 重新加载留言列表
            await loadMessages();
            
            updateApiStatus('connected', '发送成功');
            
            // 滚动到顶部显示新留言
            msgList.scrollIntoView({ behavior: 'smooth' });
            
        } else {
            throw new Error(response.message);
        }
        
    } catch (error) {
        console.error('发送留言失败:', error);
        showInputError(`发送失败: ${error.message}`);
        updateApiStatus('error', '发送失败');
    } finally {
        isSubmitting = false;
        sendBtn.textContent = '发送留言';
        sendBtn.disabled = false;
    }
}

/**
 * 点赞留言
 * @param {number} id - 留言ID
 */
window.likeMessage = async function(id) {
    try {
        updateApiStatus('connecting', '点赞中...');
        
        const response = await apiRequest(`${ENDPOINTS.messages}/${id}/like`, {
            method: 'PUT'
        });
        
        if (response.success) {
            // 更新点赞按钮显示
            const likeBtn = document.querySelector(`[data-id="${id}"] .btn-like`);
            const likeCount = likeBtn.querySelector('.like-count');
            
            if (likeBtn && likeCount) {
                likeCount.textContent = response.data.likes;
                likeBtn.classList.add('liked');
                
                // 添加点赞动画
                likeBtn.style.animation = 'likeAnimation 0.6s ease';
                setTimeout(() => {
                    likeBtn.style.animation = '';
                }, 600);
            }
            
            updateApiStatus('connected', '点赞成功');
            
        } else {
            throw new Error(response.message);
        }
        
    } catch (error) {
        console.error('点赞失败:', error);
        showInputError(`点赞失败: ${error.message}`);
        updateApiStatus('error', '点赞失败');
    }
};

/**
 * 删除留言
 * @param {number} id - 留言ID
 */
window.deleteMessage = async function(id) {
    if (!confirm("确定要删除这条树洞吗？")) {
        return;
    }
    
    try {
        updateApiStatus('connecting', '删除中...');
        
        const response = await apiRequest(`${ENDPOINTS.messages}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            // 从DOM中移除元素（优化用户体验）
            const messageElement = document.querySelector(`[data-id="${id}"]`);
            if (messageElement) {
                messageElement.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    messageElement.remove();
                }, 300);
            }
            
            updateApiStatus('connected', '删除成功');
            
            // 延迟重新加载以确保数据同步
            setTimeout(() => loadMessages(), 500);
            
        } else {
            throw new Error(response.message);
        }
        
    } catch (error) {
        console.error('删除留言失败:', error);
        showInputError(`删除失败: ${error.message}`);
        updateApiStatus('error', '删除失败');
    }
};

/**
 * 字数统计功能
 */
msgInput.addEventListener('input', function() {
    const len = this.value.length;
    charCount.textContent = `${len}/200`;
    
    if (len >= 200) {
        charCount.style.color = 'red';
    } else if (len >= 180) {
        charCount.style.color = 'orange';
    } else {
        charCount.style.color = '#888';
    }
});

/**
 * 昵称字数统计
 */
nicknameInput.addEventListener('input', function() {
    const len = this.value.length;
    nicknameCount.textContent = `${len}/20`;
    
    if (len >= 20) {
        nicknameCount.style.color = 'red';
    } else if (len >= 18) {
        nicknameCount.style.color = 'orange';
    } else {
        nicknameCount.style.color = '#888';
    }
});

/**
 * 事件监听器
 */
// 发送按钮点击
sendBtn.addEventListener('click', sendMessage);

// 回车键发送（Ctrl+Enter）
msgInput.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        sendMessage();
    }
});

// 刷新按钮
refreshBtn.addEventListener('click', loadMessages);

// 重试按钮
retryBtn.addEventListener('click', loadMessages);

/**
 * 检查API连接状态
 */
async function checkApiConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}`);
        if (response.ok) {
            updateApiStatus('connected');
            return true;
        } else {
            throw new Error('API响应异常');
        }
    } catch (error) {
        updateApiStatus('error', 'API连接失败');
        return false;
    }
}

/**
 * 初始化应用
 */
async function initApp() {
    console.log('🌲 树洞 V2.0 前端初始化...');
    
    // 检查API连接
    const apiConnected = await checkApiConnection();
    
    if (apiConnected) {
        // 加载初始数据
        await loadMessages();
    } else {
        showError('无法连接到服务器，请检查后端是否启动');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);

// 页面可见性变化时刷新数据（用户切回页面时）
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !isLoading) {
        loadMessages();
    }
});