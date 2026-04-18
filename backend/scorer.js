/**
 * MIE Scorer v2.2 — IDF-weighted rubric proximity
 *
 * Why v2.2:
 *   v2.1 used plain token overlap, which gave Level 1 a systematic bias.
 *   Level 1 rubrics use common generic words ("purpose", "financial",
 *   "customers", "services") that appear in every annual report and in
 *   every *other* level definition too. So Level 1 won by default on
 *   any mixed-evidence document.
 *
 * Fix:
 *   - IDF-weight tokens and bigrams: words in all 5 levels count 0, words
 *     in only 1 level count high. This surfaces the *discriminating*
 *     vocabulary of each level.
 *   - Length-normalize: short rubric definitions can't win just because
 *     they have fewer tokens to match.
 *   - "No-content" detection is unchanged.
 *
 * Exports match engine.js's call signatures:
 *   scoreExtracts(extracts, dimensionMeta, question) — legacy wrapper
 *   scoreRubric(extracts, rubric)                    — primary
 */

const RUBRIC_FILLER_STOPWORDS = new Set([
    'the', 'is', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at',
    'for', 'with', 'by', 'from', 'as', 'it', 'its', 'this', 'that', 'these',
    'those', 'be', 'been', 'being', 'are', 'was', 'were', 'has', 'have', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
    'organization', 'organizations', 'organizational',
    'level', 'linear', 'exponential', 'partially', 'emerging', 'completely',
    'not', 'no', 'any', 'some', 'other', 'than', 'such', 'very', 'only',
    'also', 'more', 'most', 'less', 'least', 'own', 'same',
]);

const LEVEL_COLORS = {
    1: '#ff6b6b',
    2: '#ffa502',
    3: '#f0db4f',
    4: '#00ddeb',
    5: '#00ff88',
};


function tokenize(text) {
    return (text.toLowerCase().match(/[a-z][a-z\-]+/g) || [])
        .filter(t => t.length > 3 && !RUBRIC_FILLER_STOPWORDS.has(t));
}

function bigrams(tokens) {
    const out = [];
    for (let i = 0; i < tokens.length - 1; i++) {
        out.push(`${tokens[i]} ${tokens[i + 1]}`);
    }
    return out;
}


// ---------------------------------------------------------------------------
// IDF computation per rubric
// ---------------------------------------------------------------------------
// For every token / bigram in the full rubric, compute how many levels it
// appears in. Terms in every level are uninformative (IDF≈0); terms in only
// one level are maximally discriminative (IDF≈high).
// ---------------------------------------------------------------------------

function buildRubricIdf(rubric) {
    const N = rubric.length || 1;
    const docFreq = new Map();  // term → how many level definitions contain it

    for (const level of rubric) {
        const tokens = tokenize(level.d || '');
        const terms = new Set([...tokens, ...bigrams(tokens)]);
        for (const term of terms) {
            docFreq.set(term, (docFreq.get(term) || 0) + 1);
        }
    }

    // IDF = log(N / df). Terms appearing in every level get IDF = 0.
    // We use natural log; the important thing is the ordering.
    const idf = new Map();
    for (const [term, df] of docFreq) {
        idf.set(term, Math.log(N / df));
    }
    return idf;
}


// ---------------------------------------------------------------------------
// IDF-weighted overlap score
// ---------------------------------------------------------------------------

function idfWeightedOverlap(evidenceText, levelText, idf) {
    const evTok = tokenize(evidenceText);
    const lvTok = tokenize(levelText);
    if (evTok.length === 0 || lvTok.length === 0) return 0;

    // Build evidence term set (unigrams + bigrams)
    const evSet = new Set([...evTok, ...bigrams(evTok)]);

    // Level-unique terms we'll check against evidence
    const lvTokSet = new Set(lvTok);
    const lvBiSet = new Set(bigrams(lvTok));

    // Weighted numerator: sum IDF weights of matched terms.
    // Bigrams weighted 2x for stronger specificity signal.
    let matchedWeight = 0;
    let totalWeight = 0;

    for (const t of lvTokSet) {
        const w = idf.get(t) || 0;
        totalWeight += w;
        if (evSet.has(t)) matchedWeight += w;
    }
    for (const b of lvBiSet) {
        const w = (idf.get(b) || 0) * 2;
        totalWeight += w;
        if (evSet.has(b)) matchedWeight += w;
    }

    if (totalWeight === 0) {
        // Every term in this level appears in every other level too —
        // nothing distinctive to match on. Fall back to 0 (truly ambiguous).
        return 0;
    }

    return matchedWeight / totalWeight;
}


// ---------------------------------------------------------------------------
// Primary scoring function
// ---------------------------------------------------------------------------

function scoreRubric(extracts, rubric) {
    if (!extracts || extracts.length === 0 || !rubric || rubric.length === 0) {
        return {
            score: 0,
            label: 'N/A',
            color: '#555',
            similarities: {},
            confidence: 0,
            noContent: true,
        };
    }

    const evidenceBlob = extracts.map(e => e.text).join(' ');
    const idf = buildRubricIdf(rubric);

    const similarities = {};
    let bestLevel = 1;
    let bestScore = -1;

    for (const level of rubric) {
        const sim = idfWeightedOverlap(evidenceBlob, level.d, idf);
        similarities[level.l] = sim;
        if (sim > bestScore) {
            bestScore = sim;
            bestLevel = level.l;
        }
    }

    // Tie-breaker: if top two levels are within 0.03, prefer the higher one
    // when evidence is substantive (>= 5 extracts). The prior v2.1 tended to
    // slide toward lower levels on mixed evidence; this corrects mildly.
    const ranked = Object.entries(similarities)
        .map(([l, s]) => [parseInt(l, 10), s])
        .sort((a, b) => b[1] - a[1]);

    if (ranked.length >= 2 && extracts.length >= 5) {
        const [topLvl, topScore] = ranked[0];
        const [runnerLvl, runnerScore] = ranked[1];
        if (Math.abs(topScore - runnerScore) < 0.03 && runnerLvl > topLvl) {
            bestLevel = runnerLvl;
            bestScore = runnerScore;
        }
    }

    const chosenLevelDef = rubric.find(r => r.l === bestLevel);
    const label = chosenLevelDef ? chosenLevelDef.t : `Level ${bestLevel}`;

    const sortedSims = Object.values(similarities).sort((a, b) => b - a);
    const confidence = sortedSims.length > 1
        ? Math.max(0, sortedSims[0] - sortedSims[1])
        : sortedSims[0] || 0;

    return {
        score: bestLevel,
        label,
        color: LEVEL_COLORS[bestLevel] || '#888',
        similarities,
        confidence,
        noContent: false,
    };
}


/**
 * Backward-compat wrapper for engine.js:
 *   scoreExtracts(extracts, { triggers: uniqueTriggers }, q)
 */
function scoreExtracts(extracts, dimensionMeta, question) {
    const rubric = (question && question.rubric) || [];
    return scoreRubric(extracts, rubric);
}


module.exports = {
    scoreRubric,
    scoreExtracts,
    LEVEL_COLORS,
    buildRubricIdf,       // exported for testing / debugging
    idfWeightedOverlap,   // exported for testing / debugging
};
