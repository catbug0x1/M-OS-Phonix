import { windowManager } from './windowManager.js';
import { VFS, getPathContent, resolvePath } from './vfs.js';
import { APPS } from './apps.js';
import { eventBus } from './eventBus.js';

export function launchFileExplorer(startPathStr) {
    const startPath = resolvePath(startPathStr || '~');
    const id = `FileExplorer@${startPath.join('/')}`;
    if(windowManager.isOpen(id)) { windowManager.focus(id); return; }
    const content = `<div class="file-explorer-container"><div class="fe-content-pane"><div class="fe-breadcrumb"></div><div class="fe-main-view"></div></div></div>`;
    const win = windowManager.createWindow({ id, title: `Explorer - ${startPath[startPath.length - 1]}`, content, width: 800, icon: APPS.FileExplorer.icon });
    
    let currentPathArr = startPath;
    const mainView = win.querySelector('.fe-main-view');
    const breadcrumb = win.querySelector('.fe-breadcrumb');

    const render = () => { renderBreadcrumb(); renderMainView(); };
    const renderBreadcrumb = () => {
        breadcrumb.innerHTML = '';
        let pathAccum = [];
        currentPathArr.forEach((part, i) => {
            pathAccum.push(part);
            const partEl = document.createElement('span');
            partEl.textContent = `${part.replace('~', 'Home')} ${i < currentPathArr.length - 1 ? '> ' : ''}`;
            const fullPath = [...pathAccum];
            partEl.onclick = () => { currentPathArr = fullPath; render(); };
            breadcrumb.appendChild(partEl);
        });
    };
    const renderMainView = () => {
        mainView.innerHTML = '';
        const currentDir = getPathContent(currentPathArr);
        if(!currentDir || currentDir.type !== 'dir') { mainView.innerHTML = 'Directory not found.'; return; }
        Object.entries(currentDir.content).forEach(([name, item]) => {
            const icon = document.createElement('div');
            icon.className = 'fe-icon';
            const iconType = item.icon || (item.type === 'dir' ? APPS.FileExplorer.icon : APPS.CodeEditor.icon);
            icon.innerHTML = `<div class="icon-image">${iconType}</div><span>${name}</span>`;
            icon.ondblclick = () => {
                const newPathArr = [...currentPathArr, name];
                if(item.type === 'dir') {
                    currentPathArr = newPathArr;
                    render();
                } else {
                    APPS.CodeEditor.launch(newPathArr.join('/'));
                }
            };
            mainView.appendChild(icon);
        });
    };
    const onVFSUpdate = ({ path }) => { const currentPathStr = currentPathArr.join('/'); if (path === currentPathStr) { renderMainView(); }};
    eventBus.subscribe('vfs-update', onVFSUpdate);
    render();
}