/**
 * 漫画英雄 TRPG 车卡器
 * 主应用入口
 */

import {
    getCharacterById,
    downloadFile
} from './core/storage.js';

import { APP_CONFIG } from './data/index.js';
import { ViewManager } from './ui/view-manager.js';
import { CreationFlow } from './ui/creation-flow.js';
import { SavedCharactersView } from './ui/saved-characters.js';
import { openModal, closeModal, showCharacterDetail } from './ui/modal.js';

/**
 * 应用主类
 */
class ComicHeroApp {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';

        // 初始化各个模块
        this.viewManager = new ViewManager(this);
        this.creationFlow = new CreationFlow(this);
        this.savedCharactersView = new SavedCharactersView(this);

        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.initTheme();
        console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} 已加载`);

        // 绑定全局按钮事件 (不在模块内的)
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // 开始创建按钮
        document.querySelectorAll('.start-creation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.creationFlow.start(mode);
                this.viewManager.switchView('creation');
            });
        });
    }

    /**
     * 初始化主题
     */
    initTheme() {
        if (this.currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        this.updateThemeButton();
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';

        if (this.currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeButton();
    }

    /**
     * 更新主题按钮显示
     */
    updateThemeButton() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        const icon = toggleBtn.querySelector('.theme-icon');
        const text = toggleBtn.querySelector('.nav-text');

        if (this.currentTheme === 'dark') {
            toggleBtn.classList.add('active');
            if (icon) icon.textContent = '☀️';
            if (text) text.textContent = '亮色';
        } else {
            toggleBtn.classList.remove('active');
            if (icon) icon.textContent = '🌙';
            if (text) text.textContent = '暗色';
        }
    }

    closeModal() {
        closeModal();
    }

    editCharacter(id) {
        this.savedCharactersView.editCharacter(id);
        this.closeModal();
    }

    exportSingleCharacter(id) {
        const char = this.getCharacterById(id);
        if (char) {
            const json = JSON.stringify(char, null, 2);
            downloadFile(json, `${char.name || 'hero'}.json`);
        }
    }

    toggleHelp() {
        this.viewManager.switchView('help');
    }

    showHelp() {
        this.viewManager.switchView('help');
    }

    showAuthorInfo() {
        openModal({
            title: '关于作者',
            content: `
                <div class="author-info">
                    <p>漫画英雄 TRPG 车卡器 v${APP_CONFIG.version}</p>
                    <p>由 <strong>2d6 核心机制</strong> 驱动</p>
                    <p>致敬所有守护世界的超级英雄！</p>
                </div>
            `,
            size: 'small'
        });
    }

    // 辅助方法，暴露给模块使用
    getCharacterById(id) {
        return getCharacterById(id);
    }

    showCharacterDetail(id) {
        const char = this.getCharacterById(id);
        if (char) {
            showCharacterDetail(char);
        }
    }

    // 下面是一些 legacy 代理方法，为了兼容 HTML 中硬编码的 app.xxx 调用
    // 在 CreationFlow 和 SavedCharactersView 中已经更新了 onclick="app.xxx.yyy()"
    // 但为了保险，可以保留一些最常用的

    showPowerDetail(name) {
        showCharacterDetail(null, name); // 在 modal.js 中处理
    }
}

// 创建全局应用实例并导出
const app = new ComicHeroApp();
window.app = app; // 暴露到全局以便HTML中调用

export default app;