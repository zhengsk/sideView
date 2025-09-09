import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import WindowTopBar from "./components/WindowTopBar";
import TabBar, { Tab } from "./components/TabBar";
import NewTabPage from "./components/NewTabPage";
import ApplicationMenu, { useApplicationMenu } from "./components/ApplicationMenu";

import "./App.less";

function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const labelCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // 使用应用菜单 Hook
  const applicationMenu = useApplicationMenu();

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
  async function openTab(url?: string, title: string = "新标签页") {
    const label = createLabel();
    const isNewTab = !url; // 如果没有URL，则为新标签页
    const finalTitle = title || (isNewTab ? title : url);

    if (isNewTab) {
      // 创建新标签页（不创建webview）
      setTabs((prev) => [...prev, { label, title: finalTitle, url: "", isNewTab: true }]);

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

      setTabs((prev) => [...prev, { label, title: finalTitle, url, isNewTab: false }]);

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

  /**
   * 关闭标签页
   * @param label 
   */
  async function closeTab(label: string) {
    const tabToClose = tabs.find(tab => tab.label === label);

    try {
      // 如果不是新标签页，隐藏 webview
      if (tabToClose && !tabToClose.isNewTab) {
        await invoke('hide_webview', { label });
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
          onContextMenu={applicationMenu.showMenu}
        />

        {/* Tab Bar（控制主窗口内的多个 Webview）*/}
        <TabBar
          tabs={tabs}
          activeLabel={activeLabel}
          onActivateTab={activateTab}
          onCloseTab={closeTab}
          onCreateTab={openTab}
        />

        {/* Webview 容器区域：用于计算位置与大小 */}
        <div ref={containerRef} className="webview-container">
          {/* 显示新标签页内容 */}
          {activeLabel && tabs.find(tab => tab.label === activeLabel)?.isNewTab && (
            <NewTabPage onNavigate={handleNewTabNavigate} />
          )}
        </div>
      </main>
      
      {/* 应用右键菜单 */}
      <ApplicationMenu
        visible={applicationMenu.visible}
        position={applicationMenu.position}
        onClose={applicationMenu.hideMenu}
        onSettingsClick={() => {
          console.log('打开设置页面 - 可扩展实现');
          // TODO: 实现设置页面逻辑
        }}
        onBeforeRestart={async () => {
          // 可以在重启前做一些清理工作
          console.log('即将重启应用，进行清理...');
          // 例如：保存用户数据、关闭所有标签页等
          return true; // 返回true继续重启，返回false取消重启
        }}
        onBeforeClose={async () => {
          // 可以在关闭前确认用户操作
          console.log('即将关闭应用...');
          // 例如：弹出确认对话框、保存状态等
          return true; // 返回true继续关闭，返回false取消关闭
        }}
      />
    </>
  );
}

export default App;
