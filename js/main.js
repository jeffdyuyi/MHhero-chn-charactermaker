/**
 * 漫画英雄 TRPG 车卡器
 * 主应用入口 - 一页式竖版极简核心
 */

import {
    getCharacterById,
    downloadFile,
    saveCharacter,
    deleteCharacter
} from './core/storage.js';

import { APP_CONFIG, POINT_BUY_CONFIG } from './data/index.js';
import { ViewManager } from './ui/view-manager.js';
import { CreationFlow } from './ui/creation-flow.js';
import { GuidedCreationFlow } from './ui/guided-creation-flow.js';
import { SavedCharactersView } from './ui/saved-characters.js';
import { openModal, closeModal, showCharacterDetail } from './ui/modal.js';
import { getEquipmentById, getAllEquipment } from './data/equipment.js';

// 注入全局装备库
window.getEquipmentById = getEquipmentById;
window.getAllEquipment = getAllEquipment;

/**
 * 应用主类
 */
class ComicHeroApp {
    constructor() {
        // 初始化各个模块
        this.viewManager = new ViewManager(this);
        this.creationFlow = new CreationFlow(this);
        this.guidedCreationFlow = new GuidedCreationFlow(this);
        this.savedCharactersView = new SavedCharactersView(this);

        this.init();
    }

    init() {
        console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} (一页式) 已加载`);

        // 绑定全局按钮事件
        this.bindGlobalEvents();

        // 初始化核心模块
        this.core = {
            storage: {
                getCharacterById,
                saveCharacter,
                deleteCharacter
            }
        };

        // 默认开启创建流程
        this.creationFlow.start();
    }

    bindGlobalEvents() {
        const logo = document.getElementById('logo');
        if (logo) {
            logo.onclick = () => this.showAuthorInfo();
        }
    }

    closeModal() {
        closeModal();
    }

    editCharacter(id) {
        const char = this.getCharacterById(id);
        if (char) {
            this.creationFlow.start(char.mode, id);
            // 填充数据
            this.creationFlow.characterGenerator.character = JSON.parse(JSON.stringify(char));
            this.creationFlow.renderFullSheet();
            this.viewManager.switchView('editor');
            window.scrollTo(0, 0);
        }
        this.closeModal();
    }

    exportSingleCharacter(id) {
        const char = this.getCharacterById(id);
        if (char) {
            const json = JSON.stringify(char, null, 2);
            downloadFile(json, `${char.name || 'hero'}.json`);
        }
    }

    showAuthorInfo() {
        openModal({
            title: '关于作者',
            content: `
                <div class="author-info" style="text-align: center; padding: 10px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🦸‍♂️</div>
                    <h3 style="margin-bottom: 15px; text-transform: uppercase; font-weight: 900;">漫画英雄 TRPG 车卡器</h3>
                    
                    <div style="text-align: left; background: var(--gray-100); padding: 15px; border: var(--comic-border-width) solid var(--black); margin-bottom: 15px; box-shadow: var(--comic-shadow-sm);">
                        <p style="margin-bottom: 8px;"><strong>制作者：</strong> 不咕鸟（哈基米德）</p>
                        <p style="margin-bottom: 8px;"><strong>AI辅助：</strong> Antigravity Gemini</p>
                        <p style="margin-bottom: 8px;"><strong>约团地址：</strong> <a href="https://nogubird.top/schedule" target="_blank">nogubird.top/schedule</a></p>
                        <p style="margin-bottom: 8px;"><strong>企鹅群(成都)：</strong> 691707475</p>
                        <p style="margin-bottom: 8px;"><strong>创想俱乐部：</strong> 261751459</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <a href="https://ifdian.net/a/nogubird" target="_blank" class="btn btn-primary" style="width: 100%; text-decoration: none; display: inline-block; padding: 10px;">
                            🚀 为作者加油 (ifdian.net)
                        </a>
                    </div>
                    
                    <p style="font-size: 12px; color: var(--text-muted);">版本: v${APP_CONFIG.version} | 基于 2d6 核心机制驱动</p>
                </div>
            `,
            size: 'small'
        });
    }

    getCharacterById(id) {
        return getCharacterById(id);
    }

    showCharacterDetail(id) {
        const char = this.getCharacterById(id);
        if (char) {
            showCharacterDetail(char);
        }
    }

    showPowerDetail(powerName) {
        window.showPowerDetailInModal(powerName);
    }
}

// 创建全局应用实例
const app = new ComicHeroApp();
window.app = app;

// 注册Service Worker
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

export default app;