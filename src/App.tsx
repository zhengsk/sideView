import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { Webview } from "@tauri-apps/api/webview";
import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWindow } from "@tauri-apps/api/window";


import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [tabs, setTabs] = useState<Array<{ label: string; title: string; url: string }>>([]);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const labelCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  function createLabel() {
    labelCounter.current += 1;
    return `tab-${labelCounter.current}`;
  }

  async function layoutActiveWebview(label: string) {
    debugger;
    const view = await Webview.getByLabel(label);
    if (!view) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    const x = Math.round(rect.left * scale);
    const y = Math.round(rect.top * scale);
    const width = Math.round(rect.width * scale);
    const height = Math.round(rect.height * scale);
    await view.setPosition(new PhysicalPosition(x, y));
    try {
      await view.setSize(new PhysicalSize(width, height));
    } catch (error) {
      debugger;
      console.error(error);
    }
  }

  async function openTab(url: string, title?: string) {
    debugger;
    // const label = createLabel();
    const label = 'theUniqueLabel';
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    const x = Math.round(rect.left * scale);
    const y = Math.round(rect.top * scale);
    const width = Math.round(rect.width * scale);
    const height = Math.round(rect.height * scale);

    try {
      const win = await getCurrentWindow();

      debugger;

      const view = new Webview(win, label, { url, x, y, width, height });


      await new Promise<void>((resolve, reject) => {
        view.once("tauri://created", () => resolve());
        view.once("tauri://error", (e) => {
          debugger;
          console.error(e);
          console.info(e.payload);
          reject(e);
        });
      });

      setTabs((prev) => [...prev, { label, title: title ?? url, url }]);
      setActiveLabel(label);

      await layoutActiveWebview(label);
      await view.show();
      await view.setFocus();

    } catch (error) {
      debugger;
      console.error(error);
    }
  }

  async function activateTab(label: string) {
    // 隐藏当前活动 webview
    if (activeLabel) {
      const current = await Webview.getByLabel(activeLabel);
      await current?.hide();
    }
    setActiveLabel(label);
    await layoutActiveWebview(label);
    const view = await Webview.getByLabel(label);
    await view?.show();
    await view?.setFocus();
  }

  async function closeTab(label: string) {
    const view = await Webview.getByLabel(label);
    await view?.hide();
    await view?.close();
    setTabs((prev) => prev.filter((t) => t.label !== label));
    setActiveLabel((curr) => (curr === label ? null : curr));
  }

  // useEffect(() => {
  //   // 初始打开一个花瓣网 tab
  //   openTab("https://huaban.com", "花瓣网");

  //   const onResize = () => {
  //     if (activeLabel) {
  //       layoutActiveWebview(activeLabel);
  //     }
  //   };
  //   window.addEventListener("resize", onResize);

  //   return () => {
  //     window.removeEventListener("resize", onResize);
  //     tabs.forEach((t) => {
  //       Webview.getByLabel(t.label).then((v) => v?.close());
  //     });
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>

      {/* Tab Bar（控制主窗口内的多个 Webview）*/}
      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
              style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #3a3a3a", background: "#1a1a1a", color: "#bbb" }}
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
      <div ref={containerRef} style={{ marginTop: 12, width: "100%", height: "70vh", border: "1px solid #2f2f2f", borderRadius: 8 }} />
    </main>
  );
}

export default App;
