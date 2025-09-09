# SideView Browser

<div align="center">

![SideView Logo](https://via.placeholder.com/128x128/646cff/ffffff?text=SV)

A modern desktop browser application built with Tauri, React, and TypeScript, featuring embedded webviews and tab management.

[Features](#features) • [Quick Start](#quick-start) • [Development](#development) • [Documentation](#documentation) • [中文文档](./README_CN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Tauri](https://img.shields.io/badge/Built_with-Tauri-24C8DB?logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)

</div>

## ✨ Features

- **🌐 Embedded Web Views**: Create and manage multiple webviews within a single application window
- **📑 Tab Management**: Full-featured tab system with create, switch, and close operations
- **🎛️ Custom Window Controls**: Native-feeling minimize, maximize, and close buttons
- **🔄 Dynamic Layout**: Automatic webview resizing and repositioning based on window size
- **⚡ Fast & Lightweight**: Built on Tauri for optimal performance and small bundle size
- **🎨 Modern UI**: Clean, responsive interface with smooth animations
- **🖥️ Cross-Platform**: Supports macOS, Windows, and Linux
- **🔧 Developer Friendly**: Hot reload, TypeScript support, and comprehensive tooling

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 18.0.0
- **Rust**: >= 1.70.0
- **pnpm**: >= 8.0.0 (recommended package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/sideview.git
   cd sideview
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm tauri dev
   ```

   This command will:
   - Start the Vite development server
   - Launch the Tauri application
   - Enable hot reload for both frontend and backend

### Build for Production

```bash
# Build the application
pnpm tauri build

# The built application will be available in:
# - macOS: src-tauri/target/release/bundle/macos/
# - Windows: src-tauri/target/release/bundle/msi/
# - Linux: src-tauri/target/release/bundle/deb/ or /appimage/
```

## 🏗️ Architecture

### Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend Framework** | React | ^19.1.0 |
| **Language** | TypeScript | ~5.8.3 |
| **Desktop Framework** | Tauri | ^2.0.0 |
| **Bundler** | Vite | ^7.0.4 |
| **Styling** | Less | ^4.4.1 |
| **Package Manager** | pnpm | Latest |

### Project Structure

```
sideview/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── WindowTopBar.tsx     # Custom window controls
│   │   └── WindowTopBar.less    # Window controls styling
│   ├── App.tsx                  # Main application component
│   ├── App.less                 # Application styling
│   └── main.tsx                 # Application entry point
├── src-tauri/                   # Rust backend
│   ├── src/
│   │   ├── main.rs              # Application entry point
│   │   └── lib.rs               # Tauri commands and logic
│   ├── capabilities/            # Permission configurations
│   │   └── default.json         # Default permissions
│   ├── tauri.conf.json          # Tauri configuration
│   └── Cargo.toml               # Rust dependencies
├── public/                      # Static assets
├── dist/                        # Built frontend assets
└── package.json                 # Node.js dependencies and scripts
```

## 🔧 Development

### Available Scripts

```bash
# Frontend development
pnpm dev          # Start Vite dev server
pnpm build        # Build frontend for production
pnpm preview      # Preview production build

# Tauri development
pnpm tauri dev    # Start Tauri development mode
pnpm tauri build  # Build production application

# Rust backend (run in src-tauri/ directory)
cargo build       # Build Rust backend
cargo test         # Run Rust tests
```

### Development Workflow

1. **Frontend Development**: The Vite server runs on `http://localhost:1420` with HMR enabled
2. **Backend Development**: Rust code changes trigger automatic recompilation
3. **Hot Reload**: Both frontend and backend changes are reflected instantly
4. **Debugging**: Use browser DevTools for frontend and Rust debugging tools for backend

### Key Components

#### WindowTopBar Component
- Custom window controls (minimize, maximize, close)
- Drag region for window movement
- macOS-style button design with hover effects

#### Webview Management
- Dynamic webview creation and positioning
- Tab state management with React hooks
- Physical coordinate calculations for precise layout

#### Tauri Commands
- `create_embedded_webview`: Creates new webview instances
- `resize_webview`: Adjusts webview size and position
- `show_webview`/`hide_webview`: Controls webview visibility

## 🎯 Usage

### Creating New Tabs
Click the "新建标签" (New Tab) button to create a new webview tab. By default, it opens Huaban.com, but this can be customized.

### Managing Tabs
- **Switch Tab**: Click on any tab button to activate it
- **Close Tab**: Click the "×" button on each tab
- **Window Controls**: Use the traffic light buttons (close, minimize, maximize) in the top bar

### Window Operations
- **Minimize**: Yellow button or programmatic minimize
- **Maximize/Restore**: Green button toggles between maximized and normal states
- **Close**: Red button closes the application

## 📁 Configuration

### Tauri Configuration (`src-tauri/tauri.conf.json`)

```json
{
  "app": {
    "windows": [
      {
        "title": "sideview",
        "width": 800,
        "height": 600,
        "decorations": false  // Custom window decorations
      }
    ]
  }
}
```

### Permissions (`src-tauri/capabilities/default.json`)

The application requires specific permissions for window and webview management:
- Window control permissions (minimize, maximize, close)
- Webview creation and management permissions
- File system access for local resources

## 🛠️ Troubleshooting

### Common Issues

**1. Development server won't start**
```bash
# Clear node modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**2. Tauri build fails**
```bash
# Update Rust toolchain
rustup update
# Clean Rust build cache
cd src-tauri && cargo clean
```

**3. Window controls not working**
- Ensure all required permissions are set in `capabilities/default.json`
- Check that `decorations: false` is set in `tauri.conf.json`

**4. Transparent window warning on macOS**
This warning can be safely ignored or resolved by enabling `tauri.macOSPrivateApi` in the configuration.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Test your changes thoroughly
4. Update documentation as needed
5. Follow conventional commit messages

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - For the amazing Rust-based desktop framework
- [React](https://reactjs.org/) - For the powerful UI library
- [Vite](https://vitejs.dev/) - For the lightning-fast build tool
- [TypeScript](https://www.typescriptlang.org/) - For type safety and developer experience

## 📞 Support

If you have any questions or need help, please:
- Open an [issue](https://github.com/your-username/sideview/issues)
- Check the [documentation](https://tauri.app/v1/guides/)
- Join the [Tauri Discord community](https://discord.com/invite/tauri)

---

<div align="center">
Made with ❤️ using Tauri and React
</div>