import { useState } from 'react';
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

  return (
    <div className="window-top-bar" data-tauri-drag-region>
      <div className="window-top-bar-left">
        <div className="window-controls">
          <button
            className="window-control-button close"
            onClick={handleClose}
            aria-label="关闭"
          >
            <svg width="10" height="10" viewBox="0 0 12 12">
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
            <svg width="10" height="10" viewBox="0 0 12 12">
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
              <svg width="10" height="10" viewBox="0 0 12 12">
                <path
                  d="M2 3h7v7H2V3zM3 2h7v7"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 12 12">
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
    </div>
  );
}