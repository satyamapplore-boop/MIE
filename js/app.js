/**
 * MIE Enterprise Analysis Engine — Frontend Orchestrator v2.5
 */

const API_BASE = 'http://localhost:4242/api';
let currentResults = null;
let currentActiveQuestion = null;

const THEME_COLORS = [
    '#00ff88', '#00ddeb', '#a29bfe', '#f0db4f', '#ff6b6b', '#ffa502', 
    '#74b9ff', '#fd79a8', '#55efc4', '#e17055', '#b2bec3', '#6c5ce7'
];

const init = async () => {
    lucide.createIcons();
    await fetchDimensions();

    const fileInput = document.getElementById('file-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const dropZone = document.getElementById('drop-zone');

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            dropZone.querySelector('p').textContent = `✓ Ready: ${file.name}`;
            dropZone.style.borderColor = 'var(--accent-green)';
            dropZone.style.background = 'rgba(0,255,136,0.05)';
            analyzeBtn.disabled = false;
        }
    });

    analyzeBtn.addEventListener('click', startAnalysis);

    document.getElementById('close-modal').onclick = () => {
        document.getElementById('details-modal').classList.add('hidden');
    };
};

const fetchDimensions = async () => {
    try {
        const res = await fetch(`${API_BASE}/dimensions`);
        const data = await res.json();
        if (data.success) {
            renderDimensionsSelector(data.dimensions);
        }
    } catch (err) {
        console.error('Failed to fetch dimensions:', err);
    }
};

const renderDimensionsSelector = (dims) => {
    const list = document.getElementById('dimensions-list');
    const themes = [];
    dims.forEach(d => {
        if (!themes.find(t => t.id === d.id)) themes.push({ id: d.id, title: d.title });
    });

    list.innerHTML = themes.map((t, i) => `
        <label class="dim-pill">
            <input type="checkbox" name="dimension" value="${t.id}" checked>
            <span>Theme ${t.id}: ${t.title}</span>
        </label>
    `).join('');
};

const startAnalysis = async () => {
    const fileInput = document.getElementById('file-input');
    const selectedDims = Array.from(document.querySelectorAll('input[name="dimension"]:checked'))
        .map(i => i.value);

    if (!fileInput.files[0]) return;

    document.getElementById('hero-hub').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');

    const formData = new FormData();
    formData.append('pdf', fileInput.files[0]);
    formData.append('dimensions', selectedDims.join(','));

    try {
        const progressEl = document.getElementById('progress-pct');
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 95) progress += Math.random() * 2;
            if (progressEl) progressEl.innerText = Math.floor(progress) + '%';
        }, 500);

        const response = await fetch(`${API_BASE}/analyse`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        clearInterval(progressInterval);
        if (progressEl) progressEl.innerText = '100%';

        if (data.success) {
            currentResults = data.results;
            setTimeout(() => {
                document.getElementById('loading-state').classList.add('hidden');
                document.getElementById('results-dashboard').classList.remove('hidden');
                renderResultsGrid(data.results, data.meta);
            }, 500);
        } else {
            throw new Error(data.error || 'Analysis failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('hero-hub').classList.remove('hidden');
    }
};

const renderResultsGrid = (results, meta) => {
    const grid = document.getElementById('audit-bento-grid');
    grid.innerHTML = '';

    const grouped = {};
    results.forEach(r => {
        const theme = r.Theme || 'Standard';
        if (!grouped[theme]) grouped[theme] = [];
        grouped[theme].push(r);
    });

    Object.entries(grouped).forEach(([themeName, questions], idx) => {
        const color = THEME_COLORS[idx % THEME_COLORS.length];
        
        const section = document.createElement('div');
        section.className = 'theme-section';
        section.innerHTML = `
            <div style="background:${color}11; padding:20px; border-radius:12px; margin-bottom:12px; border:1px solid ${color}33">
                <h3 style="color:${color}; font-size:18px;">${themeName}</h3>
            </div>
            <div class="questions-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:12px; margin-bottom:32px;"></div>
        `;

        const qGrid = section.querySelector('.questions-grid');
        questions.forEach(q => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.style.cssText = `background:white; color:black; padding:20px; border-radius:12px; cursor:pointer; border:1px solid #eee; transition: transform 0.2s;`;
            card.onmouseover = () => card.style.transform = 'scale(1.02)';
            card.onmouseout = () => card.style.transform = 'scale(1)';
            
            card.innerHTML = `
                <div style="font-size:11px; color:#888; margin-bottom:8px; font-weight:700;">${q.QuestionID}</div>
                <div style="font-weight:700; font-size:14px; margin-bottom:12px; height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${q.Question}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top: auto;">
                    <span style="background:${q.LevelColor}; color:white; padding:4px 12px; border-radius:20px; font-weight:800; font-size:11px; text-transform: uppercase;">${q.Level.split('(')[1].replace(')', '')}</span>
                    <span style="font-size:24px; font-weight:900; color:${q.LevelColor}">${q.Score}.0</span>
                </div>
            `;
            card.onclick = () => openDetails(q);
            qGrid.appendChild(card);
        });

        grid.appendChild(section);
    });

    lucide.createIcons();
};

