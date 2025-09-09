import { invoke } from "@tauri-apps/api/core";
import "./TabBar.less";

export interface Tab {
  label: string;
  title: string;
  url: string;
  isNewTab?: boolean; // 标识是否为新标签页
}

export interface ClosedTab extends Tab {
  originalIndex: number; // 被关闭时的位置
  closedAt: number; // 关闭时间戳
}

interface TabBarProps {
  tabs: Tab[];
  activeLabel: string | null;
  onActivateTab: (label: string) => void;
  onCloseTab: (label: string) => void;
  onCreateTab: (url?: string, title?: string) => void;
  onRefreshTab?: (label: string) => void;
  onCloseOtherTabs?: (label: string) => void;
  onCloseRightTabs?: (label: string) => void;
  hasClosedTabs?: boolean;
  onReopenTab?: () => void;
}

export default function TabBar({
  tabs,
  activeLabel,
  onActivateTab,
  onCloseTab,
  onCreateTab,
  onRefreshTab,
  onCloseOtherTabs,
  hasClosedTabs,
  onReopenTab
}: TabBarProps) {
  const handleCreateTab = () => {
    onCreateTab();
  };

  // 处理标签页右键菜单
  const handleTabContextMenu = async (event: React.MouseEvent, tab: Tab) => {
    event.preventDefault();
    try {
      await invoke('show_tab_context_menu', {
        tabLabel: tab.label,
        totalTabs: tabs.length
      });
    } catch (error) {
      console.error('Failed to show tab context menu:', error);
    }
  };

  return (
    <div className="tab-bar">
      {tabs.map((tab, index) => (
        <div key={tab.label} className={`tab-bar-item ${activeLabel === tab.label ? 'active' : ''}`}>
          <button
            onClick={() => onActivateTab(tab.label)}
            onMouseDown={(e) => {
              // 鼠标中键点击关闭标签页
              if (e.button === 1) {
                e.preventDefault();
                onCloseTab(tab.label);
              }
            }}
            onContextMenu={(e) => handleTabContextMenu(e, tab)}
            className={`tab-button`}
            title={`${tab.url}\n\n左键：切换标签页\n中键：关闭标签页\n右键：打开菜单`}
          >
            {tab.title}
          </button>
          <button
            onClick={() => onCloseTab(tab.label)}
            className="tab-close-button"
            aria-label={`关闭 ${tab.title}`}
          >
            ×
          </button>
        </div>
      ))}
      {hasClosedTabs && onReopenTab && (
        <button
          onClick={onReopenTab}
          className="tab-reopen-button"
          title="重新打开最近关闭的标签页 (Ctrl+Shift+T)"
        >
          ↶
        </button>
      )}
      <button
        onClick={handleCreateTab}
        className="tab-create-button"
      >
        +
      </button>
    </div>
  );
}