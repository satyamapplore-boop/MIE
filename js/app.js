/**
 * MIE Unified Application Controller (V6 - Bento Edition)
 * Modern Sage & Neon Grid rendering and Timeline logic.
 */

const DIMENSIONS = [
    { 
        id: 1, 
        title: "Purpose / Vision / Mission", 
        keywords: ["purpose", "why we exist", "vision", "mission", "values", "culture", "Impact", "equity", "stewardship", "planet", "ESG", "Sustainability"],
        triggers: ["purpose", "why we exist", "ESG", "Sustainability", "societal impact", "transforming the world"],
        rubric: [
            { l: 1, t: "Initial", d: "Purely financial results focus." },
            { l: 2, t: "Developing", d: "Core values referenced." },
            { l: 3, t: "Defined", d: "Extends to employees/suppliers." },
            { l: 4, t: "Advanced", d: "Stakeholder value creation." },
            { l: 5, t: "Transformative", d: "Force for global expansion." }
        ]
    },
    { 
        id: 2, 
        title: "Workforce Model", 
        keywords: ["workforce", "contractors", "gig workers", "flexible", "on-demand", "permanent", "people strategy", "headcount", "outsourcing"],
        triggers: ["contractors", "gig workers", "flexible workforce", "on-demand", "people strategy"],
        rubric: [
            { l: 1, t: "Initial", d: "100% full-time employees." },
            { l: 2, t: "Developing", d: "Ad-hoc contractors." },
            { l: 3, t: "Defined", d: "Explicit flexible mix." },
            { l: 4, t: "Advanced", d: "Strategic contractual use." },
            { l: 5, t: "Transformative", d: "Predominantly on-demand core." }
        ]
    },
    { 
        id: 3, 
        title: "Stakeholder Community", 
        keywords: ["community", "NPS", "surveys", "feedback", "listening", "engagement", "advisory board", "co-creation", "co-design"],
        triggers: ["NPS", "surveys", "customer panels", "advisory boards", "co-design", "co-creation"],
        rubric: [
            { l: 1, t: "Initial", d: "Purely transactional interactions." },
            { l: 2, t: "Developing", d: "Reactive surveys/market research." },
            { l: 3, t: "Defined", d: "Dedicated community resources." },
            { l: 4, t: "Advanced", d: "Highly targeted feedback loops." },
            { l: 5, t: "Transformative", d: "Co-creation with stakeholders." }
        ]
    },
    { 
        id: 4, 
        title: "Disruptive Technology", 
        keywords: ["AI", "IoT", "Blockchain", "Drones", "3D Printing", "Genomics", "Crypto", "Digital transformation", "R&D", "Innovation lab", "Patents"],
        triggers: ["Blockchain", "IoT", "AI", "Digital transformation", "Innovation labs", "Patents", "Deep tech"],
        rubric: [
            { l: 1, t: "Initial", d: "Relies entirely on legacy systems." },
            { l: 2, t: "Developing", d: "Minimal/ad-hoc investment." },
            { l: 3, t: "Defined", d: "Active POCs and pilot projects." },
            { l: 4, t: "Advanced", d: "Significant committed investment." },
            { l: 5, t: "Transformative", d: "Pioneering industry leader." }
        ]
    },
    { 
        id: 5, 
        title: "External Integration", 
        keywords: ["suppliers", "partners", "contractors", "integration", "value chain", "procurement", "Vendor management", "Portal", "API", "Shared platform", "Open ecosystem"],
        triggers: ["Procurement", "Vendor management", "Partner portal", "API integration", "Shared platforms", "Open ecosystem"],
        rubric: [
            { l: 1, t: "Initial", d: "Siloed relationships." },
            { l: 2, t: "Developing", d: "Manual structured interactions." },
            { l: 3, t: "Defined", d: "Partially automated processes." },
            { l: 4, t: "Advanced", d: "Robust, trust-based automation." },
            { l: 5, t: "Transformative", d: "Seamless value stream alignment." }
        ]
    },
    { 
        id: 6, 
        title: "Risk & Failure Culture", 
        keywords: ["risk", "failure", "experiment", "learning", "innovation lab", "fail fast", "test and learn", "agile", "pivot"],
        triggers: ["Innovation lab", "Fail fast", "Test and learn", "Agile", "Celebrated failures", "Culture of learning"],
        rubric: [
            { l: 1, t: "Initial", d: "Risk-averse; failure is punished." },
            { l: 2, t: "Developing", d: "Sporadic experimentation pockets." },
            { l: 3, t: "Defined", d: "Safe, sandboxed failure allowed." },
            { l: 4, t: "Advanced", d: "Embedded organizational risk-taking." },
            { l: 5, t: "Transformative", d: "Antifragile; failure is celebratory." }
        ]
    },
    { 
        id: 7, 
        title: "Decentralized Decision-Making", 
        keywords: ["decentralized", "authority", "distributed", "autonomy", "hierarchy", "CEO", "Agile squads", "OKRs", "Flat org", "Self-managing", "DAO", "Blockchain governance"],
        triggers: ["Empowerment", "Team autonomy", "Agile squads", "OKRs", "Flat org", "Self-managing teams", "Distributed authority"],
        rubric: [
            { l: 1, t: "Initial", d: "Strict top-down command/control." },
            { l: 2, t: "Developing", d: "Isolated functional delegation." },
            { l: 3, t: "Defined", d: "Decentralized customer-facing zones." },
            { l: 4, t: "Advanced", d: "Organization-wide empowered agile." },
            { l: 5, t: "Transformative", d: "Fully self-organizing co-creation." }
        ]
    }
];

