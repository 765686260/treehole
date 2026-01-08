/* 
 * 树洞前端逻辑 (Bootstrap版)
 * 逻辑与之前完全一致，只是渲染出的 HTML 带有 Bootstrap 类名
 */

// 1. 模拟数据库数据
let msgData = [
    { id: 1, content: "这门课终于开始做项目了，有点期待！", time: "2025/11/26 09:30:00" },
    { id: 2, content: "今天食堂的红烧肉不错，推荐大家去尝尝。", time: "2025/11/26 12:15:00" },
    { id: 3, content: "Bootstrap 5 确实比手写 CSS 快多了！", time: "2025/11/26 14:20:00" }
];

// 2. 获取DOM元素
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const msgList = document.getElementById('msgList');
const charCount = document.getElementById('charCount');

// 3. 渲染函数 (更新为 Bootstrap 结构)
function renderMessages() {
    msgList.innerHTML = ''; 

    msgData.slice().reverse().forEach(msg => {
        // 创建外层 div (不再是 li，而是 div.card)
        const cardDiv = document.createElement('div');
        // Bootstrap 类名组合：
        // card: 卡片基础
        // mb-3: 下边距
        // shadow-sm: 小阴影
        // border-0: 去掉默认边框
        // border-start border-primary border-4: 左侧加粗蓝线 (保留设计感)
        cardDiv.className = 'card mb-3 shadow-sm border-0 border-start border-primary border-4 msg-card-animation';

        // 卡片内容
        cardDiv.innerHTML = `
            <div class="card-body py-3">
                <!-- 留言内容：text-break 防止长单词溢出 -->
                <p class="card-text text-break fs-6 mb-2">${escapeHtml(msg.content)}</p>
                
                <!-- 底部元数据：flex布局，两端对齐 -->
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">${msg.time}</small>
                    
                    <!-- 删除按钮：btn-sm 小按钮, btn-outline-danger 红框按钮 -->
                    <!-- btn-delete-hover 是我们在 style.css 里自定义的类 -->
                    <button class="btn btn-outline-danger btn-sm border-0 btn-delete-hover" 
                            onclick="deleteMessage(${msg.id})">
                        删除 🗑️
                    </button>
                </div>
            </div>
        `;

        msgList.appendChild(cardDiv);
    });
}

// 简单防注入转义函数 (XSS防御演示)
// 将 <script> 转义为 &lt;script&gt;
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 4. 发送留言功能
sendBtn.addEventListener('click', function() {
    const content = msgInput.value.trim();

    if (content.length === 0) {
        // 使用浏览器默认弹窗，或者以后可以用 Bootstrap Modal
        alert("请输入内容后再发送哦~");
        return;
    }

    // UI反馈：按钮变禁用
    const originalBtnText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> 发送中...';
    sendBtn.disabled = true;

    setTimeout(() => {
        const newMsg = {
            id: Date.now(),
            content: content,
            time: new Date().toLocaleString()
        };

        msgData.push(newMsg);

        // 重置界面
        msgInput.value = '';
        charCount.textContent = '0/200';
        charCount.className = 'text-muted small'; // 恢复颜色
        sendBtn.innerHTML = originalBtnText;
        sendBtn.disabled = false;

        renderMessages();
    }, 500);
});

// 5. 字数统计功能
msgInput.addEventListener('input', function() {
    const len = this.value.length;
    charCount.textContent = `${len}/200`;
    
    if(len >= 200) {
        // Bootstrap 类：text-danger (红色)
        charCount.className = 'text-danger small fw-bold';
    } else {
        // Bootstrap 类：text-muted (灰色)
        charCount.className = 'text-muted small';
    }
});

// 6. 删除功能
window.deleteMessage = function(id) {
    // 这里使用 confirm 是最简单的，Bootstrap Modal 稍微复杂点，
    // 教学初期保持 logic 简单为主。
    if(confirm("确定要删除这条树洞吗？")) {
        msgData = msgData.filter(item => item.id !== id);
        renderMessages();
    }
};

// --- 初始化 ---
renderMessages();