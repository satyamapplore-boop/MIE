/**
 * MIE Enterprise Analysis Engine — Frontend Orchestrator
 * Connects to Backend v2.1 (Port 4242)
 */

const API_BASE = 'http://localhost:4242/api';
let currentResults = null;
let currentDimensions = [];

/**
 * INIT
 */
const init = async () => {
    lucide.createIcons();
    await fetchDimensions();
    
    // UI Bindings
    const fileInput = document.getElementById('file-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const dropZone = document.getElementById('drop-zone');

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            dropZone.querySelector('p').textContent = `Ready: ${file.name}`;
            dropZone.style.borderColor = 'var(--accent-green)';
            analyzeBtn.disabled = false;
        }
    });

    analyzeBtn.addEventListener('click', startAnalysis);

    // Modal Close
    document.getElementById('close-modal').onclick = () => {
        document.getElementById('details-modal').classList.add('hidden');
    };
};

/**
 * FETCH DIMENSIONS
 */
const fetchDimensions = async () => {
    try {
        const res = await fetch(`${API_BASE}/dimensions`);
        const data = await res.json();
        if (data.success) {
            currentDimensions = data.dimensions;
            renderDimensionsSelector(data.dimensions);
        }
    } catch (err) {
        console.error('Failed to fetch dimensions:', err);
    }
};

const renderDimensionsSelector = (dims) => {
    const list = document.getElementById('dimensions-list');
    list.innerHTML = dims.map(d => `
        <label class="dim-pill">
            <input type="checkbox" name="dimension" value="${d.id}" checked>
            <span>${d.title}</span>
        </label>
    `).join('');
};

/**
 * START ANALYSIS
 */
const startAnalysis = async () => {
    const fileInput = document.getElementById('file-input');
    const selectedDims = Array.from(document.querySelectorAll('input[name="dimension"]:checked')).map(i => i.value);
    
    if (!fileInput.files[0]) return;

    // UI Flip
    document.getElementById('hero-hub').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('loading-message').textContent = 'Extracting Verbatim Evidence...';

    const formData = new FormData();
    formData.append('pdf', fileInput.files[0]);
    formData.append('dimensions', selectedDims.join(','));

    try {
        // Start Progress Animation (0 to 100)
        let progress = 0;
        const progressEl = document.getElementById('progress-pct');
        const progressInterval = setInterval(() => {
            if (progress < 80) {
                progress += Math.random() * 4; // Fast data retrieval phase
            } else if (progress < 96) {
                progress += Math.random() * 0.8; // Intensive extraction phase
            } else if (progress < 99) {
                progress += 0.05; // Final synthesis phase
            }
            if (progressEl) progressEl.innerText = Math.floor(progress) + '%';
        }, 400);

        const response = await fetch(`${API_BASE}/analyse`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        // Finalize
        clearInterval(progressInterval);
        if (progressEl) progressEl.innerText = '100%';

        if (data.success) {
            currentResults = data.results;
            
            // Short delay to show 100% before transitioning
            setTimeout(() => {
                document.getElementById('loading-state').classList.add('hidden');
                document.getElementById('results-dashboard').classList.remove('hidden');
                renderResultsGrid(data.results);
            }, 600);
        } else {
            throw new Error(data.error || 'Analysis failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('hero-hub').classList.remove('hidden');
    }
};


/**
 * RENDER RESULTS
 * Reverted to 7 Strategic Pillars (with 25-point logic)
 */
const renderResultsGrid = (results) => {
    const grid = document.getElementById('audit-bento-grid');
    grid.innerHTML = '';

    results.forEach((res, index) => {
        const card = document.createElement('div');
        card.className = 'result-card lift-animate';
        
        const title = res["Attribute"] || `Pillar ${index + 1}`;
        const scoreVal = res["Score"]; 
        const numericScore = typeof scoreVal === 'number' ? scoreVal : 0;
        
        // Refined 7-Pillar Colors
        const pillarColors = [
            '#00ff88', // Purpose (Neon Green)
            '#00ddeb', // Staff (Cyan)
            '#a29bfe', // Community (Purple)
            '#f0db4f', // Algorithms (Yellow)
            '#ff6b6b', // Assets (Pink)
            '#ffa502', // Engagement (Orange)
            '#74b9ff'  // Strategy (Sky Blue)
        ];
        const categoryColor = pillarColors[index] || pillarColors[0];
        const icon = getDimensionIcon(title);
        const levelLabel = res["Level"];

        card.innerHTML = `
            <div class="rc-top">
                <div class="rc-header">
                    <div class="rc-icon" style="background: ${categoryColor}22">
                        <i data-lucide="${icon}" style="color: ${categoryColor}"></i>
                    </div>
                    <span style="font-size: 10px; color: ${categoryColor}; letter-spacing: 1px; font-weight: 900;">PILLAR 0${index + 1}</span>
                </div>
                <h3 class="rc-title" style="color: white; margin-top: 12px; font-size: 18px;">${title}</h3>
                <ul class="rc-bullets">
                    <li style="color: ${categoryColor}; font-weight: 700; font-size: 13px;">${levelLabel}</li>
                    <li style="font-style: italic; opacity: 0.5; font-size: 11px; margin-top: 8px; line-height: 1.4;">"${truncate(res["Most Representative Statement"], 95)}"</li>
                </ul>
            </div>
            <div class="rc-score-box" style="border-top-color: rgba(255,255,255,0.05); background: rgba(255,255,255,0.02)">
                <span style="color: rgba(255,255,255,0.3); font-size: 10px; letter-spacing: 1px;">MATURITY SCORE</span>
                <span style="color: ${categoryColor}; font-size: 20px; font-weight: 900;">${typeof scoreVal === 'number' ? scoreVal + '.0' : 'N/A'}</span>
            </div>
        `;

        card.onclick = () => openDetails(res);
        grid.appendChild(card);
    });
    lucide.createIcons();
};



/**
 * OPEN DETAILS MODAL
 * CRITICAL FIX: Use the Correct Field Names
 */
const openDetails = (res) => {
    const modal = document.getElementById('details-modal');
    const body = document.getElementById('modal-body');
    const title = res["Attribute"];
    const scoreVal = res["Score"];
    const numericScore = typeof scoreVal === 'number' ? scoreVal : 0;
    const color = getLevelColor(numericScore);

    // Extract Statement list builder
    let extractListHtml = '';
    let i = 1;
    while(res[`Extract Statement ${i}`]) {
        extractListHtml += `
            <div style="background: #f9f9f9; border: 1px solid #eee; padding: 20px; border-radius: 16px; margin-bottom: 12px;">
                <div style="font-weight: 800; color: #888; font-size: 10px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Extract Statement ${i}</div>
                <div style="font-family: 'Inter', sans-serif; font-style: italic; line-height: 1.6; color: #111;">
                    "${res[`Extract Statement ${i}`]}"
                </div>
            </div>
        `;
        i++;
    }

    body.innerHTML = `
        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 24px; margin-bottom: 32px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div class="rc-icon" style="width: 48px; height: 48px; background: ${color}22">
                    <i data-lucide="${getDimensionIcon(title)}" style="color: ${color}"></i>
                </div>
                <h2 style="font-size: 28px; color: white;">${title}</h2>
            </div>
            <div style="display: flex; gap: 12px;">
                <span style="background: ${color}; color: #000; padding: 4px 12px; border-radius: 8px; font-weight: 800; font-size: 12px;">
                    ${res["Level"]}
                </span>
            </div>
        </div>

        <section style="margin-bottom: 40px;">
            <h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.4); margin-bottom: 16px;">Summary Statement</h4>
            <div style="font-size: 14px; line-height: 1.8; color: white; white-space: pre-wrap; font-weight: 300;">${res["Summary Statement"]}</div>
        </section>

        <section style="margin-bottom: 40px;">
            <h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.4); margin-bottom: 16px;">Justification for Level</h4>
            <div style="color: white; border-left: 4px solid ${color}; padding: 20px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; background: rgba(255,255,255,0.03); border-radius: 0 4px 4px 0;">${res["Justification for Level"]}</div>
        </section>

        <section style="margin-bottom: 40px;">
            <h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.4); margin-bottom: 16px;">Why other statements are not relevant</h4>
            <div style="color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.02); padding: 20px; border-radius: 12px; font-size: 13.5px; border: 1px solid rgba(255,255,255,0.05); white-space: pre-wrap;">${res["Justification as to why other statements are not relevant"]}</div>
        </section>

        <section>
            <h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.4); margin-bottom: 16px;">Direct Verbatim Audit Log</h4>
            <div style="max-height: 400px; overflow-y: auto; padding-right: 12px;">
                ${extractListHtml || '<p style="opacity: 0.5;">No statements found.</p>'}
            </div>
        </section>
    `;

    modal.classList.remove('hidden');
    lucide.createIcons();
};

/**
 * UTILS
 */
const getLevelColor = (lvl) => {
    const colors = ['#888', '#ff4444', '#ffcc00', '#5dc9ff', '#9d83ff', '#00ff88'];
    return colors[lvl] || colors[0];
};

const getDimensionIcon = (title) => {
    if (!title) return "box";
    const t = title.toLowerCase();
    if (t.includes("purpose") || t.includes("vision")) return "target";
    if (t.includes("culture") || t.includes("value")) return "smile";
    if (t.includes("workforce") || t.includes("people")) return "users";
    if (t.includes("external") || t.includes("outsourced")) return "globe";
    if (t.includes("segmentation") || t.includes("stakeholder")) return "pie-chart";
    if (t.includes("community") || t.includes("nurture")) return "heart";
    if (t.includes("collaboration") || t.includes("networking")) return "share-2";
    if (t.includes("algorithm") || t.includes("ai")) return "cpu";
    if (t.includes("data") || t.includes("sharing")) return "database";
    if (t.includes("technology") || t.includes("disruptive")) return "zap";
    if (t.includes("asset")) return "hard-drive";
    if (t.includes("utilization") || t.includes("efficiency")) return "activity";
    if (t.includes("engagement")) return "message-circle";
    if (t.includes("social")) return "at-sign";
    if (t.includes("risk") || t.includes("sustainability")) return "shield-alert";
    if (t.includes("process") || t.includes("workflow")) return "git-branch";
    if (t.includes("objective") || t.includes("performance") || t.includes("okr")) return "bar-chart-3";
    if (t.includes("innovation") || t.includes("sprint")) return "lightbulb";
    return "layers";
};


const closeModal = () => {
    document.getElementById('details-modal').classList.add('hidden');
};

// Click outside to close logic
window.onclick = function(event) {
    const modal = document.getElementById('details-modal');
    if (event.target == modal) {
        closeModal();
    }
};

const truncate = (str, n) => (str && str.length > n) ? str.substr(0, n - 1) + '...' : (str || "");

window.onload = init;
