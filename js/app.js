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

    const exportBtn = document.getElementById('export-json');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (!currentResults) return;
            const outputArray = currentResults.map(q => {
                const out = {
                    "Attribute": q.Attribute,
                    "Questions": q.Question,
                    "Most Representative Statement": q["Most Representative Statement"],
                    "Score": q.Score,
                    "Level": q.Level,
                    "Justification for Level": q["Justification for Level"],
                    "Justification as to why other statements are not relevant": q["Justification as to why other statements are not relevant"],
                    "Summary Statement": q["Summary Statement"]
                };
                for(let i=1; i<=q['Extract Count']; i++) {
                    if (q[`Extract Statement ${i}`]) {
                        out[`Extract Statement ${i}`] = q[`Extract Statement ${i}`];
                    }
                }
                return out;
            });
            const blob = new Blob([JSON.stringify(outputArray, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "MIE_Audit_Report.json";
            a.click();
            URL.revokeObjectURL(url);
        });
    }
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
    const analyzeBtn = document.getElementById('analyze-btn');
    const selectedDims = Array.from(document.querySelectorAll('input[name="dimension"]:checked'))
        .map(i => i.value);

    if (!fileInput.files[0]) return;

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = 'Analyzing... <i data-lucide="loader-2" class="animate-spin"></i>';
    if (window.lucide) lucide.createIcons();

    document.getElementById('hero-hub').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');

    // Re-enabling stylized data stream with Mixed Colors (Black, Green, White)
    const leftStream = document.getElementById('data-stream-left');
    const rightStream = document.getElementById('data-stream-right');
    const progressPct = document.getElementById('progress-pct');

    const streamInterval = setInterval(() => {
        const hex = () => Math.random().toString(16).substring(2, 6).toUpperCase();
        const colors = ["#000000", "#00ff88", "#ffffff", "#004422"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const bit = `<span style="color:${color}">${hex()}</span> `;
        if (leftStream) leftStream.innerHTML = bit + leftStream.innerHTML.substring(0, 800);
        if (rightStream) rightStream.innerHTML = bit + rightStream.innerHTML.substring(0, 800);
    }, 80);

    const formData = new FormData();
    formData.append('pdf', fileInput.files[0]);
    formData.append('dimensions', selectedDims.join(','));

    try {
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 96) progress += 0.4;
            if (progressPct) progressPct.innerText = Math.floor(progress) + '%';
        }, 120);

        const response = await fetch(`${API_BASE}/analyse`, {
            method: 'POST', body: formData
        });

        if (!response.ok) throw new Error(`Engine Error: ${response.status}`);
        const data = await response.json();
        
        clearInterval(progressInterval);
        clearInterval(streamInterval);
        
        if (data.success) {
            currentResults = data.results;
            setTimeout(() => {
                document.getElementById('loading-state').classList.add('hidden');
                document.getElementById('results-dashboard').classList.remove('hidden');
                renderResultsGrid(data.results, data.meta);
            }, 500);
        } else {
            throw new Error(data.error || 'The analysis engine encountered an internal issue.');
        }
    } catch (err) {
        clearInterval(streamInterval);
        console.error('[MIE_UI_ERR]', err);
        alert('ANALYSIS FAILED:\n' + err.message);
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('hero-hub').classList.remove('hidden');
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = 'Initialize Analysis <i data-lucide="terminal"></i>';
        if (window.lucide) lucide.createIcons();
    }
};

