/**
 * 视图管理模块
 * 处理页面导航和视图切换
 */

export class ViewManager {
    constructor(app) {
        this.app = app;
        this.currentView = 'editor';
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                if (view) {
                    this.switchView(view);
                }
            });
        });
    }

    switchView(viewName) {
        // 更新导航状态
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // 切换视图
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
        }

        // 视图特定逻辑
        if (viewName === 'saved') {
            this.app.savedCharactersView.loadCharacters();
        } else if (viewName === 'editor') {
            if (this.app.creationFlow) {
                this.app.creationFlow.renderFullSheet();
            }
        }
    }

    showSection(id) {
        // 在一页式布局中，section 切换可能不再需要
        // 但为了兼容性保留空实现或精简逻辑
        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden');
        }
    }
}
