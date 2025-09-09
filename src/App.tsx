import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import WindowTopBar from "./components/WindowTopBar";

import "./App.less";

function App() {
  const [tabs, setTabs] = useState<Array<{ label: string; title: string; url: string }>>([]);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const labelCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  async function openTab(url: string, title?: string) {
    const label = createLabel();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    const x = Math.round(rect.left * scale);
    const y = Math.round(rect.top * scale);
    const width = Math.round(rect.width * scale);
    const height = Math.round(rect.height * scale);

    console.info(x, y, width, height, scale);

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

      setTabs((prev) => [...prev, { label, title: title ?? url, url }]);

      // 隐藏当前活动的 webview
      if (activeLabel) {
        await invoke('hide_webview', { label: activeLabel });
      }

      // 设置新创建的 webview 为活动状态并显示
      setActiveLabel(label);
      await invoke('show_webview', { label });

      // 设置 webview 透明度为 50%
      // await invoke('set_webview_opacity', { label, opacity: 0.5 });

    } catch (error) {
      console.error(error);
    }
  }

  async function activateTab(label: string) {
    // 如果点击的是当前活动标签，不做任何操作
    if (activeLabel === label) return;

    try {
      // 隐藏当前活动的 webview
      if (activeLabel) {
        await invoke('hide_webview', { label: activeLabel });
      }

      // 设置新的活动标签
      setActiveLabel(label);

      // 调整新标签的 webview 大小和位置
      await layoutActiveWebview(label);

      // 显示新的活动 webview
      await invoke('show_webview', { label });
    } catch (error) {
      console.error('Failed to activate tab:', error);
    }
  }

  async function closeTab(label: string) {
    try {
      // 隐藏要关闭的 webview
      await invoke('hide_webview', { label });

      // 从标签列表中移除
      setTabs((prev) => prev.filter((t) => t.label !== label));

      // 如果关闭的是当前活动标签，需要切换到其他标签或清空
      if (activeLabel === label) {
        const remainingTabs = tabs.filter((t) => t.label !== label);
        if (remainingTabs.length > 0) {
          // 切换到最后一个标签
          const newActiveLabel = remainingTabs[remainingTabs.length - 1].label;
          setActiveLabel(newActiveLabel);
          await invoke('show_webview', { label: newActiveLabel });
        } else {
          setActiveLabel(null);
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

  return (
    <main className="container">
      {/* Window Top Bar */}
      <WindowTopBar
        title="SideView Browser"
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
      />

      {/* Tab Bar（控制主窗口内的多个 Webview）*/}
      <div className="tab-bar">
        {tabs.map((t) => (
          <div key={t.label} className="tab-bar-item">
            <button
              onClick={() => activateTab(t.label)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: activeLabel === t.label ? "2px solid #646cff" : "1px solid #3a3a3a",
                background: activeLabel === t.label ? "#2a2a2a" : "#1a1a1a",
                color: "#fff",
                cursor: "pointer",
              }}
              title={t.url}
            >
              {t.title}
            </button>
            <button
              onClick={() => closeTab(t.label)}
              className="tab-bar-item-close-button"
              aria-label={`close ${t.title}`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => openTab("https://huaban.com", "花瓣网")}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #3a3a3a", background: "#1a1a1a", color: "#fff" }}
        >
          + 新建标签
        </button>
      </div>

      {/* Webview 容器区域：用于计算位置与大小 */}
      <div ref={containerRef} className="webview-container" />
    </main>
  );
}

export default App;