const renderResultsGrid = (results, meta) => {
    const grid = document.getElementById('audit-bento-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!results || results.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #888;">No audit signals identified.</div>';
        return;
    }

    const grouped = {};
    results.forEach(r => {
        const theme = r.Theme || 'Standard';
        if (!grouped[theme]) grouped[theme] = [];
        grouped[theme].push(r);
    });

    Object.entries(grouped).forEach(([themeName, questions], idx) => {
        const themeColor = THEME_COLORS[idx % THEME_COLORS.length] || '#a0e7a0';
        
        const section = document.createElement('div');
        section.className = 'theme-section';
        section.innerHTML = `
            <div class="theme-section-header" style="border-left: 6px solid ${themeColor}; background:#fff; padding:20px 32px; border-radius:16px; margin-bottom:24px; box-shadow:0 10px 30px rgba(0,0,0,0.02); border:1px solid #eee;">
                <h3 style="color:black; font-size:22px; margin:0;">${themeName}</h3>
            </div>
            <div class="questions-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:24px; margin-bottom:48px;"></div>
        `;

        const qGrid = section.querySelector('.questions-grid');
        questions.forEach(q => {
            const card = document.createElement('div');
            card.className = 'result-card';
            const displayLevel = q.Level && q.Level.includes('(') ? q.Level.split('(')[1].replace(')', '') : (q.Level || 'N/A');

            card.innerHTML = `
                <div style="font-size:10px; color:#aaa; margin-bottom:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">${q.QuestionID || 'DIM-ERR'}</div>
                <div style="font-weight:700; font-size:16px; margin-bottom:24px; line-height:1.4; flex-grow:1; color:black;">${q.Question || 'Unknown Dimension'}</div>
                
                <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top: 1px solid #f0f0f0; padding-top:20px;">
                    <div>
                        <div style="font-size:10px; color:#aaa; font-weight:800; text-transform:uppercase; margin-bottom:4px;">Maturity Level</div>
                        <span style="background:${q.LevelColor || '#888'}15; color:${q.LevelColor || '#888'}; padding:4px 12px; border-radius:12px; font-weight:800; font-size:10px; text-transform: uppercase;">${displayLevel}</span>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:10px; color:#aaa; font-weight:800; text-transform:uppercase; margin-bottom:2px;">Audit Score</div>
                        <div style="font-size:32px; font-weight:900; color:black; line-height:1;">${q.Score || 0}.0</div>
                    </div>
                </div>
            `;
            card.onclick = () => openDetails(q);
            qGrid.appendChild(card);
        });

        grid.appendChild(section);
    });

    if (window.lucide) lucide.createIcons();
};

