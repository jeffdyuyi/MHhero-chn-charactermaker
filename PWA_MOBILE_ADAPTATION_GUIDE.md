# PWA 移动端适配技术参考文档

## 1. 什么是 PWA（渐进式 Web 应用）

PWA (Progressive Web App) 是一种结合了 Web 和原生应用优点的技术，它允许网页应用：

- **可安装**：用户可以将应用添加到主屏幕
- **离线可用**：通过 Service Worker 实现离线缓存
- **响应式**：适配各种屏幕尺寸
- **原生体验**：类似原生应用的交互体验
- **推送通知**：支持推送通知功能

## 2. 实现 PWA 的核心文件

### 2.1 manifest.json

`manifest.json` 文件定义了应用的基本信息，使浏览器能够将其识别为可安装的应用。

**基本结构**：

```json
{
  "name": "应用名称",
  "short_name": "短名称",
  "description": "应用描述",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4a9eff",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**关键配置项**：
- `name`：应用全名
- `short_name`：主屏幕上显示的短名称
- `start_url`：应用启动时打开的URL
- `display`：显示模式（standalone、fullscreen、minimal-ui、browser）
- `orientation`：默认方向（portrait、landscape）
- `icons`：应用图标，需要不同尺寸以适应不同设备

### 2.2 Service Worker (sw.js)

Service Worker 是一个后台运行的脚本，负责处理缓存、离线访问和推送通知等功能。

**基本结构**：

```javascript
const CACHE_NAME = 'app-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/manifest.json'
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// 拦截请求并从缓存响应
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then((networkResponse) => {
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    });
            })
    );
});
```

### 2.3 注册 Service Worker

在应用的主 JavaScript 文件中注册 Service Worker：

```javascript
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker 注册成功:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker 注册失败:', error);
            });
    });
}
```

## 3. 移动端适配最佳实践

### 3.1 响应式布局

使用 CSS 媒体查询实现响应式布局：

```css
/* 平板设备 */
@media (max-width: 768px) {
    .container {
        padding: 15px;
    }
    
    .nav-text {
        display: none;
    }
}

/* 移动设备 */
@media (max-width: 480px) {
    .sheet-container {
        padding: 10px;
        border-width: 2px;
    }
    
    .btn {
        padding: 8px 12px;
        font-size: 14px;
    }
}
```

### 3.2 触摸优化

为移动设备优化触摸体验：

```css
/* 移动端触摸优化 */
@media (hover: none) and (pointer: coarse) {
    .btn {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
    }
    
    input, select, textarea {
        touch-action: manipulation;
    }
}
```

### 3.3 视口设置

在 HTML 头部设置正确的视口：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 3.4 性能优化

- **图片优化**：使用适当尺寸和格式的图片
- **代码分割**：按需加载 JavaScript
- **缓存策略**：合理设置缓存策略
- **减少重排**：优化 DOM 操作

## 4. 实现步骤

### 步骤 1：创建 manifest.json

1. 在项目根目录创建 `manifest.json` 文件
2. 配置应用名称、图标等信息
3. 确保图标文件存在于指定路径

### 步骤 2：创建 Service Worker

1. 在项目根目录创建 `sw.js` 文件
2. 配置缓存策略和静态资源列表
3. 实现安装、激活和 fetch 事件处理

### 步骤 3：注册 Service Worker

在主 JavaScript 文件中添加 Service Worker 注册代码。

### 步骤 4：优化移动端适配

1. 添加响应式 CSS 媒体查询
2. 优化触摸体验
3. 确保所有元素在移动设备上显示正常

### 步骤 5：测试

1. 使用 Chrome 开发者工具的 Lighthouse 进行 PWA 审核
2. 在移动设备上测试安装和使用体验
3. 测试离线功能

## 5. 测试和部署

### 5.1 本地测试

1. 使用本地服务器（如 `http-server` 或 `live-server`）
2. 访问 `http://localhost:8080`
3. 打开 Chrome 开发者工具，使用 Device Toolbar 模拟移动设备
4. 运行 Lighthouse 审核

### 5.2 部署

1. 确保所有文件都已正确配置
2. 部署到支持 HTTPS 的服务器（PWA 要求 HTTPS）
3. 测试线上版本

### 5.3 验证

- 检查应用是否可以添加到主屏幕
- 测试离线功能
- 验证推送通知（如果实现）

## 6. 常见问题及解决方案

### 6.1 无法添加到主屏幕

**原因**：
- 缺少 manifest.json
- Service Worker 未正确注册
- 网站未使用 HTTPS

**解决方案**：
- 确保 manifest.json 正确配置并被引用
- 检查 Service Worker 注册代码
- 部署到支持 HTTPS 的服务器

### 6.2 离线功能不工作

**原因**：
- Service Worker 缓存策略错误
- 静态资源路径不正确

**解决方案**：
- 检查 Service Worker 代码中的缓存逻辑
- 确保静态资源路径正确
- 在浏览器开发者工具的 Application 标签页中检查缓存

### 6.3 移动端显示异常

**原因**：
- 响应式 CSS 未正确配置
- 视口设置不正确

**解决方案**：
- 检查媒体查询是否覆盖所有设备尺寸
- 确保视口设置正确
- 使用 Chrome 开发者工具的 Device Toolbar 测试不同设备

## 7. 技术栈和工具

### 7.1 核心技术

- **HTML5**：语义化标签
- **CSS3**：媒体查询、Flexbox、Grid
- **JavaScript**：ES6+
- **Service Worker**：离线缓存
- **Web App Manifest**：应用配置

### 7.2 工具

- **Lighthouse**：PWA 审核工具
- **Chrome DevTools**：调试和测试
- **http-server**：本地开发服务器
- **Webpack**：代码打包（可选）

## 8. 示例代码

### 8.1 完整的 manifest.json 示例

```json
{
  "name": "规则车卡工具",
  "short_name": "车卡工具",
  "description": "用于创建和管理TRPG角色卡的工具",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4a9eff",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 8.2 完整的 Service Worker 示例

```javascript
const CACHE_NAME = 'trpg-tool-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/manifest.json'
];

// 安装事件
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('缓存静态资源');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活事件
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

//  fetch 事件
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }
    
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then((networkResponse) => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    });
            })
    );
});
```

### 8.3 响应式 CSS 示例

```css
/* 基础样式 */
.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

/* 平板设备 */
@media (max-width: 768px) {
    .container {
        padding: 15px;
    }
    
    .nav-text {
        display: none;
    }
    
    .grid {
        grid-template-columns: 1fr;
    }
}

/* 移动设备 */
@media (max-width: 480px) {
    .container {
        padding: 10px;
    }
    
    .btn {
        padding: 8px 12px;
        font-size: 14px;
    }
    
    h1 {
        font-size: 1.5rem;
    }
    
    h2 {
        font-size: 1.2rem;
    }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
    .btn {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
    }
}
```

## 9. 结论

通过实现 PWA 技术和移动端适配，规则车卡工具可以：

1. **提供原生应用体验**：用户可以将工具添加到主屏幕，点击图标直接进入
2. **支持离线使用**：即使在没有网络的情况下也能正常工作
3. **适配各种设备**：在手机、平板和桌面设备上都能良好显示
4. **提升用户体验**：响应式设计和触摸优化确保流畅的使用体验

PWA 技术不仅适用于规则车卡工具，也可以应用到其他类似的网页工具中，为用户提供更好的使用体验。