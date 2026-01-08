/* 
 * 树洞前端逻辑演示版 
 * 注意：当前数据存储在浏览器的内存中（msgData数组），
 * 刷新页面后数据会重置。后续课程我们将连接 Node.js 后端。
 */
// 1. 模拟数据库数据 (Mock Data)
let msgData = [
    { id: 1, content: "这门课终于开始做项目了，有点期待！", time: "2025/11/26 09:30:00" },
    { id: 2, content: "今天食堂的红烧肉不错，推荐大家去尝尝。", time: "2025/11/26 12:15:00" },
    { id: 3, content: "有人知道期末考试的具体时间吗？", time: "2025/11/26 14:20:00" }
];

// 2. 获取DOM元素
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const msgList = document.getElementById('msgList');
const charCount = document.getElementById('charCount');

// 3. 渲染函数：把数据变成HTML (核心知识点)
function renderMessages() {
    msgList.innerHTML = ''; 
    // 清空当前列表
    // 倒序遍历（新消息在上面）
    // Slice()是为了复制一份数组，防止reverse影响原数组
    msgData.slice().reverse().forEach(msg => {
        // 创建卡片容器
        const li = document.createElement('li');
        li.className = 'message-card';

        // 安全地处理内容 (防XSS攻击的伏笔)
        // 使用 textContent 而不是 innerHTML
        const divContent = document.createElement('div');
        divContent.className = 'msg-content';
        divContent.textContent = msg.content; 

        // 创建元数据区 (时间 + 删除按钮)
        const divMeta = document.createElement('div');
        divMeta.className = 'msg-meta';
        divMeta.innerHTML = `
            <span class="time">${msg.time}</span>
            <button class="btn-delete" onclick="deleteMessage(${msg.id})">删除</button>
        `;

        // 组装
        li.appendChild(divContent);
        li.appendChild(divMeta);
        msgList.appendChild(li);
    });
}

// 4. 发送留言功能
sendBtn.addEventListener('click', function() {
    const content = msgInput.value.trim();

    // 简单校验
    if (content.length === 0) {
        alert("请输入内容后再发送哦~");
        return;
    }

    // 模拟向服务器发送请求的延迟 (UI反馈)
    sendBtn.textContent = '发送中...';
    sendBtn.disabled = true;

    setTimeout(() => {
        // 构建新数据对象
        const newMsg = {
            id: Date.now(), // 用时间戳模拟唯一ID
            content: content,
            time: new Date().toLocaleString() // 获取当前时间字符串
        };

        // 存入“数据库” (第4周时这里将变成 fetch POST)
        msgData.push(newMsg);

        // 重置界面
        msgInput.value = '';
        charCount.textContent = '0/200';
        sendBtn.textContent = '发送留言 🚀';
        sendBtn.disabled = false;

        // 重新渲染
        renderMessages();
    }, 500); // 假装延迟0.5秒
});

// 5. 字数统计功能 (提升用户体验的小细节)
msgInput.addEventListener('input', function() {
    const len = this.value.length;
    charCount.textContent = `${len}/200`;
    if(len >= 200) {
        charCount.style.color = 'red';
    } else {
        charCount.style.color = '#888';
    }
});

// 6. 删除功能 (全局函数，以便HTML中的onclick调用)
window.deleteMessage = function(id) {
    if(confirm("确定要删除这条树洞吗？")) {
        // 从数组中过滤掉该ID的数据 (后续这里将变成 fetch DELETE)
        msgData = msgData.filter(item => item.id !== id);
        renderMessages();
    }
};

// --- 初始化 ---// 页面加载完成后，先渲染一次现有的数据
renderMessages();