import { useState } from 'react';
import { relaunch, exit } from '@tauri-apps/plugin-process';
import ContextMenu, { MenuItem } from './ContextMenu';
import './WindowTopBar.less';

interface WindowTopBarProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  title?: string;
}

export default function WindowTopBar({
  onMinimize,
  onMaximize,
  onClose,
  title = 'SideView'
}: WindowTopBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const handleMinimize = () => {
    onMinimize?.();
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    onMaximize?.();
  };

  const handleClose = () => {
    onClose?.();
  };

  // 处理右键菜单
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuVisible(true);
  };

  // 菜单项配置
  const menuItems: MenuItem[] = [
    {
      id: 'settings',
      label: '应用设置',
      icon: '⚙️',
      onClick: () => {
        // TODO: 打开设置页面
        console.log('打开应用设置');
      }
    },
    {
      id: 'separator1',
      label: '',
      separator: true,
      onClick: () => { }
    },
    {
      id: 'restart',
      label: '重启应用',
      icon: '🔄',
      onClick: async () => {
        try {
          await relaunch();
        } catch (error) {
          console.error('Failed to restart application:', error);
        }
      }
    },
    {
      id: 'close',
      label: '关闭应用',
      icon: '❌',
      danger: false,
      onClick: async () => {
        try {
          await exit(0);
        } catch (error) {
          console.error('Failed to close application:', error);
        }
      }
    }
  ];

  return (
    <div
      className="window-top-bar"
      data-tauri-drag-region
      onContextMenu={handleContextMenu}
    >
      <div className="window-top-bar-left">
        <div className="window-controls">
          <button
            className="window-control-button close"
            onClick={handleClose}
            aria-label="关闭"
          >
            <svg width="8" height="8" viewBox="0 0 12 12">
              <path
                d="M1 1L11 11M1 11L11 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            className="window-control-button minimize"
            onClick={handleMinimize}
            aria-label="最小化"
          >
            <svg width="8" height="8" viewBox="0 0 12 12">
              <path
                d="M1 6h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            className="window-control-button maximize"
            onClick={handleMaximize}
            aria-label={isMaximized ? "还原" : "最大化"}
          >
            {isMaximized ? (
              <svg width="8" height="8" viewBox="0 0 12 12">
                <path
                  d="M2 3h7v7H2V3zM3 2h7v7"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            ) : (
              <svg width="8" height="8" viewBox="0 0 12 12">
                <rect
                  x="2"
                  y="2"
                  width="8"
                  height="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="window-top-bar-center">
        <span className="window-title">{title}</span>
      </div>

      <div className="window-top-bar-right">
        {/* 这里可以放置其他功能按钮，如搜索、设置等 */}
      </div>

      {/* 右键上下文菜单 */}
      <ContextMenu
        items={menuItems}
        position={contextMenuPosition}
        visible={contextMenuVisible}
        onClose={() => setContextMenuVisible(false)}
      />
    </div>
  );
}