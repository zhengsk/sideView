import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./ContextMenu.less";

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  separator?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  items: MenuItem[];
  position: { x: number; y: number };
  visible: boolean;
  onClose: () => void;
}

export default function ContextMenu({ items, position, visible, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  // 调整菜单位置，防止超出屏幕
  useEffect(() => {
    if (visible && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let { x, y } = position;

      // 防止菜单超出右边界
      if (x + rect.width > windowWidth) {
        x = windowWidth - rect.width - 10;
      }

      // 防止菜单超出下边界
      if (y + rect.height > windowHeight) {
        y = windowHeight - rect.height - 10;
      }

      // 防止菜单超出左边界和上边界
      x = Math.max(10, x);
      y = Math.max(10, y);

      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  }, [visible, position]);

  if (!visible) return null;

  const handleItemClick = (item: MenuItem) => {
    item.onClick();
    onClose();
  };

  const menuContent = (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {items.map((item) => (
        <div key={item.id}>
          {item.separator ? <div className="context-menu-separator" /> : (
            <div
              className={`context-menu-item ${item.danger ? 'danger' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && <span className="context-menu-icon">{item.icon}</span>}
              <span className="context-menu-label">{item.label}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 使用 Portal 将菜单渲染到 document.body
  return createPortal(menuContent, document.body);
}