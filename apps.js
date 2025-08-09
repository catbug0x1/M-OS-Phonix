import { windowManager } from './windowManager.js';
import { launchFileExplorer } from './fileExplorer.js';
import { launchTerminal } from './terminal.js';
import { launchCodeEditor } from './codeEditor.js';
import { launchTaskManager } from './taskManager.js';
import { launchSettings } from './settings.js';

export const APPS = {
    FileExplorer: { name: "File Explorer", icon: "📁", launch: launchFileExplorer },
    Terminal: { name: "Console", icon: "📟", launch: launchTerminal },
    CodeEditor: { name: "Code Editor", icon: "📄", launch: launchCodeEditor, isHidden: true },
    TaskManager: { name: "Task Manager", icon: "📊", launch: launchTaskManager },
    Settings: { name: "Settings", icon: "⚙️", launch: launchSettings },
};