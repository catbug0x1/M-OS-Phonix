import { windowManager } from './windowManager.js';
import { VFS, getPathContent, resolvePath } from './vfs.js';

export function launchTextEditor(filePath) {
    const pathArr = resolvePath(filePath);
    if (!pathArr) return;

    const file = getPathContent(pathArr);
    if (!file || file.type !== 'file') return;

    const filename = pathArr[pathArr.length - 1];
    const id = `TextEditor@${pathArr.join('/')}`;

    if(windowManager.isOpen(id)) { windowManager.focus(id); return; }

    const content = `<textarea class="text-editor-content" readonly>${file.content}</textarea>`;
    windowManager.createWindow({ id, title: `${filename} - Text Editor`, content, width: 600, height: 500 });
}