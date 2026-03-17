/**
 * 视图管理模块
 * 处理页面导航和视图切换
 */

export class ViewManager {
    constructor(app) {
        this.app = app;
        this.currentView = 'home';
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                if (view === 'theme') {
                    this.app.toggleTheme();
                } else {
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
        }
        
        // 如果切离创建页面，重置创建状态（如果未保存）
        if (viewName !== 'creation' && this.app.creationFlow?.isCreating) {
            // 这里可以加一个确认逻辑，但为了简单暂且不加
        }
    }

    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
    }
}