const openDetails = (q) => {
    currentActiveQuestion = q;
    const modal = document.getElementById('details-modal');
    const body = document.getElementById('modal-body');
    
    if (!modal || !body) return;

    body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; border-bottom:1px solid #eee; padding-bottom:24px; gap:40px;">
            <div style="flex-grow:1;">
                <h2 style="color:black; margin:0 0 12px 0; font-size:24px; font-weight:900;">Audit Intelligence: ${q.QuestionID || 'N/A'}</h2>
                <div style="font-size:18px; font-weight:700; color:#111; line-height:1.4;">${q.Question || 'N/A'}</div>
            </div>
            <button id="copy-report-btn" class="primary-pill-btn" style="flex-shrink:0; background: var(--accent-green); color: black; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 700; cursor: pointer; display:flex; align-items:center; gap:8px; box-shadow: 0 4px 12px rgba(52, 168, 83, 0.2);">
                <i data-lucide="copy" style="width:18px;"></i> Copy Deterministic Report
            </button>
        </div>

        <div style="background:white; color:black; font-family:'Inter', sans-serif;">
            
            <div style="margin-bottom:32px; padding:20px; background:#fcfcfc; border-radius:20px; border:1px solid #f0f0f0;">
                <label style="display:block; text-transform:uppercase; font-size:10px; font-weight:800; color:#888; margin-bottom:8px; letter-spacing:1px;">Strategic Pillar / Attribute</label>
                <div style="font-size:15px; font-weight:700; color:black;">${q.Attribute || 'N/A'}</div>
            </div>

            <div style="margin-bottom:32px;">
                <label style="display:block; text-transform:uppercase; font-size:10px; font-weight:800; color:#888; margin-bottom:12px; letter-spacing:1px;">Representative Audit Statement</label>
                <div style="font-style:italic; line-height:1.8; color:#111; font-size:16px; background:#f7faf8; padding:28px; border-radius:24px; border-left:8px solid var(--accent-green); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">"${q["Most Representative Statement"] || 'No direct statement identified.'}"</div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom:32px; padding:24px; background:#f9f9f9; border-radius:32px;">
                <div>
                    <label style="display:block; text-transform:uppercase; font-size:10px; font-weight:800; color:#888; margin-bottom:6px; letter-spacing:1px;">Audit Score</label>
                    <div style="font-size:48px; font-weight:900; color:black;">${q.Score || 0}.0</div>
                </div>
                <div>
                    <label style="display:block; text-transform:uppercase; font-size:10px; font-weight:800; color:#888; margin-bottom:6px; letter-spacing:1px;">Maturity Level</label>
                    <div style="font-size:18px; font-weight:700; color:black; margin-top:14px;">${q.Level || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-bottom:32px;">
                <label style="display:block; text-transform:uppercase; font-size:10px; font-weight:800; color:#888; margin-bottom:12px; letter-spacing:1px;">Justification for Level</label>
                <div style="line-height:1.8; color:black; font-size:14px; white-space:pre-wrap;">${q["Justification for Level"] || 'Detailed justification unavailable.'}</div>
            </div>

            <div style="margin-bottom:32px;">
                <label style="display:block; text-transform:uppercase; font-size:10px; font-weight:800; color:#888; margin-bottom:12px; letter-spacing:1px;">Rationale for Rejected Levels</label>
                <div style="line-height:1.8; color:black; font-size:14px; white-space:pre-wrap;">${q["Justification as to why other statements are not relevant"] || 'Rejection rationale unavailable.'}</div>
            </div>

            <div style="margin-bottom:40px; padding-top:32px; border-top:1px solid #eee;">
                <label style="display:block; text-transform:uppercase; font-size:10px; font-weight:800; color:#888; margin-bottom:12px; letter-spacing:1px;">Comprehensive Summary</label>
                <div style="line-height:1.9; color:black; font-size:15px; white-space:pre-wrap;">${q["Summary Statement"] || 'Summary analysis unavailable.'}</div>
            </div>

            <div class="extracts-section">
                <label style="display:block; text-transform:uppercase; font-size:10px; font-weight:800; color:#888; margin-bottom:20px; letter-spacing:1px;">Verbatim Evidence Fragments (Page-Ordered Audit Trail)</label>
                <div id="extract-list-container"></div>
            </div>
        </div>
    `;

    const extractContainer = body.querySelector('#extract-list-container');
    let extractHtml = '';
    for(let i=1; i<=100; i++) {
        if(q[`Extract Statement ${i}`]) {
            extractHtml += `
                <div style="margin-bottom:20px; padding:20px; border-left:6px solid var(--accent-green); background:#fdfdfd; border-radius:0 16px 16px 0; border: 1px solid #f0f0f0; border-left-width: 6px;">
                    <div style="font-size:10px; font-weight:800; color:#aaa; text-transform:uppercase; margin-bottom:8px;">Evidence Fragment ${i} (Page ${q[`Extract Page ${i}`] || '?'})</div>
                    <div style="font-size:14px; color:black; line-height:1.7; font-style:italic;">"${q[`Extract Statement ${i}`]}"</div>
                </div>
            `;
        }
    }
    extractContainer.innerHTML = extractHtml || '<div style="color:#aaa; font-style:italic;">No discrete verbatim evidence identified.</div>';

    document.getElementById('copy-report-btn').onclick = () => {
        const textToCopy = q.exactFormat || `Score: ${q.Score}\nLevel: ${q.Level}`;
        copyToClipboard(textToCopy);
    };

    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
};

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copy-report-btn');
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" style="width:16px;"></i> Result Copied';
        btn.style.background = '#e8f5e9';
        btn.style.color = '#2e7d32';
        if (window.lucide) lucide.createIcons();
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.style.background = 'var(--accent-green)';
            btn.style.color = 'black';
            if (window.lucide) lucide.createIcons();
        }, 2000);
    });
};

window.onload = init;
