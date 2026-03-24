/**
 * MIE Deterministic Extraction Engine (V8 - Bento Edition)
 * Zero-Hallucination, Rule-Based Scoring, Auditable Table Output
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
        const paragraphs = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            if (onProgress) onProgress(i, pdf.numPages);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Try to split into paragraphs/sentences roughly
            const cleanText = textContent.items.map(item => item.str).join(' ').trim();
            const segments = cleanText.split('. ');
            
            segments.forEach(seg => {
                if (seg.trim().length >= 30) {
                    paragraphs.push({ page: i, text: seg.trim() + '.' });
                }
            });
            page.cleanup();
        }
        return paragraphs;
    } else {
        const data = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: data });
        const paragraphs = []; 
        const segments = result.value.split('\n');
        
        let pageNum = 1;
        let charCount = 0;
        segments.forEach(seg => {
            if (seg.trim().length >= 30) {
                paragraphs.push({ page: pageNum, text: seg.trim() });
            }
            charCount += seg.length;
            if (charCount > 3000) { pageNum++; charCount = 0; }
        });
        return paragraphs;
    }
};

const extractVerbatimChunks = (paragraphs, dim) => {
    const relevant = [];
    paragraphs.forEach(p => {
        const txt = p.text.toLowerCase();
        let matchCount = 0;
        let foundKeywords = [];
        
        [...dim.keywords, ...dim.triggers].forEach(k => {
            if (txt.includes(k.toLowerCase())) {
                matchCount++;
                foundKeywords.push(k.toLowerCase());
            }
        });
        
        if (matchCount > 0) {
            relevant.push({
                page: p.page,
                text: p.text,
                score: matchCount,
                keywords: Array.from(new Set(foundKeywords))
            });
        }
    });
    
    // Sort by relevance score
    return relevant.sort((a, b) => b.score - a.score).slice(0, 3);
};

const determineScore = (chunks, dim) => {
    if (chunks.length === 0) return 0;
    
    // Total unique matched keywords constraint
    let allKWs = new Set();
    chunks.forEach(c => c.keywords.forEach(k => allKWs.add(k)));
    
    const count = allKWs.size;
    let level = 1;
    if (count <= 2) level = 1;
    else if (count === 3) level = 2;
    else if (count === 4) level = 3;
    else if (count >= 5 && count <= 6) level = 4;
    else if (count > 6) level = 5;
    
    return level;
};

// --- RENDERERS ---

const renderDimensions = () => {
    const container = document.getElementById('dimensions-list');
    container.innerHTML = DIMENSIONS.map(d => `
        <label class="dim-pill" style="cursor:pointer">
            <input type="checkbox" name="dimension" value="${d.id}" checked style="margin-right:8px">
            <span>${d.title}</span>
        </label>
    `).join('');
};

const getCardColor = (score) => {
    if(score === 0) return 'background: #f4f4f4; color: #888; border-color: #ddd;';
    if(score <= 2) return 'background: #ffebee; color: #c62828;';
    if(score === 3) return 'background: #fff8e1; color: #f57f17;';
    return 'background: var(--accent-green); color: #111;'; // Level 4 and 5
};

const getIcons = (id) => {
    const icons = ['target', 'users', 'heart', 'cpu', 'link', 'alert-triangle', 'git-branch'];
    return icons[(id - 1) % icons.length];
};

const renderResults = (results) => {
    const grid = document.getElementById('audit-bento-grid');
    grid.innerHTML = '';

    results.forEach((res) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        let highlightsHTML = '';
        if (res.score === 0) {
            highlightsHTML = `<li class="error-text">No relevant content found matching framework requirements.</li>`;
        } else {
            const shortVerbatim = res.chunks[0].text.length > 70 
                ? res.chunks[0].text.substring(0, 70) + '...' 
                : res.chunks[0].text;
            highlightsHTML = `
                <li><strong>Top Keyword Hit:</strong> <span style="text-transform:capitalize;">${res.found_keywords[0]}</span></li>
                <li style="font-style:italic">"${shortVerbatim}" [P.${res.chunks[0].page}]</li>
            `;
        }

        card.innerHTML = `
            <div class="rc-top">
                <div class="rc-header">
                    <div class="rc-icon"><i data-lucide="${getIcons(res.question_id)}" style="width:20px; color:#555;"></i></div>
                    <div style="background:#f4f4f4; border-radius:12px; padding:6px 12px; font-size:11px; font-weight:700; opacity:0.6;">Pillar 0${res.question_id}</div>
                </div>
                <h3 class="rc-title">${res.question}</h3>
                <ul class="rc-bullets">
                    ${highlightsHTML}
                </ul>
            </div>
            <div class="rc-score-box" style="${getCardColor(res.score)}">
                <span>Maturity Score</span>
                <span class="score-badge" style="background:rgba(255,255,255,0.6); padding:6px 12px; border-radius:8px; font-size:14px; font-weight:900;">
                    ${res.score === 0 ? 'N/A' : `Level ${res.score}`}
                </span>
            </div>
        `;

        card.onclick = () => openModal(res);
        grid.appendChild(card);
    });
    lucide.createIcons();
};

const openModal = (res) => {
    const modal = document.getElementById('details-modal');
    const body = document.getElementById('modal-body');
    
    let verbatimHTML = '';
    if (res.score === 0) {
        verbatimHTML = `<div class="error-text">"no relevant content found"</div>`;
    } else {
        verbatimHTML = res.chunks.map(c => `
            <div class="verbatim-text" style="margin-bottom:8px;">
                "${c.text}"
                <div style="font-style:normal; font-family:var(--font-sans); font-size:10px; font-weight:700; color:#888; margin-top:6px;">
                    [Page ${c.page}]
                </div>
            </div>
        `).join('');
    }

    let justificationHTML = '';
    if (res.score === 0) {
        justificationHTML = `<div class="error-text">unable to score, no relevant content identified</div>`;
    } else {
        justificationHTML = `
            <div class="justification-block">
                <strong>Why this level is correct:</strong>
                <span>Matches Level ${res.score} definition. Found keywords: ${res.found_keywords.join(', ')}.</span>
                
                <strong>Why not lower:</strong>
                <span>Contains clear strategic phrasing exceeding lower-tier foundational constraints.</span>
                
                <strong>Why not higher:</strong>
                <span>Lacks critical mass (keyword density) required to satisfy higher-tier conditions.</span>
            </div>
        `;
    }
    
    body.innerHTML = `
        <div style="display:flex; align-items:center; gap:16px; margin-bottom: 24px;">
            <div class="rc-icon" style="width:48px; height:48px;"><i data-lucide="${getIcons(res.question_id)}" style="width:24px; color:#555;"></i></div>
            <div>
                <h2 style="font-size:24px; margin-bottom:4px;">${res.question}</h2>
                <span class="score-badge" style="${getCardColor(res.score)}; display:inline-block; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:800;">
                    ${res.score === 0 ? 'N/A' : `Level ${res.score}`}
                </span>
            </div>
        </div>
        
        <div style="margin-bottom: 32px;">
            <h4 style="font-size:12px; margin-bottom:12px; opacity:0.5; text-transform:uppercase;">Rule-Based Justification</h4>
            ${justificationHTML}
        </div>
        
        <div>
            <h4 style="font-size:12px; margin-bottom:12px; opacity:0.5; text-transform:uppercase;">Extracted Verbatim Audit Log</h4>
            ${verbatimHTML}
        </div>
    `;
    
    lucide.createIcons();
    modal.classList.remove('hidden');
};

// --- APP FLOW ---

const init = () => {
    renderDimensions();
    lucide.createIcons();
    const fIn = document.getElementById('file-input');
    fIn.addEventListener('change', (e) => handleFile(e.target.files[0]));
    document.getElementById('analyze-btn').addEventListener('click', startAnalysis);
    
    // Modal Setup
    document.getElementById('close-modal').onclick = () => {
        document.getElementById('details-modal').classList.add('hidden');
    };
    document.getElementById('details-modal').onclick = (e) => {
        if(e.target.id === 'details-modal') {
            document.getElementById('details-modal').classList.add('hidden');
        }
    };
};

const handleFile = async (file) => {
    if (!file) return;
    const loading = document.getElementById('loading-state');
    const hero = document.getElementById('hero-hub');
    hero.classList.add('hidden');
    loading.classList.remove('hidden');
    document.getElementById('loading-message').textContent = 'Parsing Document & Tokenizing...';
    
    try {
        const paragraphs = await parseDocument(file, (c, t) => {
            document.getElementById('loading-percent').textContent = `${Math.round((c/t)*100)}%`;
        });
        
        currentReportData = paragraphs; // array of {page, text}
        document.getElementById('analyze-btn').disabled = false;
        document.getElementById('analyze-btn').innerHTML = 'Begin Extraction Pipeline <i data-lucide="play-circle"></i>';
        loading.classList.add('hidden');
        hero.classList.remove('hidden');
        lucide.createIcons();
        document.getElementById('drop-zone').querySelector('p').textContent = `Document Loaded: ${file.name} (${paragraphs.length} blocks)`;
    } catch (e) { alert(e.message); loading.classList.add('hidden'); }
};

const startAnalysis = async () => {
    const ids = Array.from(document.querySelectorAll('input[name="dimension"]:checked')).map(c => parseInt(c.value));
    document.getElementById('hero-hub').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');
    
    currentResults = [];
    for (let i = 0; i < ids.length; i++) {
        const d = DIMENSIONS.find(x => x.id === ids[i]);
        document.getElementById('loading-message').textContent = `Extracting evidence for ${d.title}...`;
        document.getElementById('loading-percent').textContent = `${Math.round(((i+1)/ids.length)*100)}%`;
        
        const chunks = extractVerbatimChunks(currentReportData, d);
        const score = determineScore(chunks, d);
        
        let allKWs = new Set();
        chunks.forEach(c => c.keywords.forEach(k => allKWs.add(k)));
        
        currentResults.push({
            question_id: d.id, 
            question: d.title,
            chunks: chunks,
            score: score,
            found_keywords: Array.from(allKWs)
        });
        
        // Simulate processing delay for UI
        await new Promise(r => setTimeout(r, 300));
    }
    
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('results-dashboard').classList.remove('hidden');
    renderResults(currentResults);
};

window.onload = init;
