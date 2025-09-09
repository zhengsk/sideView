use tauri::{
    webview::WebviewBuilder, 
    LogicalPosition, 
    LogicalSize, 
    WebviewUrl, 
    Manager,
    menu::{MenuBuilder, MenuItemBuilder},
    AppHandle,
};

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

// 显示原生右键菜单
#[tauri::command]
async fn show_context_menu(app: AppHandle) -> Result<(), String> {
    let window = app.get_window("main").ok_or("Main window not found")?;
    
    // 创建右键菜单
    let settings_item = MenuItemBuilder::new("设置")
        .id("settings")
        .build(&app)
        .map_err(|e| format!("Failed to create menu item: {}", e))?;
    
    let restart_item = MenuItemBuilder::new("重启应用")
        .id("restart")
        .build(&app)
        .map_err(|e| format!("Failed to create menu item: {}", e))?;
    
    let quit_item = MenuItemBuilder::new("退出")
        .id("quit")
        .build(&app)
        .map_err(|e| format!("Failed to create menu item: {}", e))?;
    
    let menu = MenuBuilder::new(&app)
        .item(&settings_item)
        .item(&restart_item)
        .item(&quit_item)
        .build()
        .map_err(|e| format!("Failed to create menu: {}", e))?;
    
    // 显示右键菜单
    window.popup_menu(&menu)
        .map_err(|e| format!("Failed to show context menu: {}", e))?;
    
    Ok(())
}

// 处理菜单事件
fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    match event.id().as_ref() {
        "settings" => {
            // TODO: 打开设置窗口
            println!("打开设置");
        },
        "restart" => {
            // 重启应用
            app.restart();
        },
        "quit" => {
            // 退出应用
            app.exit(0);
        },
        _ => {}
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            create_embedded_webview, 
            resize_webview, 
            show_webview, 
            hide_webview, 
            set_webview_opacity,
            show_context_menu
        ])
        .on_menu_event(handle_menu_event)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
