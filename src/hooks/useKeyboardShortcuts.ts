import { useEffect, useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

// 定义快捷键组合
export interface ShortcutKey {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // macOS Command key
}

// 定义快捷键操作类型
export interface ShortcutAction {
  id: string;
  name: string;
  description: string;
  keys: ShortcutKey;
  action: () => void | Promise<void>;
}

// 默认快捷键配置
export const DEFAULT_SHORTCUTS = {
  // Tab 相关快捷键
  NEW_TAB: { key: 't', ctrl: true },
  CLOSE_TAB: { key: 'w', ctrl: true },
  REOPEN_TAB: { key: 't', ctrl: true, shift: true },
  REFRESH_TAB: { key: 'r', ctrl: true },
  NEXT_TAB: { key: 'Tab', ctrl: true },
  PREV_TAB: { key: 'Tab', ctrl: true, shift: true },
  
  // 窗口控制快捷键
  MINIMIZE_WINDOW: { key: 'm', ctrl: true },
  TOGGLE_MAXIMIZE: { key: 'Enter', alt: true },
  CLOSE_WINDOW: { key: 'q', ctrl: true },
  HIDE_APP: { key: 'h', ctrl: true },
  
  // 帮助快捷键
  SHOW_HELP: { key: 'F1' },
  HIDE_HELP: { key: 'Escape' },
  
  // 数字键切换标签
  TAB_1: { key: '1', ctrl: true },
  TAB_2: { key: '2', ctrl: true },
  TAB_3: { key: '3', ctrl: true },
  TAB_4: { key: '4', ctrl: true },
  TAB_5: { key: '5', ctrl: true },
  TAB_6: { key: '6', ctrl: true },
  TAB_7: { key: '7', ctrl: true },
  TAB_8: { key: '8', ctrl: true },
  TAB_9: { key: '9', ctrl: true }, // 通常用于切换到最后一个标签
} as const;

export interface UseKeyboardShortcutsProps {
  onNewTab: () => void;
  onCloseTab: () => void;
  onReopenTab: () => void;
  onRefreshTab: () => void;
  onNextTab: () => void;
  onPrevTab: () => void;
  onSwitchTab: (index: number) => void;
  onMinimizeWindow: () => void;
  onToggleMaximize: () => void;
  onCloseWindow: () => void;
  onHideApp: () => void;
  onShowHelp: () => void;
  onHideHelp: () => void;
}

export function useKeyboardShortcuts(props: UseKeyboardShortcutsProps) {
  const {
    onNewTab,
    onCloseTab,
    onReopenTab,
    onRefreshTab,
    onNextTab,
    onPrevTab,
    onSwitchTab,
    onMinimizeWindow,
    onToggleMaximize,
    onCloseWindow,
    onHideApp,
    onShowHelp,
    onHideHelp,
  } = props;

  // 检查快捷键是否匹配
  const matchesShortcut = useCallback((event: KeyboardEvent, shortcut: ShortcutKey): boolean => {
    // 检查主键
    const keyMatches = event.key === shortcut.key || 
                      event.code === shortcut.key ||
                      event.key.toLowerCase() === shortcut.key.toLowerCase();
    
    if (!keyMatches) return false;

    // 检查修饰键
    const ctrlMatches = !!shortcut.ctrl === (event.ctrlKey || event.metaKey); // macOS 上用 metaKey
    const shiftMatches = !!shortcut.shift === event.shiftKey;
    const altMatches = !!shortcut.alt === event.altKey;
    
    return ctrlMatches && shiftMatches && altMatches;
  }, []);

  // 创建快捷键动作配置
  const shortcuts: ShortcutAction[] = [
    {
      id: 'new_tab',
      name: '新建标签页',
      description: 'Ctrl+T',
      keys: DEFAULT_SHORTCUTS.NEW_TAB,
      action: onNewTab,
    },
    {
      id: 'close_tab',
      name: '关闭标签页',
      description: 'Ctrl+W',
      keys: DEFAULT_SHORTCUTS.CLOSE_TAB,
      action: onCloseTab,
    },
    {
      id: 'reopen_tab',
      name: '重新打开标签页',
      description: 'Ctrl+Shift+T',
      keys: DEFAULT_SHORTCUTS.REOPEN_TAB,
      action: onReopenTab,
    },
    {
      id: 'refresh_tab',
      name: '刷新标签页',
      description: 'Ctrl+R',
      keys: DEFAULT_SHORTCUTS.REFRESH_TAB,
      action: onRefreshTab,
    },
    {
      id: 'next_tab',
      name: '下一个标签页',
      description: 'Ctrl+Tab',
      keys: DEFAULT_SHORTCUTS.NEXT_TAB,
      action: onNextTab,
    },
    {
      id: 'prev_tab',
      name: '上一个标签页',
      description: 'Ctrl+Shift+Tab',
      keys: DEFAULT_SHORTCUTS.PREV_TAB,
      action: onPrevTab,
    },
    {
      id: 'minimize_window',
      name: '最小化窗口',
      description: 'Ctrl+M',
      keys: DEFAULT_SHORTCUTS.MINIMIZE_WINDOW,
      action: onMinimizeWindow,
    },
    {
      id: 'toggle_maximize',
      name: '切换最大化',
      description: 'Alt+Enter',
      keys: DEFAULT_SHORTCUTS.TOGGLE_MAXIMIZE,
      action: onToggleMaximize,
    },
    {
      id: 'close_window',
      name: '关闭窗口',
      description: 'Ctrl+Q',
      keys: DEFAULT_SHORTCUTS.CLOSE_WINDOW,
      action: onCloseWindow,
    },
    {
      id: 'hide_app',
      name: '隐藏应用',
      description: 'Ctrl+H',
      keys: DEFAULT_SHORTCUTS.HIDE_APP,
      action: onHideApp,
    },
    {
      id: 'show_help',
      name: '显示快捷键帮助',
      description: 'F1',
      keys: DEFAULT_SHORTCUTS.SHOW_HELP,
      action: onShowHelp,
    },
    {
      id: 'hide_help',
      name: '隐藏快捷键帮助',
      description: 'Esc',
      keys: DEFAULT_SHORTCUTS.HIDE_HELP,
      action: onHideHelp,
    },
    // 数字键切换标签
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => ({
      id: `tab_${num}`,
      name: `切换到标签页 ${num}`,
      description: `Ctrl+${num}`,
      keys: DEFAULT_SHORTCUTS[`TAB_${num}` as keyof typeof DEFAULT_SHORTCUTS],
      action: () => onSwitchTab(num - 1),
    })),
  ];

  // 键盘事件处理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 阻止在输入框中触发快捷键
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true') {
      return;
    }

    // 查找匹配的快捷键
    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut.keys)) {
        event.preventDefault();
        event.stopPropagation();
        
        try {
          shortcut.action();
        } catch (error) {
          console.error(`Failed to execute shortcut ${shortcut.id}:`, error);
        }
        break;
      }
    }
  }, [shortcuts, matchesShortcut]);

  // 注册键盘事件监听器
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 窗口控制辅助函数
  const windowControls = {
    async minimize() {
      try {
        const window = getCurrentWindow();
        await window.minimize();
      } catch (error) {
        console.error('Failed to minimize window:', error);
      }
    },

    async toggleMaximize() {
      try {
        const window = getCurrentWindow();
        const isMaximized = await window.isMaximized();
        if (isMaximized) {
          await window.unmaximize();
        } else {
          await window.maximize();
        }
      } catch (error) {
        console.error('Failed to toggle maximize:', error);
      }
    },

    async close() {
      try {
        const window = getCurrentWindow();
        await window.close();
      } catch (error) {
        console.error('Failed to close window:', error);
      }
    },

    async hide() {
      try {
        const window = getCurrentWindow();
        await window.hide();
      } catch (error) {
        console.error('Failed to hide window:', error);
      }
    },
  };

  return {
    shortcuts,
    windowControls,
    matchesShortcut,
  };
}