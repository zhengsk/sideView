import React, { useMemo } from "react";
import { shortcutManager } from "../utils/shortcutManager";
import "./ShortcutsHelp.less";

interface ShortcutItem {
  category: string;
  shortcuts: {
    keys: string;
    description: string;
    type: 'app' | 'global';
  }[];
}

interface ShortcutsHelpProps {
  isVisible: boolean;
  onClose: () => void;
}

const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ isVisible, onClose }) => {
  // 动态生成快捷键分类
  const shortcutCategories: ShortcutItem[] = useMemo(() => {
    const config = shortcutManager.getConfig();
    const categories: Record<string, ShortcutItem> = {};

    // 处理应用内快捷键
    Object.entries(config.appShortcuts).forEach(([actionId, keys]) => {
      const action = config.actions[actionId];
      if (!action) return;

      const categoryName = action.category === 'tab' ? '标签页操作' :
                          action.category === 'window' ? '窗口控制' :
                          action.category === 'help' ? '帮助' : '其他';

      if (!categories[categoryName]) {
        categories[categoryName] = {
          category: categoryName,
          shortcuts: []
        };
      }

      categories[categoryName].shortcuts.push({
        keys: shortcutManager.getShortcutDisplayName(keys),
        description: action.description,
        type: 'app'
      });
    });

    // 处理全局快捷键
    Object.entries(config.globalShortcuts).forEach(([actionId, keys]) => {
      const action = config.actions[actionId];
      if (!action) return;

      const categoryName = '全局快捷键';

      if (!categories[categoryName]) {
        categories[categoryName] = {
          category: categoryName,
          shortcuts: []
        };
      }

      categories[categoryName].shortcuts.push({
        keys: shortcutManager.getShortcutDisplayName(keys),
        description: action.description,
        type: 'global'
      });
    });

    return Object.values(categories);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="shortcuts-help-overlay" onClick={onClose}>
      <div className="shortcuts-help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-help-header">
          <h2>快捷键帮助</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="shortcuts-help-content">
          {shortcutCategories.map((category) => (
            <div key={category.category} className="shortcut-category">
              <h3 className="category-title">
                {category.category}
                {category.category === '全局快捷键' && (
                  <span className="global-badge">后台可用</span>
                )}
              </h3>
              <div className="shortcuts-list">
                {category.shortcuts.map((shortcut, index) => (
                  <div key={index} className={`shortcut-item ${shortcut.type}`}>
                    <span className="shortcut-keys">{shortcut.keys}</span>
                    <span className="shortcut-description">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-help-footer">
          <p className="help-note">
            <strong>应用内快捷键</strong>：只在应用获得焦点时生效<br />
            <strong>全局快捷键</strong>：应用在后台也能响应
          </p>
          <p className="help-tip">按 Esc 关闭此帮助</p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsHelp;