import { windowManager } from './windowManager.js';
import { APPS } from './apps.js';
import { VFS, getPathContent, resolvePath } from './vfs.js';
import { eventBus } from './eventBus.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const desktop = document.getElementById('desktop');
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const startMenuApps = document.getElementById('start-menu-apps');
    const clock = document.getElementById('taskbar-clock');
    const contextMenu = document.getElementById('context-menu');
    const cpuChartCtx = document.getElementById('cpu-chart').getContext('2d');
    const cpuStat = document.getElementById('cpu-stat');
    const memStat = document.getElementById('mem-stat');

    let iconPositions = JSON.parse(localStorage.getItem('m-os-icons')) || {};
    
    // --- Clock ---
    const updateClock = () => { clock.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); };
    updateClock();
    setInterval(updateClock, 1000);

    // --- System Monitor Widget ---
    let cpuData = Array(30).fill(0);
    const drawChart = () => {
        const usage = Math.random() * 40 + 5 * Math.sin(Date.now() / 2000) + 5 * Math.cos(Date.now() / 5000);
        cpuData.push(usage);
        if (cpuData.length > 30) cpuData.shift();
        cpuStat.textContent = `${Math.round(usage)}%`;
        memStat.textContent = `${Math.round(450 + Math.random() * 100)}MB`;
        cpuChartCtx.clearRect(0, 0, cpuChartCtx.canvas.width, cpuChartCtx.canvas.height);
        cpuChartCtx.beginPath();
        cpuChartCtx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent-color');
        cpuChartCtx.lineWidth = 2;
        cpuData.forEach((val, i) => {
            const x = i * (cpuChartCtx.canvas.width / 29);
            const y = cpuChartCtx.canvas.height - (val / 100 * cpuChartCtx.canvas.height);
            if (i === 0) { cpuChartCtx.moveTo(x, y); } else { cpuChartCtx.lineTo(x, y); }
        });
        cpuChartCtx.stroke();
    };
    setInterval(drawChart, 500);

    // --- Start Menu ---
    startButton.addEventListener('click', (e) => { e.stopPropagation(); startMenu.classList.toggle('visible'); });
    document.addEventListener('click', () => startMenu.classList.remove('visible'));
    
    Object.entries(APPS).forEach(([id, app]) => {
        if(app.isHidden) return;
        const li = document.createElement('li');
        li.innerHTML = `${app.icon} ${app.name}`;
        li.onclick = () => { app.launch({ path: '~' }); startMenu.classList.remove('visible'); };
        startMenuApps.appendChild(li);
    });

    // --- Desktop Icons (Draggable) ---
    const renderDesktopIcons = () => {
        desktop.querySelectorAll('.desktop-icon').forEach(icon => icon.remove());
        const rootDir = getPathContent(['~']);
        let i = 0;
        Object.entries(rootDir.content).forEach(([name, item]) => {
            const appId = item.type === 'dir' ? 'FileExplorer' : 'CodeEditor';
            const icon = document.createElement('div');
            icon.className = 'desktop-icon';
            icon.id = `icon-${name}`;
            icon.innerHTML = `<div class="icon-image">${item.icon || (item.type === 'dir' ? APPS.FileExplorer.icon : APPS.CodeEditor.icon)}</div><span>${name}</span>`;
            if(iconPositions[name]){ icon.style.top = iconPositions[name].top; icon.style.left = iconPositions[name].left; } 
            else { icon.style.top = `${1 + i * 110}px`; icon.style.left = '1rem'; }
            icon.ondblclick = () => APPS[appId].launch({ path: `~/${name}` });
            makeIconDraggable(icon, name);
            desktop.appendChild(icon);
            i++;
        });
    };
    function makeIconDraggable(icon, name) {
        let offsetX, offsetY;
        const move = (e) => { icon.style.left = `${e.clientX - offsetX}px`; icon.style.top = `${e.clientY - offsetY}px`; };
        icon.addEventListener('mousedown', (e) => { e.preventDefault(); offsetX = e.clientX - icon.offsetLeft; offsetY = e.clientY - icon.offsetTop; icon.classList.add('dragging'); document.addEventListener('mousemove', move); document.addEventListener('mouseup', () => { document.removeEventListener('mousemove', move); icon.classList.remove('dragging'); iconPositions[name] = { top: icon.style.top, left: icon.style.left }; localStorage.setItem('m-os-icons', JSON.stringify(iconPositions)); }, { once: true }); });
    }
    eventBus.subscribe('vfs-update', renderDesktopIcons);
    renderDesktopIcons();

    // --- Context Menu ---
    const showContextMenu = (e, items) => { e.preventDefault(); contextMenu.innerHTML = ''; items.forEach(item => { const menuItem = document.createElement('div'); menuItem.textContent = item.label; menuItem.onclick = () => { item.action(); contextMenu.classList.remove('visible'); }; contextMenu.appendChild(menuItem); }); contextMenu.style.left = `${e.clientX}px`; contextMenu.style.top = `${e.clientY}px`; contextMenu.classList.add('visible'); };
    desktop.addEventListener('contextmenu', (e) => { if (e.target.closest('.desktop-icon') || e.target.closest('.window') || e.target.closest('#taskbar')) return; showContextMenu(e, [ { label: "Open Console", action: () => APPS.Terminal.launch() }, { label: "Create New Folder", action: () => alert('Feature not implemented') }, { label: "Settings", action: () => APPS.Settings.launch() } ]); });
    document.addEventListener('click', () => contextMenu.classList.remove('visible'));

    // --- Initial Boot ---
    APPS.FileExplorer.launch({ path: '~' });
});