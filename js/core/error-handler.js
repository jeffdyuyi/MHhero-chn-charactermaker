class ErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        // 全局错误捕获
        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });
    }

    handleError(error) {
        console.error('Error:', error);
        // 显示友好的错误提示
        this.showError(`发生错误: ${error.message || '未知错误'}`);
    }

    showError(message) {
        // 显示错误提示
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
            errorElement.remove();
        }, 3000);
    }

    showSuccess(message) {
        // 显示成功提示
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;
        document.body.appendChild(successElement);
        
        setTimeout(() => {
            successElement.remove();
        }, 3000);
    }

    showInfo(message) {
        // 显示信息提示
        const infoElement = document.createElement('div');
        infoElement.className = 'info-message';
        infoElement.textContent = message;
        document.body.appendChild(infoElement);
        
        setTimeout(() => {
            infoElement.remove();
        }, 3000);
    }
}

export const errorHandler = new ErrorHandler();