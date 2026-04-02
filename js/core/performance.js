export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function optimizeRendering() {
    // 实现虚拟DOM或增量渲染
    // 这里提供一个简单的DOM操作优化方法
    return {
        createElement: (tag, attributes, children) => {
            const element = document.createElement(tag);
            
            if (attributes) {
                Object.entries(attributes).forEach(([key, value]) => {
                    if (key === 'className') {
                        element.className = value;
                    } else if (key === 'onClick') {
                        element.addEventListener('click', value);
                    } else {
                        element.setAttribute(key, value);
                    }
                });
            }
            
            if (children) {
                children.forEach(child => {
                    if (typeof child === 'string') {
                        element.appendChild(document.createTextNode(child));
                    } else {
                        element.appendChild(child);
                    }
                });
            }
            
            return element;
        },
        
        updateElement: (element, newAttributes) => {
            if (newAttributes) {
                Object.entries(newAttributes).forEach(([key, value]) => {
                    if (key === 'className') {
                        element.className = value;
                    } else if (key === 'onClick') {
                        // 移除旧的点击事件
                        const clonedElement = element.cloneNode(true);
                        element.parentNode.replaceChild(clonedElement, element);
                        clonedElement.addEventListener('click', value);
                        element = clonedElement;
                    } else {
                        element.setAttribute(key, value);
                    }
                });
            }
            return element;
        }
    };
}

export function memoize(func) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = func(...args);
        cache.set(key, result);
        return result;
    };
}

export function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

export function measurePerformance(callback) {
    const start = performance.now();
    const result = callback();
    const end = performance.now();
    console.log(`Execution time: ${end - start}ms`);
    return result;
}