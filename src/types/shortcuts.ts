// 快捷键配置类型定义
export interface ShortcutAction {
  id: string;
  name: string;
  description: string;
  category: 'tab' | 'window' | 'help';
}

export interface ShortcutConfig {
  /** 应用内快捷键配置 (仅当应用有焦点时生效) */
  appShortcuts: Record<string, string>;
  /** 系统级全局快捷键配置 (应用在后台也生效) */  
  globalShortcuts: Record<string, string>;
  /** 动作定义 */
  actions: Record<string, ShortcutAction>;
}

// 默认快捷键配置
export const DEFAULT_SHORTCUT_CONFIG: ShortcutConfig = {
  // 应用内快捷键 - 只在应用有焦点时生效
  appShortcuts: {
    // 标签页操作
    'new_tab': 'CmdOrCtrl+T',
    'close_tab': 'CmdOrCtrl+W',
    'reopen_tab': 'CmdOrCtrl+Shift+T',
    'refresh_tab': 'CmdOrCtrl+R',
    'next_tab': 'CmdOrCtrl+Tab',
    'prev_tab': 'CmdOrCtrl+Shift+Tab',
    'switch_tab_1': 'CmdOrCtrl+1',
    'switch_tab_2': 'CmdOrCtrl+2', 
    'switch_tab_3': 'CmdOrCtrl+3',
    'switch_tab_4': 'CmdOrCtrl+4',
    'switch_tab_5': 'CmdOrCtrl+5',
    'switch_tab_6': 'CmdOrCtrl+6',
    'switch_tab_7': 'CmdOrCtrl+7',
    'switch_tab_8': 'CmdOrCtrl+8',
    'switch_tab_9': 'CmdOrCtrl+9',
    
    // 窗口控制
    'minimize_window': 'CmdOrCtrl+M',
    'toggle_maximize': 'Alt+Enter',
    'close_window': 'CmdOrCtrl+Q',
    'hide_app': 'CmdOrCtrl+H',
    
    // 帮助
    'show_help': 'F1',
    'hide_help': 'Escape',
  },

  // 系统级全局快捷键 - 应用在后台也能响应
  globalShortcuts: {
    // 只保留最常用的全局操作
    'global_show_app': 'CmdOrCtrl+Shift+B', // 显示应用
    'global_new_tab': 'CmdOrCtrl+Shift+N',   // 全局新建标签
    'global_toggle_visibility': 'CmdOrCtrl+Shift+V', // 切换显示隐藏
  },

  // 动作定义
  actions: {
    // 标签页操作
    'new_tab': { id: 'new_tab', name: '新建标签页', description: '创建一个新的标签页', category: 'tab' },
    'close_tab': { id: 'close_tab', name: '关闭标签页', description: '关闭当前标签页', category: 'tab' },
    'reopen_tab': { id: 'reopen_tab', name: '重新打开标签页', description: '重新打开最近关闭的标签页', category: 'tab' },
    'refresh_tab': { id: 'refresh_tab', name: '刷新标签页', description: '刷新当前标签页内容', category: 'tab' },
    'next_tab': { id: 'next_tab', name: '下一个标签页', description: '切换到下一个标签页', category: 'tab' },
    'prev_tab': { id: 'prev_tab', name: '上一个标签页', description: '切换到上一个标签页', category: 'tab' },
    'switch_tab_1': { id: 'switch_tab_1', name: '切换到标签页1', description: '切换到第1个标签页', category: 'tab' },
    'switch_tab_2': { id: 'switch_tab_2', name: '切换到标签页2', description: '切换到第2个标签页', category: 'tab' },
    'switch_tab_3': { id: 'switch_tab_3', name: '切换到标签页3', description: '切换到第3个标签页', category: 'tab' },
    'switch_tab_4': { id: 'switch_tab_4', name: '切换到标签页4', description: '切换到第4个标签页', category: 'tab' },
    'switch_tab_5': { id: 'switch_tab_5', name: '切换到标签页5', description: '切换到第5个标签页', category: 'tab' },
    'switch_tab_6': { id: 'switch_tab_6', name: '切换到标签页6', description: '切换到第6个标签页', category: 'tab' },
    'switch_tab_7': { id: 'switch_tab_7', name: '切换到标签页7', description: '切换到第7个标签页', category: 'tab' },
    'switch_tab_8': { id: 'switch_tab_8', name: '切换到标签页8', description: '切换到第8个标签页', category: 'tab' },
    'switch_tab_9': { id: 'switch_tab_9', name: '切换到标签页9', description: '切换到最后一个标签页', category: 'tab' },
    
    // 窗口控制
    'minimize_window': { id: 'minimize_window', name: '最小化窗口', description: '最小化应用窗口', category: 'window' },
    'toggle_maximize': { id: 'toggle_maximize', name: '切换最大化', description: '切换窗口最大化状态', category: 'window' },
    'close_window': { id: 'close_window', name: '关闭窗口', description: '关闭应用程序', category: 'window' },
    'hide_app': { id: 'hide_app', name: '隐藏应用', description: '隐藏应用程序', category: 'window' },
    
    // 帮助
    'show_help': { id: 'show_help', name: '显示帮助', description: '显示快捷键帮助面板', category: 'help' },
    'hide_help': { id: 'hide_help', name: '隐藏帮助', description: '隐藏快捷键帮助面板', category: 'help' },
    
    // 全局操作
    'global_show_app': { id: 'global_show_app', name: '显示应用', description: '从后台显示应用', category: 'window' },
    'global_new_tab': { id: 'global_new_tab', name: '全局新建标签', description: '从任何地方新建标签页', category: 'tab' },
    'global_toggle_visibility': { id: 'global_toggle_visibility', name: '切换显示', description: '切换应用显示隐藏状态', category: 'window' },
  }
};