import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import WindowTopBar from "./components/WindowTopBar";
import TabBar from "./components/TabBar";
import NewTabPage from "./components/NewTabPage";
import { useTabManager } from "./hooks/useTabManager";

import "./App.less";

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    </>
  );
}

export default App;
