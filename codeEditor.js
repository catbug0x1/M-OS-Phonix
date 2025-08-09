import { windowManager } from './windowManager.js';
import { VFS, getPathContent, resolvePath } from './vfs.js';

export function launchCodeEditor(filePath) {
    const pathArr = resolvePath(filePath);
    if (!pathArr) return;
    const file = getPathContent(pathArr);
    if (!file || file.type !== 'file') return;
    const filename = pathArr[pathArr.length - 1];
    const id = `CodeEditor@${pathArr.join('/')}`;
    if(windowManager.isOpen(id)) { windowManager.focus(id); return; }

    const content = `<div class="code-editor-content"><pre><code class="language-markdown">${file.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre></div>`;
    const win = windowManager.createWindow({ id, title: `${filename}`, content, width: 700, height: 500, icon: file.icon || '📄' });
    
    setTimeout(() => {
        const codeBlock = win.querySelector('code');
        if (codeBlock && window.hljs) {
            hljs.highlightElement(codeBlock);
        }
    }, 0);
}