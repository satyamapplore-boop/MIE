/**
 * MIE Extractor v3.0 — Strict Precision Mode
 * ============================================
 * Replaces v2.1's "enough keyword hits" logic with a THREE-GATE filter:
 *
 *   Gate 1 — Hard Exclusions        : structural noise is killed outright
 *   Gate 2 — Intent Pattern         : must match a pillar-specific phrase
 *   Gate 3 — Structural Coherence   : real sentence, not a fragment
 *
 * The design bias is for PRECISION over recall. You'll get fewer extracts
 * than v2.1, but every one should be a defensible, on-target statement.
 *
 * If a pillar returns zero extracts, the scorer will mark it "N/A". That's
 * the correct outcome — better than returning noise that's later used to
 * score incorrectly.
 *
 * Exports the same function name (`extractRelevantContent`) as v2.1 so
 * engine.js works without modification.
 */


// =============================================================================
// GATE 1 — HARD EXCLUSIONS (sentence is killed outright)
// =============================================================================

const HARD_EXCLUSIONS = [
    // Governance committees / board biographies
    /\b(audit|nomination|remuneration|stakeholders?)\s+(and\s+)?\w*\s*committee\b/i,
    /\bboard\s+of\s+directors\b/i,
    /\b(chairman|director|governor|commissioner)\s+of\s+(the\s+)?(saudi|public|reserve|various)/i,
    /\bharvard\s+business\s+school\s+alumnus/i,
    /\bformer\s+(chairman|chief|ceo|cfo|coo|president)/i,
    /\bspearheaded\s+various\s+large\s+scale\s+projects\b/i,
    /\bled\s+the\s+commissioning\s+and\s+start[\s-]?up\b/i,

    // Page-navigation breadcrumbs / internal cross-refs
    /→\s*(PAGE|Page)\s+\d+/,
    /\bsee\s+(page|pages)\s+\d+/i,
    /\brefer\s+to\s+(page|section)\s+\d+/i,

    // Financial table boilerplate
    /\b(FY\s*\d{2,4}[-/]?\d{0,4}\s*){2,}/i,        // "FY 2022-23 FY 2021-22"
    /\b(notes?\s+to\s+the\s+(financial\s+)?statements?)/i,
    /\bstatement\s+of\s+(profit|loss|cash\s+flow)/i,
    /\bconsolidated\s+balance\s+sheet\b/i,

    // Boilerplate framework / disclaimer
    /\btable\s+of\s+contents?\b/i,
    /\bforward[\s-]?looking\s+statements?\b/i,
    /\ball\s+rights\s+reserved\b/i,
    /\b(page|pg)\s+\d+(\s+of\s+\d+)?\s*$/i,

    // Table-dump signatures (lots of bullets + few real words, or lots of currency figures)
    /(?:[•●▪♦]\s*){4,}/,                            // 4+ bullets in a row
    /(?:₹|Rs\.?|USD|\$)\s*[\d,]+\.?\d*\s+(?:[•●▪♦]|\|)/,   // currency + separator = table row

    // ALL-CAPS header stacks  (4+ consecutive UPPERCASE tokens)
    /(?:\b[A-Z]{2,}\b\s+){4,}/,

    // Reliance/oil-gas/subscriber data dumps
    /\bMMBPD\b|\bMMSCFD\b|\bTCFe\b|\bNEC[-–]OSN/i,
    /\b\d{2,}[,.]?\d{0,3}\s*million\s+subscribers?\b/i,
    /\bcrude\s+refining\s+capacity\b/i,
];


function hitsHardExclusion(sentence) {
    return HARD_EXCLUSIONS.some(pattern => pattern.test(sentence));
}


// =============================================================================
// GATE 2 — INTENT PATTERNS (pillar-specific)
// =============================================================================
// Each pillar has a set of regexes that capture the way organizations
// ACTUALLY talk about that topic — not just vocabulary, but intent phrases.
// A sentence must match at least one to be considered on-topic.
// =============================================================================

