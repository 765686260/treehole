/**
 * Message数据模型
 * 封装留言相关的数据库操作
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Message {
    constructor() {
        // 数据库文件路径
        this.dbPath = path.join(__dirname, '../database/messages.db');
    }

    /**
     * 获取数据库连接
     * @returns {Promise<sqlite3.Database>}
     */
    getConnection() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(db);
                }
            });
        });
    }

    /**
     * 获取所有留言（按时间倒序）
     * @returns {Promise<Array>}
     */
    async getAllMessages() {
        const db = await this.getConnection();
        
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, content, nickname, likes,
                       datetime(created_at, 'localtime') as time
                FROM messages 
                ORDER BY created_at DESC
            `;
            
            db.all(sql, [], (err, rows) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 创建新留言
     * @param {string} content - 留言内容
     * @param {string} nickname - 用户昵称
     * @param {string} ipAddress - IP地址（可选）
     * @returns {Promise<Object>}
     */
    async createMessage(content, nickname = '匿名用户', ipAddress = null) {
        const db = await this.getConnection();
        
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO messages (content, nickname, ip_address) VALUES (?, ?, ?)";
            
            db.run(sql, [content, nickname, ipAddress], function(err) {
                if (err) {
                    db.close();
                    reject(err);
                } else {
                    // 获取刚插入的记录
                    const selectSql = `
                        SELECT id, content, nickname, likes,
                               datetime(created_at, 'localtime') as time
                        FROM messages 
                        WHERE id = ?
                    `;
                    
                    db.get(selectSql, [this.lastID], (err, row) => {
                        db.close();
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                }
            });
        });
    }

    /**
     * 删除指定留言
     * @param {number} id - 留言ID
     * @returns {Promise<boolean>}
     */
    async deleteMessage(id) {
        const db = await this.getConnection();
        
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM messages WHERE id = ?";
            
            db.run(sql, [id], function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    // this.changes 表示受影响的行数
                    resolve(this.changes > 0);
                }
            });
        });
    }

    /**
     * 根据ID获取单条留言
     * @param {number} id - 留言ID
     * @returns {Promise<Object|null>}
     */
    async getMessageById(id) {
        const db = await this.getConnection();
        
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, content, nickname, likes,
                       datetime(created_at, 'localtime') as time
                FROM messages 
                WHERE id = ?
            `;
            
            db.get(sql, [id], (err, row) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }

    /**
     * 点赞留言
     * @param {number} id - 留言ID
     * @returns {Promise<Object>}
     */
    async likeMessage(id) {
        const db = await this.getConnection();
        
        return new Promise((resolve, reject) => {
            const updateSql = "UPDATE messages SET likes = likes + 1 WHERE id = ?";
            
            db.run(updateSql, [id], function(err) {
                if (err) {
                    db.close();
                    reject(err);
                } else if (this.changes === 0) {
                    db.close();
                    reject(new Error('留言不存在'));
                } else {
                    // 获取更新后的记录
                    const selectSql = `
                        SELECT id, content, nickname, likes,
                               datetime(created_at, 'localtime') as time
                        FROM messages 
                        WHERE id = ?
                    `;
                    
                    db.get(selectSql, [id], (err, row) => {
                        db.close();
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                }
            });
        });
    }
}

module.exports = Message;