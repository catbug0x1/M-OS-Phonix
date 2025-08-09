import { windowManager } from './windowManager.js';
import { VFS, getPathContent, resolvePath } from './vfs.js';
import { eventBus } from './eventBus.js';
import { APPS } from './apps.js';

export function launchTerminal(startPathArr = ['~']) {
    const id = 'Terminal';
    if (windowManager.isOpen(id)) { windowManager.focus(id); return; }

    const content = `<div class="terminal-content"><div id="terminal-output"></div><div class="terminal-input-line"><span id="terminal-prompt"></span><input type="text" id="terminal-input"></div></div>`;
    const win = windowManager.createWindow({ id, title: 'Console', content, width: 750, height: 450, icon: APPS.Terminal.icon });
    
    const output = win.querySelector('#terminal-output');
    const input = win.querySelector('#terminal-input');
    const prompt = win.querySelector('#terminal-prompt');
    input.focus();
    let currentPathArr = startPathArr;
    let commandHistory = [];
    let historyIndex = -1;

    const commands = {
        help: () => 'Commands: help, ls, cd, cat, touch, rm, open, clear, pwd',
        ls: () => { const dir = getPathContent(currentPathArr); return Object.keys(dir.content).map(name => `${dir.content[name].type === 'dir' ? '📁' : '📄'} ${name}`).join('\n'); },
        cd: (args) => { const newPath = resolvePath(args[0], currentPathArr); if (newPath && getPathContent(newPath).type === 'dir') { currentPathArr = newPath; } else { return `cd: ${args[0]}: No such directory`; } },
        cat: (args) => { const path = resolvePath(args[0], currentPathArr); const file = getPathContent(path); if (file && file.type === 'file') return file.content; return 'File not found.'; },
        touch: (args) => { const path = resolvePath(args[0], currentPathArr); if(!path) return 'touch: Invalid path'; const filename = path.pop(); const parent = getPathContent(path); parent.content[filename] = {type:'file', icon: '📄', content:''}; eventBus.publish('vfs-update', {path:path.join('/')}); },
        rm: (args) => { const path = resolvePath(args[0], currentPathArr); if(!path) return 'rm: Invalid path'; const filename = path.pop(); const parent = getPathContent(path); delete parent.content[filename]; eventBus.publish('vfs-update', {path:path.join('/')}); },
        open: (args) => { const path = resolvePath(args[0], currentPathArr); const item = getPathContent(path); if(!item) return 'open: File or directory not found.'; if(item.type === 'dir'){ APPS.FileExplorer.launch(path.join('/')); } else { APPS.CodeEditor.launch(path.join('/')); } },
        pwd: () => currentPathArr.join('/'),
        clear: () => { output.innerHTML = ''; },
    };

    const processCommand = (cmdStr) => { const [command, ...args] = cmdStr.trim().split(/\s+/); appendOutput(`${prompt.textContent} ${cmdStr}`); if (command && commands[command]) { const result = commands[command](args); if(result) appendOutput(result); } else if (command) { appendOutput(`${command}: command not found.`); } updatePrompt(); input.value = ''; if (cmdStr) commandHistory.unshift(cmdStr); historyIndex = -1; };
    const appendOutput = (html) => { output.innerHTML += `<div>${html}</div>`; output.scrollTop = output.scrollHeight; };
    const updatePrompt = () => { prompt.textContent = `operator@phoenix:${currentPathArr.join('/')}$`; };

    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.value) processCommand(e.target.value); else if(e.key === 'ArrowUp') { if(historyIndex < commandHistory.length - 1) { historyIndex++; input.value = commandHistory[historyIndex]; }} });
    updatePrompt();
    appendOutput('M-OS [Version 6.0 Phoenix]');
}