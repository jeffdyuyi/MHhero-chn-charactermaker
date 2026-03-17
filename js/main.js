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
        // 漫画风格固定单主题，移除主题切换逻辑

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
        console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} 已加载`);

        // 绑定全局按钮事件
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // LOGO 点击显示作者信息
        const logo = document.getElementById('logo');
        if (logo) {
            logo.addEventListener('click', () => this.showAuthorInfo());
        }

        // 开始创建按钮
        document.querySelectorAll('.start-creation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.creationFlow.start(mode);
                this.viewManager.switchView('creation');
            });
        });
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
                <div class="author-info" style="text-align: center; padding: 10px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🦸‍♂️</div>
                    <h3 style="margin-bottom: 15px; text-transform: uppercase;">漫画英雄 TRPG 车卡器</h3>
                    
                    <div style="text-align: left; background: var(--gray-100); padding: 15px; border: 2px solid var(--black); margin-bottom: 15px;">
                        <p style="margin-bottom: 8px;"><strong>制作者：</strong> 不咕鸟（哈基米德）</p>
                        <p style="margin-bottom: 8px;"><strong>AI辅助：</strong> Antigravity Gemini</p>
                        <p style="margin-bottom: 8px;"><strong>约团地址：</strong> <a href="https://nogubird.top/schedule" target="_blank">nogubird.top/schedule</a></p>
                        <p style="margin-bottom: 8px;"><strong>成都秘密基地企鹅：</strong> 691707475</p>
                        <p style="margin-bottom: 8px;"><strong>不咕鸟TRPG创想俱乐部：</strong> 261751459</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <a href="https://ifdian.net/a/nogubird" target="_blank" class="btn btn-primary" style="width: 100%; text-decoration: none;">
                            🚀 为作者加油 (ifdian.net)
                        </a>
                    </div>
                    
                    <p style="font-size: 12px; color: var(--text-muted);">版本: v${APP_CONFIG.version} | 基于 2d6 核心机制驱动</p>
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

    showPowerDetail(name) {
        showCharacterDetail(null, name);
    }
}

// 创建全局应用实例并导出
const app = new ComicHeroApp();
window.app = app;

export default app;