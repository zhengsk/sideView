import { useState } from 'react';
import { relaunch, exit } from '@tauri-apps/plugin-process';
import ContextMenu, { MenuItem } from './ContextMenu';

interface ApplicationMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  // 可扩展的配置选项
  onSettingsClick?: () => void;
  onBeforeRestart?: () => Promise<boolean>; // 返回false可阻止重启
  onBeforeClose?: () => Promise<boolean>; // 返回false可阻止关闭
}

export default function ApplicationMenu({
  visible,
  position,
  onClose,
  onSettingsClick,
  onBeforeRestart,
  onBeforeClose
}: ApplicationMenuProps) {
  // 处理设置点击
  const handleSettings = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // 默认行为：控制台输出
      console.log('打开应用设置');
      // TODO: 实现设置页面
    }
  };

  // 处理重启应用
  const handleRestart = async () => {
    try {
      // 如果提供了重启前回调，先执行
      if (onBeforeRestart) {
        const shouldContinue = await onBeforeRestart();
        if (!shouldContinue) {
          return; // 取消重启
        }
      }

      await relaunch();
    } catch (error) {
      console.error('Failed to restart application:', error);
      // 可以添加用户友好的错误提示
    }
  };

  // 处理关闭应用
  const handleClose = async () => {
    try {
      // 如果提供了关闭前回调，先执行
      if (onBeforeClose) {
        const shouldContinue = await onBeforeClose();
        if (!shouldContinue) {
          return; // 取消关闭
        }
      }

      await exit(0);
    } catch (error) {
      console.error('Failed to close application:', error);
      // 可以添加用户友好的错误提示
    }
  };

  // 菜单项配置
  const menuItems: MenuItem[] = [
    {
      id: 'settings',
      label: '应用设置',
      icon: '⚙️',
      onClick: handleSettings
    },
    {
      id: 'separator1',
      label: '',
      separator: true,
      onClick: () => {}
    },
    {
      id: 'restart',
      label: '重启应用',
      icon: '🔄',
      onClick: handleRestart
    },
    {
      id: 'close',
      label: '关闭应用',
      icon: '❌',
      danger: true,
      onClick: handleClose
    }
  ];

  return (
    <ContextMenu
      items={menuItems}
      position={position}
      visible={visible}
      onClose={onClose}
    />
  );
}

// 导出一个自定义 Hook 用于管理菜单状态
export function useApplicationMenu() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const showMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setVisible(true);
  };

  const hideMenu = () => {
    setVisible(false);
  };

  return {
    visible,
    position,
    showMenu,
    hideMenu
  };
}