const INTENT_PATTERNS = {

    "Purpose / Vision / Mission": [
        // Direct mission/vision statements
        /\bour\s+(purpose|vision|mission|values|aspiration)\s+(is|are|reflects|guides)/i,
        /\b(the\s+)?company['']?s?\s+(purpose|vision|mission|values)\s+(is|are)/i,
        /\b(reliance|we)\s+(is|are)\s+driven\s+by\s+(its|our|a)\s+(purpose|vision|mission|belief|aspiration|commitment)/i,

        // Aspirational / intent verbs
        /\bwe\s+(aspire|commit|believe|strive|envision|endeavou?r|seek)\s+to\b/i,
        /\bour\s+(motto|north\s+star|guiding\s+principle|raison\s+d['']être)/i,

        // Sustainability / ESG as explicit purpose
        /\b(committed|commitment)\s+to\s+(sustainab|net\s+zero|carbon\s+neutral|stewardship)/i,
        /\btarget\s+to\s+(become|achieve)\s+(net[\s-]?zero|net\s+carbon\s+zero|carbon\s+neutral)/i,

        // Stakeholder value framing
        /\b(create|creating|generate|generating|maximi[sz]e|maximi[sz]ing)\s+(value|impact)\s+for\s+(all\s+)?(our\s+)?(stakeholders|customers\s+and\s+employees|communities)/i,
        /\bholistic\s+(value|growth)/i,
        /\bshared\s+value\s+(for|with)\s+(our\s+)?stakeholders/i,
    ],

    "Workforce Model": [
        // Workforce strategy / model statements
        /\bour\s+(workforce|talent|people)\s+(strategy|model|philosophy)/i,
        /\b(employ|deploy|engage|leverage)\s+(a\s+)?(mix|blend|combination)\s+of\s+(full[\s-]?time|permanent|contractual|on[\s-]?demand|gig|freelance)/i,
        /\b(flexible|hybrid|blended|distributed)\s+(workforce|work(ing)?\s+model|talent\s+model)/i,
        /\bgig\s+(economy|workers?|workforce)\b/i,
        /\bon[\s-]?demand\s+(talent|workforce|employees)/i,

        // Learning / capability building
        /\b(upskill|reskill)(ing)?\s+(our\s+)?(employees|workforce|teams)/i,
        /\bcapability[\s-]?building\s+(program|initiative)/i,
        /\b(learning\s+and\s+development|L&D)\s+(program|investment|initiative)/i,
        /\binvested?\s+\w*\s+in\s+(training|upskilling|reskilling)/i,

        // Employee wellbeing (soft workforce indicators)
        /\b(foster(ing)?|promot(ing|e))\s+(a\s+)?(diverse|inclusive|equitable|psychologically\s+safe)\s+workplace/i,
        /\bwe\s+care\s+for\s+(our\s+)?(employees|people|workforce)/i,
    ],

    "Stakeholder Community": [
        // Community / ecosystem building
        /\b(build(ing)?|nurtur(ing|e)|foster(ing)?)\s+(a\s+|our\s+)?(community|ecosystem|partnership)/i,
        /\bco[\s-]?creat(e|ion|ing)\s+(with|value|solutions)/i,
        /\bstakeholder\s+(engagement|dialogue|consultation|feedback)/i,

        // Customer / partner platforms
        /\b(customer|partner|developer|user)\s+(community|ecosystem|platform|forum)/i,
        /\b(win[\s-]?win\s+partnership|shared\s+value|mutual\s+benefit)/i,

        // Active listening / feedback loops
        /\b(voice\s+of\s+(the\s+)?customer|NPS|net\s+promoter\s+score|customer\s+satisfaction)/i,
        /\bfeedback\s+(loop|mechanism|system)/i,
        /\b(listen(ing)?|respond(ing)?)\s+to\s+(our\s+)?(customers|communities|stakeholders)/i,

        // Strategic partnerships
        /\b(strategic\s+)?partnerships?\s+(with|across)\s+\w+\s+to\s+(deliver|create|build|drive)/i,
    ],

    "Disruptive Technology": [
        // AI / ML concrete usage
        /\b(deploy|leverage|implement|adopt|integrat|utilis[ez])\s+(\w+\s+)*(artificial\s+intelligence|machine\s+learning|deep\s+learning|generative\s+AI|LLM)/i,
        /\bpowered?\s+by\s+(AI|artificial\s+intelligence|machine\s+learning)/i,
        /\bAI[\s-]?(powered|driven|enabled|first|native)/i,

        // Frontier tech
        /\b(blockchain|distributed\s+ledger|smart\s+contract)s?\s+(for|in|deployed|implementation|integration)/i,
        /\b(IoT|internet\s+of\s+things)\s+(deployment|platform|sensors?|devices?)/i,
        /\b(digital\s+twin|3D\s+print(ing)?|drones?|genomics?|quantum\s+computing|metaverse)/i,

        // Investment / commitment language
        /\binvest(ed|ing|ment)?\s+(heavily\s+)?in\s+(AI|artificial\s+intelligence|machine\s+learning|blockchain|IoT|R&D|innovation|emerging\s+technolog)/i,
        /\bresearch\s+and\s+development\s+(center|hub|investment|initiative)/i,
        /\binnovation\s+(center|hub|lab|accelerator|pipeline)/i,

        // Digital transformation
        /\b(digital|technology)[\s-](driven|first|enabled|led)\s+(strategy|transformation|initiative)/i,
    ],

    "External Integration": [
        // Supply chain / partner integration
        /\b(integrat(e|ed|ing)|connect(ed|ing))\s+(our\s+)?(supply\s+chain|value\s+chain|partners|suppliers|vendors)/i,
        /\bsupply\s+chain\s+(digitization|digitali[sz]ation|transparency|visibility|integration|resilience)/i,
        /\b(seamless|real[\s-]?time)\s+(data|integration|collaboration|visibility)\s+(with|across)\s+(partners|suppliers|vendors)/i,

        // API / platform-first
        /\bAPI[\s-](first|driven|ecosystem|economy)/i,
        /\bopen\s+(API|platform|ecosystem)/i,
        /\b(automated|automation)\s+(workflow|process|integration)\s+(with|across|between)/i,

        // Vendor / procurement strategy
        /\b(vendor|supplier)\s+(portal|platform|management\s+system|engagement)/i,
        /\bresponsible\s+(supply\s+chain|sourcing|procurement)/i,

        // Strategic ecosystem play
        /\bextend(ed|ing)?\s+(our\s+)?(enterprise|ecosystem)\s+(to|across|with)/i,
    ],

    "Risk & Failure Culture": [
        // Experimentation culture
        /\b(culture|mindset)\s+of\s+(experimentation|innovation|risk[\s-]?taking|learning\s+from\s+failure)/i,
        /\b(fail(ing)?\s+(fast|forward)|learn(ing)?\s+from\s+failure)/i,
        /\b(test[\s-]?and[\s-]?learn|rapid\s+(prototyp|experiment|iteration))/i,

        // Agile / Lean adoption
        /\b(agile|lean|scrum)\s+(methodology|practice|transformation|team|squad|framework)/i,
        /\b(design\s+thinking|lean\s+startup|MVP|minimum\s+viable\s+product)/i,

        // Innovation infrastructure
        /\binnovation\s+(lab|sandbox|hub|incubator|accelerator|pipeline)/i,
        /\b(hackathon|ideation\s+(session|program)|innovation\s+challenge)/i,

        // Psychological safety / bold bets
        /\b(psychological\s+safety|safe\s+to\s+fail|tolerance\s+for\s+failure)/i,
        /\b(bold|disruptive|audacious)\s+(bets?|ideas|moves|experiments)/i,

        // Risk appetite framing (must be about taking risk, not managing it)
        /\b(embrace|encourage)\s+(risk[\s-]?taking|experimentation|prudent\s+risks?)/i,
    ],

    "Decentralized Decision-Making": [
        // Decentralized / distributed governance
        /\bdecentrali[sz]ed\s+(decision[\s-]?making|governance|authority|operations)/i,
        /\b(distributed|delegated)\s+(authority|leadership|decision[\s-]?making)/i,

        // Autonomous / self-organizing teams
        /\b(autonomous|self[\s-]?(organi[sz]ing|managing|directing|starting))\s+(teams?|squads?|units?)/i,
        /\b(empowered|empowerment\s+of)\s+(teams|employees|workforce|squads?|tribes?)/i,
        /\bagile\s+(squads?|tribes?|chapters?|pods?)\b/i,

        // Flat org / org model
        /\bflat(ter)?\s+(hierarchy|organi[sz]ation|structure)/i,
        /\bholacracy/i,
        /\b(DAO|decentrali[sz]ed\s+autonomous\s+organi[sz]ation)/i,

        // OKR / ownership culture
        /\b(objectives?\s+and\s+key\s+results?|OKRs?)\s+(framework|methodology|deployed|adopted)/i,
        /\b(end[\s-]?to[\s-]?end\s+ownership|accountability\s+at\s+every\s+level)/i,

        // Anti-top-down signal (if present, reinforces the pillar)
        /\bmov(e|ed|ing)\s+(away\s+)?from\s+top[\s-]?down/i,
    ],
};