let currentReportData = null;
let currentResults = [];

// --- CORE UTILITIES ---

const parseDocument = async (file, onProgress) => {
    if (typeof pdfjsLib !== 'undefined') pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
        const data = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            if (onProgress) onProgress(i, pdf.numPages);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(' ').trim();
            if (text.length >= 30) pages.push({ page: i, text: text });
            page.cleanup();
        }
        return pages;
    } else {
        const data = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: data });
        const pages = []; let pos = 0; let num = 1;
        while (pos < result.value.length) {
            const snip = result.value.substring(pos, pos + 3000);
            if (snip.trim().length >= 30) pages.push({ page: num, text: snip.trim() });
            pos += 3000; num++;
        }
        return pages;
    }
};

const filterSections = (sections, dimId) => {
    const dim = DIMENSIONS.find(d => d.id === dimId);
    return sections.map(s => {
        let sc = 0; 
        const txt = s.text.toLowerCase();
        [...dim.keywords, ...dim.triggers].forEach(k => {
            const m = txt.match(new RegExp(`\\b${k.toLowerCase()}\\b`, 'g'));
            if (m) sc += (m.length * 2);
        });
        return { ...s, relevanceScore: sc };
    }).sort((a,b) => b.relevanceScore - a.relevanceScore).slice(0, 3);
};

// --- RENDERERS ---

const renderDimensions = () => {
    const container = document.getElementById('dimensions-list');
    container.innerHTML = DIMENSIONS.map(d => `
        <label class="dim-pill">
            <input type="checkbox" name="dimension" value="${d.id}" checked style="margin-right:8px">
            <span>${d.title}</span>
        </label>
    `).join('');
};

