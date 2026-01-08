/**
 * 数据库初始化脚本
 * 创建messages表并插入示例数据
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'messages.db');

// 示例数据
const sampleMessages = [
    { content: "这门课终于开始做项目了，有点期待！", nickname: "学习达人" },
    { content: "今天食堂的红烧肉不错，推荐大家去尝尝。", nickname: "美食家" },
    { content: "Node.js + SQLite 的组合真的很适合小项目！", nickname: "技术控" },
    { content: "有人知道期末考试的具体时间吗？", nickname: "焦虑星人" }
];

// 创建messages表SQL
const createTableSQL = `
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        nickname TEXT DEFAULT '匿名用户',
        likes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT
    )
`;

// 异步初始化函数
async function initDatabase() {
    return new Promise((resolve, reject) => {
        // 创建数据库连接
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ 数据库连接失败:', err.message);
                reject(err);
                return;
            }
            console.log('✅ 成功连接到SQLite数据库');
        });

        db.serialize(() => {
            // 创建表
            db.run(createTableSQL, (err) => {
                if (err) {
                    console.error('❌ 创建表失败:', err.message);
                    db.close();
                    reject(err);
                    return;
                }
                console.log('✅ messages表创建成功');
            });

            // 检查是否已有数据
            db.get("SELECT COUNT(*) as count FROM messages", (err, row) => {
                if (err) {
                    console.error('❌ 查询数据失败:', err.message);
                    db.close();
                    reject(err);
                    return;
                }

                // 如果表为空，插入示例数据
                if (row.count === 0) {
                    console.log('📝 插入示例数据...');
                    const insertSQL = "INSERT INTO messages (content, nickname) VALUES (?, ?)";
                    
                    let insertedCount = 0;
                    const totalMessages = sampleMessages.length;
                    
                    sampleMessages.forEach((message, index) => {
                        db.run(insertSQL, [message.content, message.nickname], function(err) {
                            if (err) {
                                console.error('❌ 插入数据失败:', err.message);
                            } else {
                                console.log(`✅ 插入示例数据 ${index + 1}: ID ${this.lastID}`);
                            }
                            
                            insertedCount++;
                            
                            // 所有数据插入完成后关闭数据库
                            if (insertedCount === totalMessages) {
                                db.close((err) => {
                                    if (err) {
                                        console.error('❌ 关闭数据库失败:', err.message);
                                        reject(err);
                                    } else {
                                        console.log('✅ 数据库初始化完成，连接已关闭');
                                        resolve();
                                    }
                                });
                            }
                        });
                    });
                } else {
                    console.log(`📊 数据库已有 ${row.count} 条记录，跳过示例数据插入`);
                    // 关闭数据库连接
                    db.close((err) => {
                        if (err) {
                            console.error('❌ 关闭数据库失败:', err.message);
                            reject(err);
                        } else {
                            console.log('✅ 数据库初始化完成，连接已关闭');
                            resolve();
                        }
                    });
                }
            });
        });
    });
}

// 执行初始化
initDatabase()
    .then(() => {
        console.log('🎉 数据库初始化成功！');
        process.exit(0);
    })
    .catch((err) => {
        console.error('💥 数据库初始化失败:', err.message);
        process.exit(1);
    });