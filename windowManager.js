import { eventBus } from './eventBus.js';
const appTray = document.getElementById('app-tray');

class WindowManager {
    constructor() { this.windows = {}; this.zIndexCounter = 10; this.activeWindowId = null; }
    createWindow({ id, title, content, width = 600, height = 400, icon = '🚀' }) {
        if (this.isOpen(id)) { this.isMinimized(id) ? this.restore(id) : this.focus(id); return this.windows[id].element; }
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `win-${id}`;
        win.style.width = `${width}px`; win.style.height = `${height}px`;
        win.style.top = `${50 + (Object.keys(this.windows).length % 10) * 20}px`;
        win.style.left = `${100 + (Object.keys(this.windows).length % 10) * 20}px`;
        win.innerHTML = `<div class="window-title-bar"><span class="window-title">${icon} ${title}</span><div class="window-buttons"><button class="btn-minimize"></button><button class="btn-maximize"></button><button class="btn-close"></button></div></div><div class="window-content">${content}</div>`;
        document.getElementById('desktop').appendChild(win);
        this.windows[id] = { element: win, minimized: false, maximized: false, title: title, icon: icon, originalBounds: null };
        this.focus(id); this.makeDraggable(win); this.addToTray(id);
        win.querySelector('.btn-close').onclick = () => this.close(id);
        win.querySelector('.btn-minimize').onclick = () => this.minimize(id);
        win.querySelector('.btn-maximize').onclick = () => this.maximize(id);
        win.addEventListener('mousedown', () => this.focus(id), true);
        return win;
    }
    close(id) { if (!this.windows[id]) return; this.windows[id].element.remove(); delete this.windows[id]; this.removeFromTray(id); if (this.activeWindowId === id) this.activeWindowId = null; this.updateTray(); }
    minimize(id) { if (!this.windows[id]) return; this.windows[id].element.classList.add('minimized'); this.windows[id].minimized = true; if(this.activeWindowId === id) this.activeWindowId = null; this.updateTray(); }
    maximize(id) { if (!this.windows[id]) return; const win = this.windows[id]; if (win.maximized) { win.element.classList.remove('maximized'); Object.assign(win.element.style, win.originalBounds); win.maximized = false; } else { win.originalBounds = { top: win.element.style.top, left: win.element.style.left, width: win.element.style.width, height: win.element.style.height }; win.element.classList.add('maximized'); win.maximized = true; } }
    restore(id) { if (!this.windows[id]) return; this.windows[id].element.classList.remove('minimized'); this.windows[id].minimized = false; this.focus(id); }
    focus(id) { if (!this.windows[id] || (this.activeWindowId === id && !this.isMinimized(id))) return; this.activeWindowId = id; document.querySelectorAll('.window').forEach(w => w.classList.remove('active')); this.windows[id].element.classList.add('active'); this.windows[id].element.style.zIndex = ++this.zIndexCounter; this.updateTray(); eventBus.publish('windowFocused', id); }
    addToTray(id) { const trayItem = document.createElement('button'); trayItem.className = 'tray-item'; trayItem.id = `tray-${id}`; trayItem.innerHTML = `${this.windows[id].icon} <span>${this.windows[id].title.substring(0, 10)}</span>`; trayItem.onclick = () => { this.isMinimized(id) ? this.restore(id) : this.focus(id); }; appTray.appendChild(trayItem); this.updateTray(); }
    removeFromTray(id) { const trayItem = document.getElementById(`tray-${id}`); if (trayItem) trayItem.remove(); }
    updateTray() { document.querySelectorAll('.tray-item').forEach(item => item.classList.remove('active')); if (this.activeWindowId && this.windows[this.activeWindowId] && !this.windows[this.activeWindowId].minimized) { const activeTrayItem = document.getElementById(`tray-${this.activeWindowId}`); if (activeTrayItem) activeTrayItem.classList.add('active'); } }
    makeDraggable(win) { let offsetX, offsetY; const handle = win.querySelector('.window-title-bar'); const move = (e) => { if (this.windows[win.id.replace('win-','')]?.maximized) return; win.style.left = Math.min(window.innerWidth - 50, Math.max(-win.offsetWidth + 50, e.clientX - offsetX)) + 'px'; win.style.top = Math.min(window.innerHeight - 40 - 20, Math.max(0, e.clientY - offsetY)) + 'px'; }; handle.addEventListener('mousedown', (e) => { e.preventDefault(); offsetX = e.clientX - win.offsetLeft; offsetY = e.clientY - win.offsetTop; this.focus(win.id.replace('win-', '')); document.addEventListener('mousemove', move); document.addEventListener('mouseup', () => document.removeEventListener('mousemove', move), { once: true }); }); handle.ondblclick = () => this.maximize(win.id.replace('win-', '')); }
    isOpen(id) { return !!this.windows[id]; }
    isMinimized(id) { return this.windows[id] && this.windows[id].minimized; }
}
export const windowManager = new WindowManager();