/**
 * 已存角色管理模块
 * 处理角色列表显示、搜索、排序、导入和导出
 */

import {
    getSavedCharacters,
    deleteCharacter,
    searchCharacters,
    sortCharacters,
    exportAllCharacters,
    downloadFile,
    readFile,
    importCharacters
} from '../core/storage.js';

import { showSuccess, showError, showInfo } from './toast.js';
import { showConfirm, showCharacterDetail } from './modal.js';

export class SavedCharactersView {
    constructor(app) {
        this.app = app;
        this.searchQuery = '';
        this.sortBy = 'newest';
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const searchInput = document.getElementById('search-characters');
        const sortSelect = document.getElementById('sort-characters');
        const exportAllBtn = document.getElementById('export-all-btn');
        const importBtn = document.getElementById('import-characters-btn');
        const importFileInput = document.getElementById('import-file-input');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.loadCharacters();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.loadCharacters();
            });
        }

        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAll());
        }

        if (importBtn && importFileInput) {
            importBtn.addEventListener('click', () => importFileInput.click());
            importFileInput.addEventListener('change', (e) => this.handleImport(e));
        }
    }

    loadCharacters() {
        const container = document.getElementById('saved-characters-list');
        if (!container) return;

        let characters = getSavedCharacters();

        // 搜索过滤
        if (this.searchQuery) {
            characters = searchCharacters(this.searchQuery);
        }

        // 排序
        characters = sortCharacters(characters, this.sortBy);

        if (characters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>${this.searchQuery ? '没有找到符合条件的角色' : '还没有保存任何角色'}</p>
                    <button class="btn btn-primary" onclick="app.viewManager.switchView('home')">去创建一个</button>
                </div>
            `;
            return;
        }

        container.innerHTML = characters.map(char => this.createCharacterCard(char)).join('');
    }

    createCharacterCard(character) {
        return `
            <div class="character-card">
                <div class="char-header">
                    <h4>${character.name || '未命名英雄'}</h4>
                    <span class="char-mode-badge ${character.mode}">${character.mode === 'random' ? '🎲' : '🎯'}</span>
                </div>
                <div class="char-info">
                    <span class="char-origin">${character.origin?.name || '未知起源'}</span>
                    <span class="char-stats">耐力: ${character.stamina} | 决意: ${character.resolve}</span>
                </div>
                <div class="char-powers-preview">
                    ${character.powers.slice(0, 3).map(p => `<span class="power-tag">${p.name}</span>`).join('')}
                    ${character.powers.length > 3 ? '<span class="power-tag">...</span>' : ''}
                </div>
                <div class="char-actions">
                    <button class="btn btn-sm btn-secondary" onclick="app.savedCharactersView.viewCharacter('${character.id}')">详情</button>
                    <button class="btn btn-sm btn-secondary" onclick="app.savedCharactersView.editCharacter('${character.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="app.savedCharactersView.confirmDelete('${character.id}')">删除</button>
                </div>
            </div>
        `;
    }

    viewCharacter(id) {
        const character = this.app.getCharacterById(id);
        if (character) {
            showCharacterDetail(character);
        }
    }

    editCharacter(id) {
        const character = this.app.getCharacterById(id);
        if (character) {
            this.app.creationFlow.start(character.mode, id);
            // 填充已有数据
            this.app.creationFlow.characterGenerator.character = JSON.parse(JSON.stringify(character));
            this.app.creationFlow.currentStep = 1;
            this.app.viewManager.switchView('creation');
            this.app.creationFlow.renderStep();
        }
    }

    confirmDelete(id) {
        showConfirm('确定要删除这个角色吗？此操作不可恢复。', () => {
            if (deleteCharacter(id)) {
                showSuccess('角色已删除');
                this.loadCharacters();
            } else {
                showError('删除失败');
            }
        });
    }

    exportAll() {
        const json = exportAllCharacters();
        downloadFile(json, `comic-heroes-all-${new Date().toISOString().slice(0, 10)}.json`);
        showSuccess('已导出所有角色数据');
    }

    async handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const json = await readFile(file);
            const result = importCharacters(json);
            if (result.success) {
                showSuccess(`导入成功！成功: ${result.imported}, 失败: ${result.failed}`);
                this.loadCharacters();
            } else {
                showError('导入失败: ' + (result.error || '未知错误'));
            }
        } catch (error) {
            showError('读取文件失败');
            console.error(error);
        } finally {
            event.target.value = ''; // 重置input
        }
    }
}
