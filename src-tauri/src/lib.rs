use tauri::{webview::WebviewBuilder, LogicalPosition, LogicalSize, WebviewUrl, Manager};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn create_embedded_webview(
    app: tauri::AppHandle,
    label: String,
    url: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    // 获取主窗口 - 使用 get_window 而不是 get_webview_window
    let main_window = app.get_window("main").ok_or("Main window not found")?;
    
    // 创建 webview builder
    let webview_builder = WebviewBuilder::new(
        &label,
        WebviewUrl::External(url.parse().map_err(|e| format!("Invalid URL: {}", e))?),
    );
    
    // 将 webview 作为子视图添加到主窗口
    main_window
        .add_child(
            webview_builder,
            LogicalPosition::new(x, y),
            LogicalSize::new(width, height),
        )
        .map_err(|e| format!("Failed to create webview: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn resize_webview(
    app: tauri::AppHandle,
    label: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    // 获取指定的 webview
    if let Some(webview) = app.get_webview(&label) {
        webview
            .set_position(LogicalPosition::new(x, y))
            .map_err(|e| format!("Failed to set position: {}", e))?;
        
        webview
            .set_size(LogicalSize::new(width, height))
            .map_err(|e| format!("Failed to set size: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
async fn show_webview(app: tauri::AppHandle, label: String) -> Result<(), String> {
    if let Some(webview) = app.get_webview(&label) {
        webview
            .show()
            .map_err(|e| format!("Failed to show webview: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
async fn hide_webview(app: tauri::AppHandle, label: String) -> Result<(), String> {
    if let Some(webview) = app.get_webview(&label) {
        webview
            .hide()
            .map_err(|e| format!("Failed to hide webview: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
async fn set_webview_opacity(
    app: tauri::AppHandle,
    label: String,
    opacity: f64,
) -> Result<(), String> {
    if let Some(webview) = app.get_webview(&label) {
        // 注意：这里使用 eval 来设置 webview 容器的透明度
        let script = format!(
            r#"
            // 设置 webview 容器的透明度
            document.documentElement.style.opacity = '{}';
            if (document.body) {{
                document.body.style.opacity = '{}';
            }}
            // 设置所有元素的透明度
            const style = document.createElement('style');
            style.textContent = `
                html, body {{
                    opacity: {} !important;
                }}
            `;
            document.head.appendChild(style);
            "#,
            opacity, opacity, opacity
        );
        
        webview
            .eval(&script)
            .map_err(|e| format!("Failed to set opacity: {}", e))?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, create_embedded_webview, resize_webview, show_webview, hide_webview, set_webview_opacity])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
