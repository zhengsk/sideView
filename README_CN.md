# SideView 浏览器

<div align="center">

![SideView Logo](https://via.placeholder.com/128x128/646cff/ffffff?text=SV)

基于 Tauri、React 和 TypeScript 构建的现代桌面浏览器应用，支持嵌入式网页视图和标签页管理。

[功能特性](#功能特性) • [快速开始](#快速开始) • [开发指南](#开发指南) • [文档](#文档) • [English](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Tauri](https://img.shields.io/badge/Built_with-Tauri-24C8DB?logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)

</div>

## ✨ 功能特性

- **🌐 嵌入式网页视图**: 在单个应用窗口内创建和管理多个网页视图
- **📑 标签页管理**: 完整的标签页系统，支持创建、切换和关闭操作
- **🎛️ 自定义窗口控件**: 原生感受的最小化、最大化和关闭按钮
- **🔄 动态布局**: 根据窗口大小自动调整网页视图的尺寸和位置
- **⚡ 快速轻量**: 基于 Tauri 构建，性能优异且打包体积小
- **🎨 现代化界面**: 简洁响应式界面，流畅动画效果
- **🖥️ 跨平台支持**: 支持 macOS、Windows 和 Linux
- **🔧 开发者友好**: 热重载、TypeScript 支持和完整的工具链

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **Rust**: >= 1.70.0
- **pnpm**: >= 8.0.0 (推荐的包管理器)

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/sideview.git
   cd sideview
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **启动开发服务器**
   ```bash
   pnpm tauri dev
   ```

   该命令将：
   - 启动 Vite 开发服务器
   - 启动 Tauri 应用程序
   - 开启前端和后端的热重载

### 生产环境构建

```bash
# 构建应用程序
pnpm tauri build

# 构建后的应用程序将位于：
# - macOS: src-tauri/target/release/bundle/macos/
# - Windows: src-tauri/target/release/bundle/msi/
# - Linux: src-tauri/target/release/bundle/deb/ 或 /appimage/
```

## 🏗️ 架构设计

### 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| **前端框架** | React | ^19.1.0 |
| **开发语言** | TypeScript | ~5.8.3 |
| **桌面框架** | Tauri | ^2.0.0 |
| **构建工具** | Vite | ^7.0.4 |
| **样式预处理** | Less | ^4.4.1 |
| **包管理器** | pnpm | Latest |

### 项目结构

```
sideview/
├── src/                          # 前端源代码
│   ├── components/               # React 组件
│   │   ├── WindowTopBar.tsx     # 自定义窗口控件
│   │   └── WindowTopBar.less    # 窗口控件样式
│   ├── App.tsx                  # 主应用组件
│   ├── App.less                 # 应用样式
│   └── main.tsx                 # 应用入口点
├── src-tauri/                   # Rust 后端
│   ├── src/
│   │   ├── main.rs              # 应用入口点
│   │   └── lib.rs               # Tauri 命令和逻辑
│   ├── capabilities/            # 权限配置
│   │   └── default.json         # 默认权限
│   ├── tauri.conf.json          # Tauri 配置
│   └── Cargo.toml               # Rust 依赖
├── public/                      # 静态资源
├── dist/                        # 构建后的前端资源
└── package.json                 # Node.js 依赖和脚本
```

## 🔧 开发指南

### 可用脚本

```bash
# 前端开发
pnpm dev          # 启动 Vite 开发服务器
pnpm build        # 构建前端生产版本
pnpm preview      # 预览生产构建

# Tauri 开发
pnpm tauri dev    # 启动 Tauri 开发模式
pnpm tauri build  # 构建生产应用程序

# Rust 后端 (在 src-tauri/ 目录中运行)
cargo build       # 构建 Rust 后端
cargo test         # 运行 Rust 测试
```

### 开发工作流

1. **前端开发**: Vite 服务器运行在 `http://localhost:1420`，启用 HMR
2. **后端开发**: Rust 代码更改会触发自动重新编译
3. **热重载**: 前端和后端更改都会立即反映
4. **调试**: 前端使用浏览器开发工具，后端使用 Rust 调试工具

### 核心组件

#### WindowTopBar 组件
- 自定义窗口控件（最小化、最大化、关闭）
- 窗口拖拽区域
- macOS 风格按钮设计和悬停效果

#### 网页视图管理
- 动态网页视图创建和定位
- 使用 React hooks 进行标签页状态管理
- 物理坐标计算以实现精确布局

#### Tauri 命令
- `create_embedded_webview`: 创建新的网页视图实例
- `resize_webview`: 调整网页视图大小和位置
- `show_webview`/`hide_webview`: 控制网页视图可见性

## 🎯 使用方法

### 创建新标签页
点击"新建标签"按钮创建新的网页视图标签页。默认打开花瓣网，但可以自定义。

### 管理标签页
- **切换标签页**: 点击任意标签页按钮激活它
- **关闭标签页**: 点击每个标签页上的"×"按钮
- **窗口控制**: 使用顶栏中的交通灯按钮（关闭、最小化、最大化）

### 窗口操作
- **最小化**: 黄色按钮或程序化最小化
- **最大化/还原**: 绿色按钮在最大化和正常状态之间切换
- **关闭**: 红色按钮关闭应用程序

## 📁 配置

### Tauri 配置 (`src-tauri/tauri.conf.json`)

```json
{
  "app": {
    "windows": [
      {
        "title": "sideview",
        "width": 800,
        "height": 600,
        "decorations": false  // 自定义窗口装饰
      }
    ]
  }
}
```

### 权限配置 (`src-tauri/capabilities/default.json`)

应用程序需要特定权限来进行窗口和网页视图管理：
- 窗口控制权限（最小化、最大化、关闭）
- 网页视图创建和管理权限
- 本地资源文件系统访问权限

## 🛠️ 故障排除

### 常见问题

**1. 开发服务器无法启动**
```bash
# 清除 node_modules 并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**2. Tauri 构建失败**
```bash
# 更新 Rust 工具链
rustup update
# 清除 Rust 构建缓存
cd src-tauri && cargo clean
```

**3. 窗口控件无法工作**
- 确保所有必需的权限都在 `capabilities/default.json` 中设置
- 检查 `tauri.conf.json` 中设置了 `decorations: false`

**4. macOS 透明窗口警告**
此警告可以安全忽略，或通过在配置中启用 `tauri.macOSPrivateApi` 来解决。

## 🤝 参与贡献

欢迎贡献代码！请随时提交 Pull Request。对于重大更改，请先创建 issue 讨论您想要更改的内容。

### 开发指导原则

1. 遵循现有的代码风格和模式
2. 为新功能添加 TypeScript 类型
3. 彻底测试您的更改
4. 根据需要更新文档
5. 遵循约定式提交消息

### Pull Request 流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Tauri](https://tauri.app/) - 出色的基于 Rust 的桌面框架
- [React](https://reactjs.org/) - 强大的 UI 库
- [Vite](https://vitejs.dev/) - 闪电般快速的构建工具
- [TypeScript](https://www.typescriptlang.org/) - 提供类型安全和开发体验

## 📞 支持

如果您有任何问题或需要帮助，请：
- 创建 [issue](https://github.com/your-username/sideview/issues)
- 查看 [文档](https://tauri.app/v1/guides/)
- 加入 [Tauri Discord 社区](https://discord.com/invite/tauri)

## 🚦 项目状态

- ✅ 基础窗口管理功能
- ✅ 标签页创建和切换
- ✅ 嵌入式网页视图
- ✅ 自定义窗口控件
- 🔄 地址栏和导航功能（开发中）
- 📋 书签管理（计划中）
- 🔍 搜索功能（计划中）
- ⚙️ 设置页面（计划中）

## 🔮 未来计划

- **地址栏**: 添加 URL 输入和导航功能
- **书签系统**: 实现书签的添加、管理和组织
- **搜索引擎**: 集成多个搜索引擎选项
- **主题支持**: 明暗主题切换和自定义主题
- **扩展支持**: 插件系统和第三方扩展
- **性能优化**: 内存使用优化和渲染性能提升

## 📈 贡献统计

我们欢迎各种形式的贡献：
- 🐛 Bug 报告和修复
- ✨ 新功能开发
- 📚 文档改进
- 🎨 UI/UX 设计
- 🧪 测试用例编写
- 🌐 国际化和本地化

---

<div align="center">
用 ❤️ 基于 Tauri 和 React 构建
</div>