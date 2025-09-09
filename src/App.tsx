import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import WindowTopBar from "./components/WindowTopBar";
import TabBar, { Tab, ClosedTab } from "./components/TabBar";
import NewTabPage from "./components/NewTabPage";

import "./App.less";

function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [closedTabs, setClosedTabs] = useState<ClosedTab[]>([]); // 存储已关闭的标签
  const labelCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // 处理新标签页导航
  const handleNewTabNavigate = async (url: string, title?: string) => {
    if (!activeLabel) return;

    const currentTab = tabs.find(tab => tab.label === activeLabel);
    if (!currentTab?.isNewTab) return;

    // 更新标签页为正常的webview标签页
    setTabs(prev => prev.map(tab =>
      tab.label === activeLabel
        ? { ...tab, url, title: title || url, isNewTab: false }
        : tab
    ));

    // 创建webview
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    const x = Math.round(rect.left * scale);
    const y = Math.round(rect.top * scale);
    const width = Math.round(rect.width * scale);
    const height = Math.round(rect.height * scale);

    try {
      await invoke('create_embedded_webview', {
        label: activeLabel,
        url,
        x: x / scale,
        y: y / scale,
        width: width / scale,
        height: height / scale
      });

      await invoke('show_webview', { label: activeLabel });
    } catch (error) {
      console.error('Failed to navigate new tab:', error);
    }
  };

  // 刷新标签页
  const handleRefreshTab = async (label: string) => {
    const tab = tabs.find(t => t.label === label);
    if (!tab || tab.isNewTab) return;

    try {
      // 刷新webview
      await invoke('refresh_webview', { label });
    } catch (error) {
      console.error('Failed to refresh tab:', error);
    }
  };

  /**
   * 关闭标签页
   * @param label 
   */
  async function closeTab(label: string) {
    const tabIndex = tabs.findIndex(tab => tab.label === label);
    const tabToClose = tabs[tabIndex];

    try {
      // 如果找到要关闭的标签，将其添加到已关闭标签列表（只保留最近10个）
      if (tabToClose && tabIndex !== -1) {
        const closedTab: ClosedTab = {
          ...tabToClose,
          originalIndex: tabIndex,
          closedAt: Date.now()
        };

        setClosedTabs(prev => {
          const newClosedTabs = [closedTab, ...prev];
          return newClosedTabs.slice(0, 10); // 只保留最近10个关闭的标签
        });

        // 如果不是新标签页，销毁 webview
        if (!tabToClose.isNewTab) {
          await invoke('destroy_webview', { label });
        }
      }

      // 从标签列表中移除
      setTabs((prev) => prev.filter((t) => t.label !== label));

      // 如果关闭的是当前活动标签，需要切换到其他标签或创建新标签页
      if (activeLabel === label) {
        const remainingTabs = tabs.filter((t) => t.label !== label);
        if (remainingTabs.length > 0) {
          // 切换到最后一个标签
          const newActiveTab = remainingTabs[remainingTabs.length - 1];
          setActiveLabel(newActiveTab.label);

          // 如果新活动标签不是新标签页，显示其webview
          if (!newActiveTab.isNewTab) {
            await invoke('show_webview', { label: newActiveTab.label });
          }
        } else {
          // 如果没有剩余标签，创建一个新的标签页
          openTab();
        }
      }
    } catch (error) {
      console.error('Failed to close tab:', error);
    }
  }

  /**
 * 重新打开最近关闭的标签页
 */
  async function reopenLastClosedTab() {
    if (closedTabs.length === 0) return;

    const tabToReopen = closedTabs[0];

    // 从已关闭标签列表中移除
    setClosedTabs(prev => prev.slice(1));

    // 计算恢复位置：确保位置有效
    let insertIndex = tabToReopen.originalIndex;
    const currentTabsCount = tabs.length;

    // 位置验证：如果原位置超出当前标签数量，则插入到末尾
    if (insertIndex > currentTabsCount) {
      insertIndex = currentTabsCount;
    }

    // 重新打开标签页到计算出的位置
    await openTab(
      tabToReopen.isNewTab ? undefined : tabToReopen.url,
      tabToReopen.title,
      insertIndex
    );
  }

  // 关闭其他标签页
  const handleCloseOtherTabs = async (keepLabel: string) => {
    const otherTabs = tabs.filter(tab => tab.label !== keepLabel);

    for (const tab of otherTabs) {
      try {
        if (!tab.isNewTab) {
          await closeTab(tab.label);
        }
      } catch (error) {
        console.error(`Failed to close tab ${tab.label}:`, error);
      }
    }

    setTabs(prev => prev.filter(tab => tab.label === keepLabel));
    setActiveLabel(keepLabel);
  };

  function createLabel() {
    labelCounter.current += 1;
    return `webview-tab-${labelCounter.current}`;
  }

  /**
   * 调整当前活动 webview 的大小和位置
   * @param label 
   */
  async function layoutActiveWebview(label: string) {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scale = 1;
    const x = Math.round(rect.left * scale);
    const y = Math.round(rect.top * scale);
    const width = Math.round(rect.width * scale);
    const height = Math.round(rect.height * scale);

    try {
      // 使用 Rust 命令调整 webview 大小和位置
      await invoke('resize_webview', {
        label,
        x: x / scale, // 转换为逻辑坐标
        // 加上窗口顶部栏的高度 (32px)
        y: y / scale,
        width: width / scale,
        height: height / scale
      });
    } catch (error) {
      console.error('Failed to resize webview:', error);
    }
  }

  /**
   * 打开新标签页
   * @param url 
   * @param title 
   */
  async function openTab(url?: string, title: string = "新标签页", insertIndex?: number) {
    const label = createLabel();
    const isNewTab = !url; // 如果没有URL，则为新标签页
    const finalTitle = title || (isNewTab ? title : url);

    if (isNewTab) {
      // 创建新标签页（不创建webview）
      setTabs((prev) => {
        const newTab = { label, title: finalTitle, url: "", isNewTab: true };
        if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= prev.length) {
          // 在指定位置插入
          return [...prev.slice(0, insertIndex), newTab, ...prev.slice(insertIndex)];
        }
        // 默认添加到末尾
        return [...prev, newTab];
      });

      // 隐藏当前活动的 webview
      if (activeLabel) {
        await invoke('hide_webview', { label: activeLabel });
      }

      setActiveLabel(label);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    const x = Math.round(rect.left * scale);
    const y = Math.round(rect.top * scale);
    const width = Math.round(rect.width * scale);
    const height = Math.round(rect.height * scale);

    try {
      // 使用 Rust 命令创建内嵌的 webview
      await invoke('create_embedded_webview', {
        label,
        url,
        x: x / scale, // 转换为逻辑坐标
        y: y / scale, // 加上窗口顶部栏的高度
        width: width / scale,
        height: height / scale // 减去顶部栏的高度
      });

      console.log('Webview created successfully');

      setTabs((prev) => {
        const newTab = { label, title: finalTitle, url, isNewTab: false };
        if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= prev.length) {
          // 在指定位置插入
          return [...prev.slice(0, insertIndex), newTab, ...prev.slice(insertIndex)];
        }
        // 默认添加到末尾
        return [...prev, newTab];
      });

      // 隐藏当前活动的 webview
      if (activeLabel) {
        await invoke('hide_webview', { label: activeLabel });
      }

      // 设置新创建的 webview 为活动状态并显示
      setActiveLabel(label);
      await invoke('show_webview', { label });

    } catch (error) {
      console.error(error);
    }
  }

  /**
   * 激活标签页
   * @param label 
   */
  async function activateTab(label: string) {
    // 如果点击的是当前活动标签，不做任何操作
    if (activeLabel === label) return;

    const targetTab = tabs.find(tab => tab.label === label);

    try {
      // 隐藏当前活动的 webview
      if (activeLabel) {
        const currentTab = tabs.find(tab => tab.label === activeLabel);
        if (currentTab && !currentTab.isNewTab) {
          await invoke('hide_webview', { label: activeLabel });
        }
      }

      // 设置新的活动标签
      setActiveLabel(label);

      // 如果是新标签页，不需要操作webview
      if (targetTab?.isNewTab) {
        return;
      }

      // 调整新标签的 webview 大小和位置
      await layoutActiveWebview(label);

      // 显示新的活动 webview
      await invoke('show_webview', { label });
    } catch (error) {
      console.error('Failed to activate tab:', error);
    }
  }

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
      handleRefreshTab(label);
    });

    const unlistenClose = listen('tab-close', (event) => {
      const label = event.payload as string;
      closeTab(label);
    });

    const unlistenCloseOthers = listen('tab-close-others', (event) => {
      const label = event.payload as string;
      handleCloseOtherTabs(label);
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
          onRefreshTab={handleRefreshTab}
          onCloseOtherTabs={handleCloseOtherTabs}
          hasClosedTabs={closedTabs.length > 0}
          onReopenTab={reopenLastClosedTab}
        />

        {/* Webview 容器区域：用于计算位置与大小 */}
        <div ref={containerRef} className="webview-container">
          {/* 显示新标签页内容 */}
          {activeLabel && tabs.find(tab => tab.label === activeLabel)?.isNewTab && (
            <NewTabPage onNavigate={handleNewTabNavigate} />
          )}
        </div>
      </main>
    </>
  );
}

export default App;
