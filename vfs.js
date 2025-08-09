const fileSystem = {
    '~': {
        type: 'dir',
        content: {
            'About': { type: 'dir', icon: '👤', content: { 'Resume.md': { type: 'file', icon: '📄', content: `<h3>Mohamed Elsherbini - Cybersecurity & AI</h3><p>A dedicated and analytical cybersecurity student with a passion for leveraging Artificial Intelligence to build proactive, resilient security solutions. My work bridges the gap between offensive security tactics and defensive machine learning models.</p><p>This entire desktop environment is a testament to my skills, built from scratch with pure JavaScript, HTML, and CSS to demonstrate my understanding of complex, stateful applications.</p>` }}},
            'Projects': { type: 'dir', icon: '📁', content: {
                'Malware_Hunter.proj': { type: 'file', icon: '🦠', content: '<h2>Malware Hunter: ML Detection</h2><p>A robust system achieving <strong>99.41% accuracy</strong> in detecting malicious PE binaries using a Random Forest model. Involved extensive feature engineering on 87 key PE header features.</p>' },
                'AI_Vision.proj': { type: 'file', icon: '👁️', content: '<h2>AI Vision Security</h2><p>A model demonstrating proficiency in AI Vision technologies, applicable to visual analysis tasks in automated security monitoring and threat identification.</p>' }
            }},
            'Documents': { type: 'dir', icon: '📚', content: {
                'Skills.md': { type: 'file', icon: '🛠️', content: '## Core Competencies\n- Malware Analysis (PE)\n- Machine Learning for Security\n- Network Pentesting\n- Python (Scikit-learn)\n- JavaScript (ES6+)' },
                'README.md': { type: 'file', icon: '📄', content: '# Welcome to M-OS Phoenix\nThis is an interactive portfolio. Explore the file system, open apps, and use the terminal.'}
            }},
        }
    }
};
export const VFS = fileSystem;

export function getPathContent(pathArr, fs = VFS) {
    let current = fs;
    for (const part of pathArr) {
        if (part === '~') { current = fs['~']; }
        else if (current && current.type === 'dir' && current.content && current.content[part]) {
            current = current.content[part];
        } else { return null; }
    }
    return current;
}

export function resolvePath(pathStr, currentPathArr = ['~']) {
    if (!pathStr) return null;
    let tempPath;
    if (pathStr.startsWith('~/')) {
        tempPath = ['~', ...pathStr.substring(2).split('/').filter(p => p)];
    } else if (pathStr === '~' || pathStr === '/') {
        tempPath = ['~'];
    } else {
        tempPath = [...currentPathArr, ...pathStr.split('/').filter(p => p)];
    }

    const resolved = [];
    for (const part of tempPath) {
        if (part === '..') {
            if (resolved.length > 1) resolved.pop();
        } else if (part !== '.' && part !== '') {
            resolved.push(part);
        }
    }
    return resolved;
}