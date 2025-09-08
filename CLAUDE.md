# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SideView is a Tauri desktop application that combines React (TypeScript) frontend with Rust backend. The application creates a web browser with tabbed interface using Tauri's webview capabilities, allowing users to open and manage multiple web pages within embedded webviews.

## Architecture

### Frontend (React/TypeScript)

- **Entry point**: `src/main.tsx` - renders the React app
- **Main component**: `src/App.tsx` - manages tab state and webview operations
- **Core functionality**: Tab management system that creates, positions, and controls Tauri webviews
- **Key features**:
  - Dynamic webview creation and positioning
  - Tab switching with active tab management
  - Physical positioning calculations for webview layout

### Backend (Rust)

- **Entry point**: `src-tauri/src/main.rs` - launches the Tauri app
- **App logic**: `src-tauri/src/lib.rs` - contains Tauri commands and app initialization
- **Commands**: Currently has a `greet` command for basic Rust-frontend communication

### Configuration

- **Tauri config**: `src-tauri/tauri.conf.json` - app metadata, window settings, and build configuration
- **Package management**: Uses pnpm for Node dependencies, Cargo for Rust dependencies
- **Development setup**: Vite for frontend bundling with Tauri-specific configuration

## Development Commands

### Frontend Development

- `pnpm dev` - Start development server (automatically used by Tauri)
- `pnpm build` - Build frontend for production
- `pnpm preview` - Preview production build

### Tauri Development  

- `pnpm tauri dev` - Start Tauri development mode (runs both frontend and backend)
- `pnpm tauri build` - Build production application bundle

### Rust Backend

- Navigate to `src-tauri/` directory for Rust-specific operations
- `cargo build` - Build Rust backend
- `cargo test` - Run Rust tests (if any)

## Key Technical Details

### Webview Management

The app uses Tauri's webview system to embed web content. Key aspects:

- Webviews are created dynamically with unique labels (`tab-${counter}`)
- Physical positioning uses device pixel ratio calculations
- Container-based layout system with `getBoundingClientRect()` for precise positioning

### State Management

- React useState for tab management and active tab tracking
- useRef for label counter and DOM container references
- No external state management library currently used

### Tauri Integration

- Uses `@tauri-apps/api` for frontend-backend communication
- Webview API for creating and managing embedded web content
- Window API for getting current window information
- Plugin system with `tauri-plugin-opener` for opening external URLs

## Development Environment

### Recommended Extensions

- Tauri VS Code extension (`tauri-apps.tauri-vscode`)
- Rust Analyzer (`rust-lang.rust-analyzer`)

### Port Configuration

- Development server runs on port 1420 (fixed port requirement)
- HMR on port 1421 when using custom host
