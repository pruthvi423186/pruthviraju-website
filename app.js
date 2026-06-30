/* ==========================================================================
   PORTFOLIO INTERACTIVITY LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initializations
    initThemeToggle();
    initLiquidNavbar();
    initSkillHighlights();
    
    // Window resize handler to keep liquid navbar indicator positioned correctly
    window.addEventListener('resize', updateLiquidIndicator);
});

/* ==========================================================================
   THEME TOGGLE MECHANISM (LIGHT / DARK)
   ========================================================================== */
function initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;
    
    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const defaultDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark) || !savedTheme;
    
    if (defaultDark) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        toggleBtn.innerHTML = '<i class="ph ph-sun"></i>';
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        toggleBtn.innerHTML = '<i class="ph ph-moon"></i>';
    }
    
    toggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        
        if (isDark) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            toggleBtn.innerHTML = '<i class="ph ph-moon"></i>';
            localStorage.setItem('portfolio-theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            toggleBtn.innerHTML = '<i class="ph ph-sun"></i>';
            localStorage.setItem('portfolio-theme', 'dark');
        }
        
        setTimeout(updateLiquidIndicator, 150);
    });
}

/* ==========================================================================
   LIQUID NAVBAR TAB SWITCHER
   ========================================================================== */
function initLiquidNavbar() {
    const tabs = document.querySelectorAll('.nav-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
    
    setTimeout(updateLiquidIndicator, 200);
}

function switchTab(tabId) {
    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.tab-panel');
    
    let activeTabButton = null;
    
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
            activeTabButton = tab;
        } else {
            tab.classList.remove('active');
        }
    });
    
    panels.forEach(panel => {
        if (panel.id === `tab-${tabId}`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
    
    if (activeTabButton) {
        // Auto scroll navbar on mobile to center active tab
        const navTabsContainer = document.getElementById('navTabs');
        if (navTabsContainer) {
            const containerWidth = navTabsContainer.offsetWidth;
            const tabLeft = activeTabButton.offsetLeft;
            const tabWidth = activeTabButton.offsetWidth;
            
            // Center the tab
            navTabsContainer.scrollTo({
                left: tabLeft - (containerWidth / 2) + (tabWidth / 2),
                behavior: 'smooth'
            });
        }
        updateLiquidIndicator();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateLiquidIndicator() {
    const activeTab = document.querySelector('.nav-tab.active');
    const indicator = document.getElementById('liquidIndicator');
    
    if (!activeTab || !indicator) return;
    
    // Use local DOM offset coordinates relative to the positioned navTabs container
    indicator.style.width = `${activeTab.offsetWidth}px`;
    indicator.style.height = `${activeTab.offsetHeight}px`;
    indicator.style.left = `${activeTab.offsetLeft}px`;
    indicator.style.top = `${activeTab.offsetTop}px`;
}

window.switchTab = switchTab;

/* ==========================================================================
   SKILLS & PROJECTS INTERACTION LINKING
   ========================================================================== */
function initSkillHighlights() {
    const skillBadges = document.querySelectorAll('.skill-badge');
    const projectCards = document.querySelectorAll('.project-card');
    
    skillBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            const skillAttr = badge.getAttribute('data-skill');
            const isActive = badge.classList.contains('active-highlight');
            
            skillBadges.forEach(b => b.classList.remove('active-highlight'));
            projectCards.forEach(card => {
                card.classList.remove('highlighted-project');
                card.classList.remove('dimmed');
            });
            
            if (!isActive) {
                badge.classList.add('active-highlight');
                let matchCount = 0;
                
                projectCards.forEach(card => {
                    const techData = card.getAttribute('data-tech') || '';
                    if (techData.toLowerCase().includes(skillAttr.toLowerCase())) {
                        card.classList.add('highlighted-project');
                        matchCount++;
                    } else {
                        card.classList.add('dimmed');
                    }
                });
                
                if (matchCount > 0) {
                    setTimeout(() => {
                        switchTab('projects');
                        const gridElement = document.getElementById('projectsGrid');
                        if (gridElement) {
                            gridElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 500);
                }
            }
        });
    });
}

/* ==========================================================================
   PROJECT CARD EXPANSION
   ========================================================================== */
function toggleProjectDetails(btn) {
    const card = btn.closest('.project-card');
    const isExpanded = card.classList.contains('expanded');
    
    document.querySelectorAll('.project-card').forEach(c => {
        if (c !== card) c.classList.remove('expanded');
    });
    
    if (isExpanded) {
        card.classList.remove('expanded');
    } else {
        card.classList.add('expanded');
    }
}
window.toggleProjectDetails = toggleProjectDetails;

/* ==========================================================================
   ROBOTICS SIMULATION PLAYGROUND (ROS Terminal Emulator)
   ========================================================================== */
let rosInterval = null;
let gridInterval = null;

function runRosSim() {
    const terminalBody = document.getElementById('terminalBody');
    const btnLaunch = document.getElementById('btnLaunchSLAM');
    const btnReset = document.getElementById('btnResetSLAM');
    const statusOverlay = document.getElementById('terminalStatusOverlay');
    const posX = document.getElementById('posX');
    const posY = document.getElementById('posY');
    const lidarStatus = document.getElementById('lidarStatus');
    const slamStatus = document.getElementById('slamStatus');
    const miniGrid = document.getElementById('miniGrid');
    
    btnLaunch.disabled = true;
    btnReset.disabled = false;
    btnLaunch.classList.remove('active-pulse-btn');
    btnLaunch.classList.add('secondary-btn');
    btnReset.classList.add('active-pulse-btn');
    btnReset.classList.remove('secondary-btn');
    
    miniGrid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        miniGrid.appendChild(cell);
    }
    
    const cursor = terminalBody.querySelector('.t-cursor');
    if (cursor) cursor.remove();
    
    appendTerminalLine('pruthvi-robotics$', ' roslaunch turtlebot3_navigation.launch', 't-prompt');
    
    const logs = [
        { text: '[ROS] Initializing ROS Master on http://127.0.0.1:11311/...', type: 'system' },
        { text: '[ROS] Loaded robot model description (URDF/Xacro)', type: 'system' },
        { text: '[Node] Gazebo simulator loaded. Spawning TurtleBot3 [Burger]...', type: 'system' },
        { text: '[SLAM] Cartographer SLAM node started.', type: 'accent' },
        { text: '[SLAM] Map topic established: /map. Latch state: TRUE', type: 'accent' },
        { text: '[Sensor] /scan laser scan data active. Frequency: 5.0 Hz', type: 'system' },
        { text: '[Path] move_base local and global costmaps loaded.', type: 'system' },
        { text: '[Navigation] Ready. Input coordinate: X: 2.50, Y: -1.80', type: 'accent' }
    ];
    
    let logIndex = 0;
    
    rosInterval = setInterval(() => {
        if (logIndex < logs.length) {
            appendTerminalLine('', logs[logIndex].text, logs[logIndex].type === 'accent' ? 't-accent' : '');
            logIndex++;
            terminalBody.scrollTop = terminalBody.scrollHeight;
        } else {
            clearInterval(rosInterval);
            rosInterval = null;
            
            statusOverlay.style.display = 'block';
            lidarStatus.textContent = 'SCANNING';
            lidarStatus.classList.add('green-text');
            slamStatus.textContent = 'ACTIVE';
            
            runSimLoop(posX, posY);
        }
    }, 600);
}

function appendTerminalLine(prefix, text, className) {
    const terminalBody = document.getElementById('terminalBody');
    const line = document.createElement('div');
    line.className = 'terminal-line';
    
    if (prefix) {
        const prefSpan = document.createElement('span');
        prefSpan.className = className;
        prefSpan.textContent = prefix;
        line.appendChild(prefSpan);
        
        const txtNode = document.createTextNode(text);
        line.appendChild(txtNode);
    } else {
        const txtSpan = document.createElement('span');
        txtSpan.className = className;
        txtSpan.textContent = text;
        line.appendChild(txtSpan);
    }
    
    terminalBody.appendChild(line);
}

function runSimLoop(posXElem, posYElem) {
    let x = 0.00;
    let y = 0.00;
    let step = 0;
    
    const cells = document.querySelectorAll('.grid-cell');
    
    gridInterval = setInterval(() => {
        x += (Math.random() * 0.15);
        y -= (Math.random() * 0.10);
        
        posXElem.textContent = x.toFixed(2);
        posYElem.textContent = y.toFixed(2);
        
        cells.forEach(c => c.classList.remove('scanned', 'bot'));
        
        const numScans = 5 + Math.floor(Math.random() * 8);
        for (let i = 0; i < numScans; i++) {
            const idx = Math.floor(Math.random() * cells.length);
            cells[idx].classList.add('scanned');
        }
        
        const botIdx = step % cells.length;
        cells[botIdx].classList.add('bot');
        cells[botIdx].classList.remove('scanned');
        
        step++;
        
        if (step % 5 === 0) {
            appendTerminalLine('[Odom]', ` Update: Pos(X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}) Goal distance: ${(4.0 - x).toFixed(2)}m`, 't-accent');
            const terminalBody = document.getElementById('terminalBody');
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
        
        if (x >= 3.5) {
            clearInterval(gridInterval);
            gridInterval = null;
            appendTerminalLine('[Nav]', ' Goal target reached. Navigation completed successfully.', 'green-text');
            const terminalBody = document.getElementById('terminalBody');
            terminalBody.scrollTop = terminalBody.scrollHeight;
            document.getElementById('lidarStatus').textContent = 'STANDBY';
            document.getElementById('lidarStatus').classList.remove('green-text');
            document.getElementById('slamStatus').textContent = 'COMPLETED';
        }
    }, 400);
}

function resetRosSim() {
    if (rosInterval) clearInterval(rosInterval);
    if (gridInterval) clearInterval(gridInterval);
    
    rosInterval = null;
    gridInterval = null;
    
    const terminalBody = document.getElementById('terminalBody');
    const btnLaunch = document.getElementById('btnLaunchSLAM');
    const btnReset = document.getElementById('btnResetSLAM');
    const statusOverlay = document.getElementById('terminalStatusOverlay');
    
    terminalBody.innerHTML = `
        <div class="terminal-line"><span class="t-accent">[System]</span> Terminal initialized. Ready to interface with ROS.</div>
        <div class="terminal-line"><span class="t-accent">[System]</span> TurtleBot3 status: ONLINE. Gazebo Simulator: IDLE.</div>
        <div class="terminal-line"><span class="t-prompt">pruthvi-robotics$</span> <span class="t-cursor"></span></div>
    `;
    
    statusOverlay.style.display = 'none';
    
    btnLaunch.disabled = false;
    btnReset.disabled = true;
    btnLaunch.classList.add('active-pulse-btn');
    btnLaunch.classList.remove('secondary-btn');
    btnReset.classList.remove('active-pulse-btn');
    btnReset.classList.add('secondary-btn');
}

window.runRosSim = runRosSim;
window.resetRosSim = resetRosSim;

/* ==========================================================================
   CONTACT FORM SUBMISSION (INTEGRATED WITH FORMSUBMIT AJAX)
   ========================================================================== */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const btn = document.getElementById('btnSubmit');
    const successMsg = document.getElementById('successMsg');
    
    const nameVal = document.getElementById('form-name').value;
    const emailVal = document.getElementById('form-email').value;
    const messageVal = document.getElementById('form-message').value;
    
    btn.disabled = true;
    btn.innerHTML = '<span>Transmitting...</span><i class="ph ph-spinner-gap spin"></i>';
    btn.style.opacity = '0.7';
    
    fetch('https://formsubmit.co/ajax/rajprudvi423@gmail.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: nameVal,
            email: emailVal,
            message: messageVal,
            _subject: 'New message from Pruthviraju Gundrathi Portfolio'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('FormSubmit status:', data);
        successMsg.classList.add('active');
        btn.disabled = false;
        btn.innerHTML = '<span>Transmit Signal</span><i class="ph ph-paper-plane-right"></i>';
        btn.style.opacity = '1';
    })
    .catch(error => {
        console.error('AJAX Error:', error);
        successMsg.classList.add('active');
        btn.disabled = false;
        btn.innerHTML = '<span>Transmit Signal</span><i class="ph ph-paper-plane-right"></i>';
        btn.style.opacity = '1';
    });
}

function resetForm() {
    const successMsg = document.getElementById('successMsg');
    const form = document.getElementById('contactForm');
    
    form.reset();
    successMsg.classList.remove('active');
}

window.handleFormSubmit = handleFormSubmit;
window.resetForm = resetForm;
