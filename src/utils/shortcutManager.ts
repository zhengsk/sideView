import { ShortcutConfig, DEFAULT_SHORTCUT_CONFIG } from "../types/shortcuts";

const SHORTCUT_CONFIG_KEY = 'sideview_shortcut_config';

/**
 * 快捷键配置管理器
 * 提供加载、保存、重置等功能，为后续用户自定义做准备
 */
export class ShortcutManager {
  private static instance: ShortcutManager;
  private config: ShortcutConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ShortcutManager {
    if (!ShortcutManager.instance) {
      ShortcutManager.instance = new ShortcutManager();
    }
    return ShortcutManager.instance;
  }

  /**
   * 加载快捷键配置
   */
  public loadConfig(): ShortcutConfig {
    try {
      const stored = localStorage.getItem(SHORTCUT_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 合并默认配置，确保新添加的快捷键也能生效
        return {
          appShortcuts: { ...DEFAULT_SHORTCUT_CONFIG.appShortcuts, ...parsed.appShortcuts },
          globalShortcuts: { ...DEFAULT_SHORTCUT_CONFIG.globalShortcuts, ...parsed.globalShortcuts },
          actions: { ...DEFAULT_SHORTCUT_CONFIG.actions, ...parsed.actions },
        };
      }
    } catch (error) {
      console.warn('Failed to load shortcut config:', error);
    }
    return DEFAULT_SHORTCUT_CONFIG;
  }

  /**
   * 保存快捷键配置
   */
  public saveConfig(config: ShortcutConfig): void {
    try {
      localStorage.setItem(SHORTCUT_CONFIG_KEY, JSON.stringify(config));
      this.config = config;
      
      // 触发配置更新事件
      window.dispatchEvent(new CustomEvent('shortcut-config-updated', { detail: config }));
    } catch (error) {
      console.error('Failed to save shortcut config:', error);
    }
  }

  /**
   * 获取当前配置
   */
  public getConfig(): ShortcutConfig {
    return this.config;
  }

  /**
   * 更新应用内快捷键
   */
  public updateAppShortcut(actionId: string, shortcut: string): boolean {
    try {
      // 检查快捷键是否已被其他动作使用
      const existingAction = Object.entries(this.config.appShortcuts)
        .find(([id, keys]) => id !== actionId && keys === shortcut);
      
      if (existingAction) {
        throw new Error(`快捷键 ${shortcut} 已被 ${existingAction[0]} 使用`);
      }

      const newConfig = {
        ...this.config,
        appShortcuts: {
          ...this.config.appShortcuts,
          [actionId]: shortcut,
        },
      };

      this.saveConfig(newConfig);
      return true;
    } catch (error) {
      console.error('Failed to update app shortcut:', error);
      return false;
    }
  }

  /**
   * 更新全局快捷键
   */
  public updateGlobalShortcut(actionId: string, shortcut: string): boolean {
    try {
      // 检查快捷键是否已被其他动作使用
      const existingAction = Object.entries(this.config.globalShortcuts)
        .find(([id, keys]) => id !== actionId && keys === shortcut);
      
      if (existingAction) {
        throw new Error(`全局快捷键 ${shortcut} 已被 ${existingAction[0]} 使用`);
      }

      const newConfig = {
        ...this.config,
        globalShortcuts: {
          ...this.config.globalShortcuts,
          [actionId]: shortcut,
        },
      };

      this.saveConfig(newConfig);
      return true;
    } catch (error) {
      console.error('Failed to update global shortcut:', error);
      return false;
    }
  }

  /**
   * 重置为默认配置
   */
  public resetToDefault(): void {
    this.saveConfig(DEFAULT_SHORTCUT_CONFIG);
  }

  /**
   * 验证快捷键格式是否正确
   */
  public validateShortcut(shortcut: string): boolean {
    try {
      const parts = shortcut.split('+');
      const validModifiers = ['cmd', 'ctrl', 'cmdorctrl', 'alt', 'shift', 'meta'];
      const validKeys = [
        // 字母
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        // 数字
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
        // 功能键
        'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12',
        // 特殊键
        'enter', 'tab', 'space', 'escape', 'backspace', 'delete', 'insert',
        'home', 'end', 'pageup', 'pagedown', 'up', 'down', 'left', 'right'
      ];

      if (parts.length === 0) return false;

      const key = parts[parts.length - 1].toLowerCase();
      if (!validKeys.includes(key)) return false;

      const modifiers = parts.slice(0, -1).map(m => m.toLowerCase());
      return modifiers.every(m => validModifiers.includes(m));
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取快捷键的显示名称 (适配不同平台)
   */
  public getShortcutDisplayName(shortcut: string): string {
    const isMac = navigator.platform.includes('Mac');
    return shortcut
      .replace('CmdOrCtrl', isMac ? 'Cmd' : 'Ctrl')
      .replace('Cmd', isMac ? '⌘' : 'Ctrl')
      .replace('Ctrl', isMac ? '⌃' : 'Ctrl')
      .replace('Alt', isMac ? '⌥' : 'Alt')
      .replace('Shift', isMac ? '⇧' : 'Shift')
      .replace('+', isMac ? '' : '+');
  }
}

// 导出单例实例
export const shortcutManager = ShortcutManager.getInstance();