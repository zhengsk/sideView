import { useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tab, ClosedTab } from "../components/TabBar";

export interface UseTabManagerProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useTabManager({ containerRef }: UseTabManagerProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [closedTabs, setClosedTabs] = useState<ClosedTab[]>([]);
  const labelCounter = useRef(0);

  /**
   * 生成唯一标签 ID
   */
  function createLabel(): string {
    return `tab-${labelCounter.current++}`;
  }

  /**
   * 布局活动 webview
   */
  async function layoutActiveWebview(label: string) {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    const x = Math.round(rect.left * scale);
    const y = Math.round(rect.top * scale);
    const width = Math.round(rect.width * scale);
    const height = Math.round(rect.height * scale);

    try {
      await invoke('resize_webview', {
        label,
        x: x / scale,
        y: y / scale,
        width: width / scale,
        height: height / scale,
      });
    } catch (error) {
      console.error('Failed to layout webview:', error);
    }
  }

  /**
   * 打开新标签页
   */
  async function openTab(url?: string, title: string = "新标签页", insertIndex?: number) {
    const label = createLabel();
    const isNewTab = !url;
    const finalTitle = title || (isNewTab ? title : url);

    if (isNewTab) {
      // 创建新标签页（不创建webview）
      setTabs((prev) => {
        const newTab = { label, title: finalTitle, url: "", isNewTab: true };
        if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= prev.length) {
          return [...prev.slice(0, insertIndex), newTab, ...prev.slice(insertIndex)];
        }
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
        x: x / scale,
        y: y / scale,
        width: width / scale,
        height: height / scale
      });

      console.log('Webview created successfully');

      setTabs((prev) => {
        const newTab = { label, title: finalTitle, url, isNewTab: false };
        if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= prev.length) {
          return [...prev.slice(0, insertIndex), newTab, ...prev.slice(insertIndex)];
        }
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
      console.error('Failed to create webview:', error);
    }
  }

  /**
   * 关闭标签页
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
          return newClosedTabs.slice(0, 10);
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
   * 激活标签页
   */
  async function activateTab(label: string) {
    const tab = tabs.find(t => t.label === label);
    if (!tab) return;

    try {
      // 隐藏当前活动的 webview
      if (activeLabel && activeLabel !== label) {
        const activeTab = tabs.find(t => t.label === activeLabel);
        if (activeTab && !activeTab.isNewTab) {
          await invoke('hide_webview', { label: activeLabel });
        }
      }

      setActiveLabel(label);

      // 如果不是新标签页，显示并布局新的活动 webview
      if (!tab.isNewTab) {
        await layoutActiveWebview(label);
        await invoke('show_webview', { label });
      }
    } catch (error) {
      console.error('Failed to activate tab:', error);
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

  /**
   * 关闭其他标签页
   */
  async function closeOtherTabs(keepLabel: string) {
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
  }

  /**
   * 刷新标签页
   */
  async function refreshTab(label: string) {
    try {
      await invoke('refresh_webview', { label });
    } catch (error) {
      console.error('Failed to refresh tab:', error);
    }
  }

  /**
   * 新标签页导航 - 将新标签页转换为普通webview标签页
   */
  async function navigateNewTab(url: string, title?: string) {
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
  }

  return {
    // 状态
    tabs,
    activeLabel,
    closedTabs,

    // 操作函数
    openTab,
    closeTab,
    activateTab,
    reopenLastClosedTab,
    closeOtherTabs,
    refreshTab,
    navigateNewTab,
    layoutActiveWebview,

    // 工具函数
    createLabel,

    // 计算属性
    hasClosedTabs: closedTabs.length > 0,
  };
}