import "./TabBar.less";

export interface Tab {
  label: string;
  title: string;
  url: string;
  isNewTab?: boolean; // 标识是否为新标签页
}

interface TabBarProps {
  tabs: Tab[];
  activeLabel: string | null;
  onActivateTab: (label: string) => void;
  onCloseTab: (label: string) => void;
  onCreateTab: (url: string, title?: string) => void;
}

export default function TabBar({
  tabs,
  activeLabel,
  onActivateTab,
  onCloseTab,
  onCreateTab
}: TabBarProps) {
  const handleCreateTab = () => {
    onCreateTab("", "新标签页");
  };

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
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
            className={`tab-button`}
            title={`${tab.url}\n\n左键：切换标签页\n中键：关闭标签页`}
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
      <button
        onClick={handleCreateTab}
        className="tab-create-button"
      >
        + 新建标签
      </button>
    </div>
  );
}