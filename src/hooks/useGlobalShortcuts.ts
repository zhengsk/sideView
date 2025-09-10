import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";
import { DEFAULT_SHORTCUT_CONFIG, ShortcutConfig } from "../types/shortcuts";

export interface UseGlobalShortcutsProps {
  onNewTab: () => void;
  onShowApp?: () => void;
  onToggleVisibility?: () => void;
  shortcutConfig?: ShortcutConfig;
}

/**
 * 系统级全局快捷键处理 Hook  
 * 即使应用在后台也能响应这些快捷键
 */
export function useGlobalShortcuts(props: UseGlobalShortcutsProps) {
  const {
    onNewTab,
    onShowApp,
    onToggleVisibility,
    shortcutConfig = DEFAULT_SHORTCUT_CONFIG,
  } = props;

  // 默认的全局操作处理
  const handleShowApp = async () => {
    try {
      const window = getCurrentWindow();
      await window.show();
      await window.setFocus();
      if (onShowApp) {
        onShowApp();
      }
    } catch (error) {
      console.error('Failed to show app:', error);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const window = getCurrentWindow();
      const isVisible = await window.isVisible();
      if (isVisible) {
        await window.hide();
      } else {
        await window.show();
        await window.setFocus();
      }
      if (onToggleVisibility) {
        onToggleVisibility();
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  useEffect(() => {
    // 监听系统级全局快捷键事件
    const unlisten = listen('global_shortcut', (event) => {
      debugger;

      const shortcutId = event.payload as string;

      switch (shortcutId) {
        case 'global_show_app':
          handleShowApp();
          break;
        case 'global_new_tab':
          // 先显示应用，然后创建新标签
          handleShowApp().then(() => {
            onNewTab();
          });
          break;
        case 'global_toggle_visibility':
          handleToggleVisibility();
          break;
        default:
          console.warn(`Unknown global shortcut: ${shortcutId}`);
      }
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [onNewTab, onShowApp, onToggleVisibility]);

  // 返回全局快捷键列表供 UI 显示
  const globalShortcuts = Object.entries(shortcutConfig.globalShortcuts).map(([actionId, keys]) => {
    const action = shortcutConfig.actions[actionId];
    return {
      keys: keys.replace('CmdOrCtrl', navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'),
      description: action?.description || actionId,
      category: action?.category || 'other',
    };
  });

  return {
    shortcuts: globalShortcuts,
    shortcutConfig,
    handleShowApp,
    handleToggleVisibility,
  };
}