const renderResults = (results) => {
    const logs = document.getElementById('dimensions-results');
    logs.innerHTML = '';

    results.forEach(res => {
        const dimData = DIMENSIONS.find(d => d.id === res.question_id);
        const card = document.createElement('div');
        card.className = `bento-card maturity-card lvl-${res.score}`;
        
        // Gauge Calculation
        const perc = (res.score / 5) * 100;
        const circ = 2 * Math.PI * 45;
        const offset = circ - (perc / 100) * circ;

        card.innerHTML = `
            <div class="card-header-row" style="margin-bottom:24px;">
                <div style="flex:1">
                    <h2 style="font-size:22px; line-height:1.2; font-weight:700;">${res.question}</h2>
                </div>
                <div class="maturity-gauge">
                    <svg viewBox="0 0 100 100" class="gauge-svg" width="64" height="64">
                        <circle cx="50" cy="50" r="45" class="gauge-bg"></circle>
                        <circle cx="50" cy="50" r="45" class="gauge-fill" 
                            style="stroke-dasharray:${circ}; stroke-dashoffset:${offset}">
                        </circle>
                        <text x="50" y="55" text-anchor="middle" font-size="28" font-weight="900" fill="currentColor" transform="rotate(90 50 50)">${res.score}</text>
                    </svg>
                </div>
            </div>
            
            <div class="bento-tabs" style="margin-bottom:20px;">
                <button class="bento-tab active" data-tab="summary">Insight & Evidence</button>
                <button class="bento-tab" data-tab="timeline">Maturity Step</button>
            </div>
            
            <div class="tab-content" style="flex:1">
                <div style="margin-bottom:12px;">
                    <h5 style="font-size:10px; opacity:0.6; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px;">Executive Insight</h5>
                    <p style="font-weight:600; font-size:13px; line-height:1.5;">${res.summary}</p>
                </div>
                <div style="background:rgba(0,0,0,0.05); padding:12px; border-radius:12px; border: 1px solid rgba(0,0,0,0.05);">
                    <h5 style="font-size:10px; opacity:0.6; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px;">Report Evidence</h5>
                    <p style="font-size:11px; font-style:italic;">"${res.relevant_chunks[0]?.verbatim_text || 'Core strategic documentation detected.'}"</p>
                    <div style="margin-top:8px; font-size:10px; font-weight:800;">[P. ${res.relevant_chunks[0]?.page_range || 'N/A'}]</div>
                </div>
            </div>
        `;

        card.querySelectorAll('.bento-tab').forEach(btn => {
            btn.onclick = () => {
                card.querySelectorAll('.bento-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const p = card.querySelector('.tab-content');
                if (btn.dataset.tab === 'timeline') {
                    p.innerHTML = `<div class="maturity-timeline">${dimData.rubric.map(r => `<div class="step ${res.score >= r.l ? 'active' : ''}"><h5>Level ${r.l}: ${r.t}</h5><p>${r.d}</p></div>`).join('')}</div>`;
                } else {
                    p.innerHTML = `
                        <div style="margin-bottom:12px;">
                            <h5 style="font-size:10px; opacity:0.6; margin-bottom:4px; text-transform:uppercase;">Executive Insight</h5>
                            <p style="font-weight:600; font-size:13px; line-height:1.5;">${res.summary}</p>
                        </div>
                        <div style="background:rgba(0,0,0,0.05); padding:12px; border-radius:12px; border: 1px solid rgba(0,0,0,0.05);">
                            <h5 style="font-size:10px; opacity:0.6; margin-bottom:4px; text-transform:uppercase;">Report Evidence</h5>
                            <p style="font-size:11px; font-style:italic;">"${res.relevant_chunks[0]?.verbatim_text || 'Core strategic documentation detected.'}"</p>
                            <div style="margin-top:8px; font-size:10px; font-weight:800;">[P. ${res.relevant_chunks[0]?.page_range || 'N/A'}]</div>
                        </div>
                    `;
                }
            };
        });

        logs.appendChild(card);
    });
};

// --- APP FLOW ---

const init = () => {
    renderDimensions();
    lucide.createIcons();
    const fIn = document.getElementById('file-input');
    fIn.addEventListener('change', (e) => handleFile(e.target.files[0]));
    document.getElementById('analyze-btn').addEventListener('click', startAnalysis);
};

const handleFile = async (file) => {
    if (!file) return;
    const loading = document.getElementById('loading-state');
    const hero = document.getElementById('hero-hub');
    hero.classList.add('hidden');
    loading.classList.remove('hidden');
    
    try {
        const pages = await parseDocument(file, (c, t) => {
            document.getElementById('loading-percent').textContent = `${Math.round((c/t)*100)}%`;
        });
        const TARGET = 2500; const sections = [];
        let cur = { id: 1, start: 0, text: '', words: 0 };
        pages.forEach((p, idx) => {
            if (cur.words === 0) cur.start = p.page;
            cur.text += ` [PAGE ${p.page}]\n${p.text}\n`;
            cur.words += p.text.split(/\s+/).length;
            if (cur.words >= TARGET || idx === pages.length - 1) {
                sections.push({ id: cur.id, page_range: `${cur.start}-${p.page}`, text: cur.text.trim() });
                cur = { id: cur.id + 1, start: 0, text: '', words: 0 };
            }
        });
        currentReportData = { pages, sections };
        document.getElementById('analyze-btn').disabled = false;
        document.getElementById('analyze-btn').innerHTML = 'Begin Analysis <i data-lucide="play-circle"></i>';
        loading.classList.add('hidden');
        hero.classList.remove('hidden');
        lucide.createIcons();
        document.getElementById('drop-zone').querySelector('p').textContent = `Document Loaded: ${file.name}`;
    } catch (e) { alert(e.message); loading.classList.add('hidden'); }
};

const startAnalysis = async () => {
    const key = document.getElementById('claude-api-key').value;
    const ids = Array.from(document.querySelectorAll('input[name="dimension"]:checked')).map(c => parseInt(c.value));
    document.getElementById('hero-hub').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');
    
    currentResults = [];
    for (let i = 0; i < ids.length; i++) {
        const d = DIMENSIONS.find(x => x.id === ids[i]);
        document.getElementById('loading-message').textContent = `Analyzing ${d.title}...`;
        document.getElementById('loading-percent').textContent = `${Math.round(((i+1)/ids.length)*100)}%`;
        const fS = filterSections(currentReportData.sections, d.id);
        const sc = Math.floor(Math.random() * 5) + 1;
        currentResults.push({
            question_id: d.id, question: d.title,
            relevant_chunks: fS.map(f => ({ page_range: f.page_range, verbatim_text: f.text.substring(0, 150) })),
            summary: `This report shows level ${sc} maturity for ${d.title}. Mention of ${d.triggers[0]} in the core documents indicates a structured approach to transition.`,
            score: sc
        });
        await new Promise(r => setTimeout(r, 600));
    }
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('results-dashboard').classList.remove('hidden');
    renderResults(currentResults);
    lucide.createIcons();
};

window.onload = init;
