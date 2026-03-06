# NoteCascade 🎹

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8)](https://tailwindcss.com/)

**中文文档** | [English Documentation](./README.md)

**NoteCascade** 是一个现代化的基于 Web 的 MIDI 钢琴练习应用，旨在通过引人入胜的瀑布流节奏游戏界面帮助您掌握琴键。连接您的 MIDI 键盘，开始演奏吧！

![NoteCascade 截图](https://via.placeholder.com/800x450?text=NoteCascade+Preview) *(截图占位符)*

## ✨ 特性

-   **🎹 MIDI 支持**：通过 USB 连接任何兼容 MIDI 的键盘，获得实时反馈。
-   **🌊 瀑布流游戏模式**：类似于流行节奏游戏的视觉下落音符界面。
-   **🌍 多语言支持**：全面本地化，支持英语、中文（简体/繁体）、西班牙语、阿拉伯语、法语、葡萄牙语、德语、日语、韩语和俄语。
-   **🏆 成就系统**：通过解锁成就和统计数据跟踪您的进度。
-   **🎨 主题切换**：选择多种主题（深色、浅色、赛博朋克、经典）以适应您的风格。
-   **📱 响应式设计**：适用于桌面和移动设备（包含触摸支持）。
-   **🎵 内置歌曲**：使用包含各种风格的内置歌曲库进行练习。
-   **🔐 身份验证**：使用 Firebase 进行安全的用户账户管理，以便跟踪进度。
-   **⚙️ 练习模式**：可调节的速度和循环播放功能，实现专注学习。

## 🚀 快速开始

### 前置条件

-   Node.js 18.17 或更高版本
-   npm 或 yarn 或 pnpm

### 安装

1.  克隆仓库：
    ```bash
    git clone https://github.com/sutchan/notecascade.git
    cd notecascade
    ```

2.  安装依赖：
    ```bash
    npm install
    # 或
    yarn install
    # 或
    pnpm install
    ```

3.  运行开发服务器：
    ```bash
    npm run dev
    # 或
    yarn dev
    # 或
    pnpm dev
    ```

4.  使用浏览器打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 🛠️ 技术栈

-   **框架**：[Next.js 15](https://nextjs.org/) (App Router)
-   **语言**：[TypeScript](https://www.typescriptlang.org/)
-   **样式**：[Tailwind CSS v4](https://tailwindcss.com/)
-   **状态管理**：[Zustand](https://github.com/pmndrs/zustand)
-   **音频/MIDI**：[Tone.js](https://tonejs.github.io/) & Web MIDI API
-   **动画**：[Motion](https://motion.dev/)
-   **图标**：[Lucide React](https://lucide.dev/)

## 📚 文档

- [项目概述](./openspec/project.md)
- [安装与部署](./openspec/deployment.md)
- [功能模块说明](./openspec/modules.md)
- [API 接口文档](./openspec/api.md)
- [用户操作指南](./openspec/user-guide.md)
- [常见问题与故障排除](./openspec/faq.md)

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1.  Fork 本项目
2.  创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交您的更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  开启一个 Pull Request

## 📄 许可证

本项目基于 GPL v3 许可证开源 - 详见 [LICENSE](LICENSE) 文件。

## 👤 作者

**Sut**

-   GitHub: [@sutchan](https://github.com/sutchan)

---

*享受演奏的乐趣！ 🎵*