const openDetails = (q) => {
    currentActiveQuestion = q;
    const modal = document.getElementById('details-modal');
    const body = document.getElementById('modal-body');
    
    // UI Style: White background, Black text, Sans-serif font (Inter)
    body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
            <h2 style="color:white; margin:0; font-size:22px;">Audit Intelligence: ${q.QuestionID}</h2>
            <button id="copy-report-btn" style="background: var(--accent-green); color: black; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; display:flex; align-items:center; gap:8px;">
                <i data-lucide="copy" style="width:16px;"></i> Copy Report
            </button>
        </div>

        <div style="background:white; color:black; border-radius:16px; padding:32px; font-family:'Inter', sans-serif; box-shadow: 0 20px 40px rgba(0,0,0,0.3); max-height: 70vh; overflow-y: auto;">
            
            <div class="report-row" style="margin-bottom:24px;">
                <label style="display:block; text-transform:uppercase; font-size:11px; font-weight:800; color:#888; margin-bottom:6px; letter-spacing:1px;">Attribute</label>
                <div style="font-size:18px; font-weight:700;">${q.Attribute}</div>
            </div>

            <div class="report-row" style="margin-bottom:24px;">
                <label style="display:block; text-transform:uppercase; font-size:11px; font-weight:800; color:#888; margin-bottom:6px; letter-spacing:1px;">Questions</label>
                <div style="font-size:18px; font-weight:700;">${q.Question}</div>
            </div>

            <div class="report-row" style="margin-bottom:24px;">
                <label style="display:block; text-transform:uppercase; font-size:11px; font-weight:800; color:#888; margin-bottom:6px; letter-spacing:1px;">Most Representative Statement</label>
                <div style="font-style:italic; line-height:1.6; color:#333;">${q["Most Representative Statement"]}</div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:24px; padding-bottom:24px; border-bottom: 1px solid #eee;">
                <div>
                    <label style="display:block; text-transform:uppercase; font-size:11px; font-weight:800; color:#888; margin-bottom:6px; letter-spacing:1px;">Score</label>
                    <div style="font-size:32px; font-weight:900; color:${q.LevelColor}">${q.Score}.0</div>
                </div>
                <div>
                    <label style="display:block; text-transform:uppercase; font-size:11px; font-weight:800; color:#888; margin-bottom:6px; letter-spacing:1px;">Level</label>
                    <div style="font-size:18px; font-weight:700;">${q.Level}</div>
                </div>
            </div>

            <div class="report-row" style="margin-bottom:24px;">
                <label style="display:block; text-transform:uppercase; font-size:11px; font-weight:800; color:#888; margin-bottom:12px; letter-spacing:1px;">Justification for Level</label>
                <div style="line-height:1.7; color:#444; white-space:pre-wrap;">${q["Justification for Level"]}</div>
            </div>

            <div class="report-row" style="margin-bottom:24px;">
                <label style="display:block; text-transform:uppercase; font-size:11px; font-weight:800; color:#888; margin-bottom:12px; letter-spacing:1px;">Justification as to why other statements are not relevant</label>
                <div style="line-height:1.7; color:#444; white-space:pre-wrap;">${q["Justification as to why other statements are not relevant"]}</div>
            </div>

            <div class="report-row" style="background:#f8f9fa; padding:24px; border-radius:12px; border:1px solid #eee; margin-bottom:24px;">
                <label style="display:block; text-transform:uppercase; font-size:11px; font-weight:800; color:#888; margin-bottom:12px; letter-spacing:1px;">Summary Statement</label>
                <div style="line-height:1.8; color:#222; font-size:15px; white-space:pre-wrap;">${q["Summary Statement"]}</div>
            </div>

            <div class="extracts-section">
                <label style="display:block; text-transform:uppercase; font-size:11px; font-weight:800; color:#888; margin-bottom:16px; letter-spacing:1px;">Extract Statements (Audit Evidence)</label>
                <div id="extract-list-container"></div>
            </div>
        </div>
    `;

    // Render extracts (Exactly 1-6)
    const extractContainer = body.querySelector('#extract-list-container');
    let extractHtml = '';
    for(let i=1; i<=6; i++) {
        if(q[`Extract Statement ${i}`]) {
            extractHtml += `
                <div style="margin-bottom:16px; padding:16px; border-left:4px solid ${q.LevelColor}; background:#fafafa; border-radius:0 8px 8px 0;">
                    <div style="font-size:10px; font-weight:800; color:#aaa; text-transform:uppercase; margin-bottom:4px;">Extract ${i} (Page ${q[`Extract Page ${i}`]})</div>
                    <div style="font-size:13px; color:#333; line-height:1.6; font-style:italic;">"${q[`Extract Statement ${i}`]}"</div>
                </div>
            `;
        }
    }
    extractContainer.innerHTML = extractHtml || '<div style="color:#aaa; font-style:italic;">No extracts identified.</div>';

    document.getElementById('copy-report-btn').onclick = () => copyToClipboard(currentActiveQuestion.exactFormat);

    modal.classList.remove('hidden');
    lucide.createIcons();
};

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('Audit report copied to clipboard!');
    });
};

window.onload = init;