function findIntentMatch(sentence, pillarTitle) {
    const patterns = INTENT_PATTERNS[pillarTitle] || [];
    for (const pat of patterns) {
        const m = sentence.match(pat);
        if (m) {
            return { matched: true, phrase: m[0] };
        }
    }
    return { matched: false, phrase: null };
}


// =============================================================================
// GATE 3 — STRUCTURAL COHERENCE
// =============================================================================

function isStructurallyCoherent(sentence) {
    const tokens = sentence.trim().split(/\s+/);

    if (tokens.length < 8) return false;              // too short to be a real statement
    if (tokens.length > 180) return false;            // probably a swallowed paragraph

    // Word-like ratio — real sentences are mostly prose, not codes/numbers
    const wordLike = tokens.filter(t => /^[a-zA-Z][a-zA-Z\-']{2,}$/.test(t)).length;
    if (wordLike / tokens.length < 0.55) return false;

    // Must have a subject-like token (company / we / our / the company / etc.)
    // Relaxed: any of these words OR it starts with a capitalized company name
    const hasSubject = /\b(we|our|us|the\s+company|the\s+group|reliance|company['']s|group['']s)\b/i.test(sentence)
        || /^[A-Z][a-zA-Z]+\s+(is|has|will|aims|believes|commits|strives|operates)/.test(sentence);

    // Must have a verb-like structure — simple heuristic: at least one past/present tense marker
    const hasVerb = /\b(is|are|was|were|has|have|had|will|aims?|believes?|commits?|strives?|operates?|builds?|created?|develops?|drives?|enables?|ensures?|fosters?|integrat\w+|invests?|leads?|provides?|reflects?|reinforces?|supports?)\b/i.test(sentence);

    return hasSubject && hasVerb;
}


// =============================================================================
// SENTENCE SPLITTING
// =============================================================================

function splitIntoSentences(pages) {
    const sentences = [];
    for (const p of pages) {
        const text = (p.text || '').replace(/\s+/g, ' ').trim();
        if (!text) continue;

        // Split on terminal punctuation + capital letter / digit
        const parts = text.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);
        for (const raw of parts) {
            const s = raw.trim();
            if (s.length < 30 || s.length > 1200) continue;
            sentences.push({ text: s, page: p.page });
        }
    }
    return sentences;
}


// =============================================================================
// DEDUPLICATION
// =============================================================================

function tokensOf(text) {
    return text.toLowerCase().match(/[a-z]+/g) || [];
}

function jaccard(a, b) {
    const setA = new Set(a);
    const setB = new Set(b);
    const inter = [...setA].filter(x => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : inter / union;
}


// =============================================================================
// MAIN EXTRACTION
// =============================================================================

const MAX_EXTRACTS_PER_PILLAR = 8;
const DEDUPE_JACCARD_THRESHOLD = 0.6;


function extractRelevantContent(pages, dimension) {
    const pillarTitle = dimension.title || '';
    const candidates = splitIntoSentences(pages);
    if (candidates.length === 0) return [];

    const passing = [];

    for (const { text, page } of candidates) {
        // Gate 1 — Hard exclusions
        if (hitsHardExclusion(text)) continue;

        // Gate 2 — Pillar-specific intent pattern (the core precision filter)
        const intentMatch = findIntentMatch(text, pillarTitle);
        if (!intentMatch.matched) continue;

        // Gate 3 — Structural coherence
        if (!isStructurallyCoherent(text)) continue;

        passing.push({
            text,
            page,
            relevance: 1.0,                   // every passer is considered equally precise
            matched_phrase: intentMatch.phrase,
        });
    }

    // Dedupe near-identical sentences (same statement repeated across pages)
    const unique = [];
    const tokensCache = new Map();
    for (const candidate of passing) {
        const candTokens = tokensOf(candidate.text);
        tokensCache.set(candidate, candTokens);
        const isDupe = unique.some(kept => {
            const keptTokens = tokensCache.get(kept);
            return jaccard(candTokens, keptTokens) > DEDUPE_JACCARD_THRESHOLD;
        });
        if (!isDupe) unique.push(candidate);
        if (unique.length >= MAX_EXTRACTS_PER_PILLAR) break;
    }

    // Sort by page (chronological reading order)
    unique.sort((a, b) => a.page - b.page);
    return unique;
}


module.exports = {
    extractRelevantContent,
    // Exported for debugging / unit testing
    hitsHardExclusion,
    findIntentMatch,
    isStructurallyCoherent,
    INTENT_PATTERNS,
    HARD_EXCLUSIONS,
};
