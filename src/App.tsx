import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import WindowTopBar from "./components/WindowTopBar";
import TabBar from "./components/TabBar";
import NewTabPage from "./components/NewTabPage";
import { useTabManager } from "./hooks/useTabManager";
import { useAppShortcuts } from "./hooks/useAppShortcuts";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts";
import ShortcutsHelp from "./components/ShortcutsHelp";

import "./App.less";

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // 使用标签管理 hook
  const {
    tabs,
    activeLabel,
    hasClosedTabs,
    openTab,
    closeTab,
    activateTab,
    reopenLastClosedTab,
    closeOtherTabs,
    refreshTab,
    navigateNewTab,
    layoutActiveWebview,
  } = useTabManager({ containerRef: containerRef as React.RefObject<HTMLDivElement> });

  // 快捷键操作函数
  const handleNewTabShortcut = () => {
    openTab();
  };

  const handleCloseTabShortcut = () => {
    if (activeLabel) {
      closeTab(activeLabel);
    }
  };

  const handleRefreshTabShortcut = () => {
    if (activeLabel) {
      refreshTab(activeLabel);
    }
  };

  const handleNextTabShortcut = () => {
    if (tabs.length <= 1) return;
    const currentIndex = tabs.findIndex(tab => tab.label === activeLabel);
    const nextIndex = (currentIndex + 1) % tabs.length;
    activateTab(tabs[nextIndex].label);
  };

  const handlePrevTabShortcut = () => {
    if (tabs.length <= 1) return;
    const currentIndex = tabs.findIndex(tab => tab.label === activeLabel);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    activateTab(tabs[prevIndex].label);
  };

  const handleSwitchTabShortcut = (index: number) => {
    if (index < tabs.length && index >= 0) {
      activateTab(tabs[index].label);
    } else if (index === 8 && tabs.length > 0) {
      // Ctrl+9 切换到最后一个标签
      activateTab(tabs[tabs.length - 1].label);
    }
  };

  // 窗口控制快捷键函数
  const handleMinimizeShortcut = async () => {
    try {
      const window = getCurrentWindow();
      await window.minimize();
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  };

  const handleToggleMaximizeShortcut = async () => {
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
  };

  const handleCloseWindowShortcut = async () => {
    try {
      const window = getCurrentWindow();
      await window.close();
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  };

  const handleHideAppShortcut = async () => {
    try {
      const window = getCurrentWindow();
      await window.hide();
    } catch (error) {
      console.error('Failed to hide app:', error);
    }
  };

  // 快捷键帮助处理函数
  const handleShowHelp = () => {
    setShowShortcutsHelp(true);
  };

  const handleHideHelp = () => {
    setShowShortcutsHelp(false);
  };

  // 初始化应用内快捷键 (只在应用有焦点时生效)
  useAppShortcuts({
    onNewTab: handleNewTabShortcut,
    onCloseTab: handleCloseTabShortcut,
    onReopenTab: reopenLastClosedTab,
    onRefreshTab: handleRefreshTabShortcut,
    onNextTab: handleNextTabShortcut,
    onPrevTab: handlePrevTabShortcut,
    onSwitchTab: handleSwitchTabShortcut,
    onMinimizeWindow: handleMinimizeShortcut,
    onToggleMaximize: handleToggleMaximizeShortcut,
    onCloseWindow: handleCloseWindowShortcut,
    onHideApp: handleHideAppShortcut,
    onShowHelp: handleShowHelp,
    onHideHelp: handleHideHelp,
  });

  // 初始化系统级全局快捷键 (应用在后台也能响应)
  useGlobalShortcuts({
    onNewTab: handleNewTabShortcut,
    onShowApp: () => {
      console.log('App shown via global shortcut');
    },
    onToggleVisibility: () => {
      console.log('App visibility toggled via global shortcut');
    },
  });

  // 显示标题栏右键菜单
  const handleContextMenu = async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      await invoke('show_titlebar_context_menu');
    } catch (error) {
      console.error('Failed to show context menu:', error);
    }
  };

  // 窗口控制函数
  const handleMinimize = async () => {
    try {
      const window = getCurrentWindow();
      await window.minimize();
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  };

  // 最大化窗口
  const handleMaximize = async () => {
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
  };

  // 关闭窗口
  const handleClose = async () => {
    try {
      const window = getCurrentWindow();
      await window.close();
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  };





  useEffect(() => {
    const onResize = () => {
      if (activeLabel) {
        layoutActiveWebview(activeLabel);
      }
    };

    // 监听窗口大小变化
    window.addEventListener("resize", onResize);

    // 也可以监听容器大小变化（使用 ResizeObserver）
    const container = containerRef.current;
    let resizeObserver: ResizeObserver | null = null;

    if (container) {
      resizeObserver = new ResizeObserver(() => {
        if (activeLabel) {
          layoutActiveWebview(activeLabel);
        }
      });
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [activeLabel]);

  // 监听来自Rust的标签菜单事件
  useEffect(() => {
    const unlistenRefresh = listen('tab-refresh', (event) => {
      const label = event.payload as string;
      refreshTab(label);
    });

    const unlistenClose = listen('tab-close', (event) => {
      const label = event.payload as string;
      closeTab(label);
    });

    const unlistenCloseOthers = listen('tab-close-others', (event) => {
      const label = event.payload as string;
      closeOtherTabs(label);
    });

    return () => {
      unlistenRefresh.then(f => f());
      unlistenClose.then(f => f());
      unlistenCloseOthers.then(f => f());
    };
  }, [tabs, activeLabel]);

  // 应用启动时创建默认新标签页
  useEffect(() => {
    if (tabs.length === 0) {
      openTab();
    }
  }, []); // 只在组件首次挂载时执行

  return (
    <>
      <main className="container">
        {/* Window Top Bar */}
        <WindowTopBar
          title="SideView Browser"
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          onClose={handleClose}
          onContextMenu={handleContextMenu}
        />

        {/* Tab Bar（控制主窗口内的多个 Webview）*/}
        <TabBar
          tabs={tabs}
          activeLabel={activeLabel}
          onActivateTab={activateTab}
          onCloseTab={closeTab}
          onCreateTab={openTab}
          onRefreshTab={refreshTab}
          onCloseOtherTabs={closeOtherTabs}
          hasClosedTabs={hasClosedTabs}
          onReopenTab={reopenLastClosedTab}
        />

        {/* Webview 容器区域：用于计算位置与大小 */}
        <div ref={containerRef} className="webview-container">
          {/* 显示新标签页内容 */}
          {activeLabel && tabs.find(tab => tab.label === activeLabel)?.isNewTab && (
            <NewTabPage onNavigate={navigateNewTab} />
          )}
        </div>
      </main>
      
      {/* 快捷键帮助弹窗 */}
      <ShortcutsHelp 
        isVisible={showShortcutsHelp} 
        onClose={handleHideHelp} 
      />
    </>
  );
}

export default App;
