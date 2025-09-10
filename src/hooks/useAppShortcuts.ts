import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { DEFAULT_SHORTCUT_CONFIG, ShortcutConfig } from "../types/shortcuts";

export interface UseAppShortcutsProps {
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
  shortcutConfig?: ShortcutConfig; // 可自定义配置
}

/**
 * 应用内快捷键处理 Hook
 * 监听来自 Tauri 层的应用级快捷键事件，解决 webview 焦点问题
 */
export function useAppShortcuts(props: UseAppShortcutsProps) {
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
    shortcutConfig = DEFAULT_SHORTCUT_CONFIG,
  } = props;

  // 动作执行映射
  const actionHandlers: Record<string, () => void> = {
    'new_tab': onNewTab,
    'close_tab': onCloseTab,
    'reopen_tab': onReopenTab,
    'refresh_tab': onRefreshTab,
    'next_tab': onNextTab,
    'prev_tab': onPrevTab,
    'minimize_window': onMinimizeWindow,
    'toggle_maximize': onToggleMaximize,
    'close_window': onCloseWindow,
    'hide_app': onHideApp,
    'show_help': onShowHelp,
    'hide_help': onHideHelp,
    'switch_tab_1': () => onSwitchTab(0),
    'switch_tab_2': () => onSwitchTab(1),
    'switch_tab_3': () => onSwitchTab(2),
    'switch_tab_4': () => onSwitchTab(3),
    'switch_tab_5': () => onSwitchTab(4),
    'switch_tab_6': () => onSwitchTab(5),
    'switch_tab_7': () => onSwitchTab(6),
    'switch_tab_8': () => onSwitchTab(7),
    'switch_tab_9': () => onSwitchTab(8),
  };

  // 处理键盘事件
  const handleKeyDown = async (event: KeyboardEvent) => {
    const { ctrlKey, metaKey, shiftKey, altKey, key, code } = event;
    
    // 构建快捷键字符串
    const modifiers = [];
    if (ctrlKey || metaKey) modifiers.push('CommandOrControl');
    if (shiftKey) modifiers.push('Shift');
    if (altKey) modifiers.push('Alt');
    
    let keyName = key;
    if (key === 'Enter') keyName = 'Enter';
    else if (key === 'Escape') keyName = 'Escape';
    else if (key === 'Tab') keyName = 'Tab';
    else if (key === 'F1') keyName = 'F1';
    else if (code.startsWith('Digit')) keyName = code.slice(5); // Digit1 -> 1
    else if (key.length === 1) keyName = key.toUpperCase();
    
    const shortcut = modifiers.length > 0 ? `${modifiers.join('+')}+${keyName}` : keyName;
    
    // 调用 Tauri 命令处理应用级快捷键
    try {
      await invoke('handle_app_shortcut', { shortcut });
      // 如果成功处理，阻止默认行为
      if (actionHandlers[shortcut]) {
        event.preventDefault();
      }
    } catch (error) {
      // 如果处理失败或没有匹配的快捷键，不做任何处理
    }
  };

  // 添加全局键盘监听
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 监听来自 Tauri 层的应用级快捷键事件
  useEffect(() => {
    const unlisten = listen('app_shortcut', (event) => {
      const shortcutId = event.payload as string;
      const handler = actionHandlers[shortcutId];

      if (handler) {
        try {
          handler();
        } catch (error) {
          console.error(`Failed to execute app shortcut ${shortcutId}:`, error);
        }
      } else {
        console.warn(`Unknown app shortcut: ${shortcutId}`);
      }
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [
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
  ]);

  return {
    shortcutConfig,
  };
}