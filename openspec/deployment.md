# 安装与部署

## 前置条件
- Node.js 18.17 或更高版本
- npm, yarn, 或 pnpm

## 安装流程
1. 克隆仓库：
   ```bash
   git clone https://github.com/sutchan/notecascade.git
   cd notecascade
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 运行开发服务器：
   ```bash
   npm run dev
   ```
4. 在浏览器中打开 http://localhost:3000。

## 多环境部署方案
NoteCascade 适用于标准 Web 部署。
- 使用 `npm run build` 生成生产构建。
- 使用 `npm run start` 启动生产环境服务。
- 验证方法：确保构建成功且服务在指定端口正常响应。
