#!/bin/bash

# Render部署构建脚本
echo "开始构建树洞应用..."

# 进入后端目录
cd backend

# 安装依赖
echo "安装Node.js依赖..."
npm install

# 初始化数据库
echo "初始化SQLite数据库..."
npm run init-db

echo "构建完成！"