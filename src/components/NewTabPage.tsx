import { useState, useRef, useEffect } from "react";
import "./NewTabPage.less";

interface NewTabPageProps {
  onNavigate: (url: string, title?: string) => void;
}

export default function NewTabPage({ onNavigate }: NewTabPageProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦到输入框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 判断输入是否为有效URL
  const isValidUrl = (str: string): boolean => {
    const trimmed = str.trim();
    
    // 如果已经包含协议，直接验证
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        new URL(trimmed);
        return true;
      } catch {
        return false;
      }
    }
    
    // 检查是否像域名：至少包含一个点，且不包含空格
    if (!trimmed.includes('.') || trimmed.includes(' ')) {
      return false;
    }
    
    // 检查域名格式：字母、数字、点、连字符
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // 分离可能的路径部分
    const parts = trimmed.split('/');
    const domain = parts[0];
    
    // 验证域名部分
    if (!domainPattern.test(domain)) {
      return false;
    }
    
    // 检查顶级域名至少2个字符
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    
    return tld.length >= 2 && /^[a-zA-Z]+$/.test(tld);
  };

  // 格式化URL
  const formatUrl = (input: string): string => {
    const trimmed = input.trim();
    
    // 如果已经是完整URL，直接返回
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // 如果看起来像域名，添加https://
    if (isValidUrl(trimmed)) {
      return `https://${trimmed}`;
    }
    
    // 否则作为搜索词，使用Google搜索
    return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
  };

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    if (value.trim()) {
      // 生成搜索建议
      const newSuggestions = [
        `在 Google 中搜索 "${value}"`,
        ...(isValidUrl(value) ? [`访问 ${value}`] : [])
      ];
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 处理提交
  const handleSubmit = (inputValue: string) => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const url = formatUrl(trimmed);
    const title = isValidUrl(trimmed) ? trimmed : `搜索: ${trimmed}`;
    
    onNavigate(url, title);
  };

  // 处理快捷网站点击
  const handleQuickSite = (url: string, title: string) => {
    onNavigate(url, title);
  };

  // 常用网站
  const quickSites = [
    { title: "百度", url: "https://www.baidu.com", icon: "🔍" },
    { title: "GitHub", url: "https://github.com", icon: "💻" },
    { title: "YouTube", url: "https://youtube.com", icon: "📺" },
    { title: "ChatGPT", url: "https://chat.openai.com", icon: "🤖" },
    { title: "花瓣网", url: "https://huaban.com", icon: "🎨" },
    { title: "知乎", url: "https://zhihu.com", icon: "💡" },
    { title: "掘金", url: "https://juejin.cn", icon: "⛏️" },
    { title: "V2EX", url: "https://v2ex.com", icon: "🌐" },
  ];

  return (
    <div className="new-tab-page">
      <div className="new-tab-content">
        {/* Logo 和标题 */}
        <div className="new-tab-header">
          <div className="logo">🌐</div>
          <h1>SideView Browser</h1>
          <p>输入网址或搜索内容</p>
        </div>

        {/* 地址栏 */}
        <div className="address-bar-container">
          <div className="address-bar">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(inputValue);
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false);
                }
              }}
              placeholder="输入网址或搜索词..."
              className="address-input"
            />
            <button
              onClick={() => handleSubmit(inputValue)}
              className="submit-button"
              disabled={!inputValue.trim()}
            >
              Go
            </button>
          </div>

          {/* 搜索建议 */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSubmit(inputValue)}
                >
                  <span className="suggestion-icon">
                    {suggestion.includes('搜索') ? '🔍' : '🌐'}
                  </span>
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 快捷网站 */}
        <div className="quick-sites">
          <h3>常用网站</h3>
          <div className="sites-grid">
            {quickSites.map((site, index) => (
              <div
                key={index}
                className="site-card"
                onClick={() => handleQuickSite(site.url, site.title)}
                title={site.url}
              >
                <div className="site-icon">{site.icon}</div>
                <div className="site-title">{site.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 搜索引擎选择 */}
        <div className="search-engines">
          <span>快速搜索:</span>
          <button
            onClick={() => handleSubmit(inputValue || "SideView Browser")}
            className="search-engine-btn"
          >
            🔍 Google
          </button>
          <button
            onClick={() => onNavigate(`https://www.baidu.com/s?wd=${encodeURIComponent(inputValue || "SideView Browser")}`, `百度搜索: ${inputValue || "SideView Browser"}`)}
            className="search-engine-btn"
          >
            🔍 百度
          </button>
          <button
            onClick={() => onNavigate(`https://bing.com/search?q=${encodeURIComponent(inputValue || "SideView Browser")}`, `必应搜索: ${inputValue || "SideView Browser"}`)}
            className="search-engine-btn"
          >
            🔍 必应
          </button>
        </div>
      </div>
    </div>
  );
}