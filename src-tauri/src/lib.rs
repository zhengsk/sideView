use tauri::{
    webview::WebviewBuilder, 
    LogicalPosition, 
    LogicalSize, 
    WebviewUrl, 
    Manager,
    menu::{MenuBuilder, MenuItemBuilder},
    AppHandle,
    Emitter,
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
async fn destroy_webview(app: tauri::AppHandle, label: String) -> Result<(), String> {
    if let Some(webview) = app.get_webview(&label) {
        webview
            .close()
            .map_err(|e| format!("Failed to destroy webview: {}", e))?;
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

// 显示标题栏右键菜单
#[tauri::command]
async fn show_titlebar_context_menu(app: AppHandle) -> Result<(), String> {
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

// 显示标签页右键菜单
#[tauri::command]
async fn show_tab_context_menu(app: AppHandle, tab_label: String, total_tabs: usize) -> Result<(), String> {
    let window = app.get_window("main").ok_or("Main window not found")?;
    
    // 创建标签页右键菜单项
    let refresh_item = MenuItemBuilder::new("刷新")
        .id(&format!("refresh_{}", tab_label))
        .build(&app)
        .map_err(|e| format!("Failed to create menu item: {}", e))?;
    
    let close_item = MenuItemBuilder::new("关闭")
        .id(&format!("close_{}", tab_label))
        .build(&app)
        .map_err(|e| format!("Failed to create menu item: {}", e))?;
    
    let close_others_item = MenuItemBuilder::new("关闭其他")
        .id(&format!("close_others_{}", tab_label))
        .enabled(total_tabs > 1) // 只有多个标签时才启用
        .build(&app)
        .map_err(|e| format!("Failed to create menu item: {}", e))?;
    
    let menu = MenuBuilder::new(&app)
        .item(&refresh_item)
        .separator()
        .item(&close_item)
        .item(&close_others_item)
        .build()
        .map_err(|e| format!("Failed to create menu: {}", e))?;
    
    // 显示右键菜单
    window.popup_menu(&menu)
        .map_err(|e| format!("Failed to show context menu: {}", e))?;
    
    Ok(())
}

// 处理菜单事件
fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    let menu_id = event.id().as_ref();
    
    // 标题栏菜单事件
    match menu_id {
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
        _ => {
            // 处理标签页菜单事件
            if let Some(tab_label) = extract_tab_label_from_menu_id(menu_id) {
                // 发送事件到前端处理
                if let Some(window) = app.get_window("main") {
                    let event_name = if menu_id.starts_with("refresh_") {
                        "tab-refresh"
                    } else if menu_id.starts_with("close_") && !menu_id.starts_with("close_others_") && !menu_id.starts_with("close_right_") {
                        "tab-close"
                    } else if menu_id.starts_with("close_others_") {
                        "tab-close-others"
                    } else {
                        return;
                    };
                    
                    let _ = window.emit(event_name, &tab_label);
                }
            }
        }
    }
}

// 从菜单ID中提取标签label
fn extract_tab_label_from_menu_id(menu_id: &str) -> Option<String> {
    if let Some(pos) = menu_id.rfind('_') {
        if pos + 1 < menu_id.len() {
            return Some(menu_id[pos + 1..].to_string());
        }
    }
    None
}

// 刷新webview
#[tauri::command]
async fn refresh_webview(app: AppHandle, label: String) -> Result<(), String> {
    if let Some(webview) = app.get_webview(&label) {
        webview.eval(&format!(
            r#"
            window.location.reload();
            "#
        ))
        .map_err(|e| format!("Failed to refresh webview: {}", e))?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            create_embedded_webview, // 创建webview
            resize_webview, // 调整webview大小
            show_webview, // 显示webview
            hide_webview, // 隐藏webview
            destroy_webview, // 销毁webview
            set_webview_opacity, // 设置webview透明度
            show_titlebar_context_menu, // 标题栏右键菜单
            show_tab_context_menu, // 标签页右键菜单
            refresh_webview, // 刷新webview
        ])
        .on_menu_event(handle_menu_event)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
