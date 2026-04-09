/**
 * MIE Scoring Engine v8.0 (Conservative Determinism)
 * Hardened scoring to prevent "Level 5 inflation". 
 * Higher levels now require specific exponential terminology hits.
 */

const scoreExtracts = (extracts, theme, question) => {
    const labels = [
        'Completely Linear',
        'Partially Linear',
        'Partially Exponential',
        'Emerging Exponential',
        'Completely Exponential'
    ];
    const colors = ['#888888', '#ea4335', '#fbbc04', '#4285f4', '#34a853'];

    if (!extracts || extracts.length === 0) {
        return { score: 1, label: labels[0], color: colors[0], bestStatement: question.levels[0] };
    }

    const count = extracts.length;
    const allText = extracts.map(e => e.text.toLowerCase()).join(" ");

    // EXPONENTIAL SIGNALS (Required for Level 4 and 5)
    const expVocab = [
        'ecosystem', 'platform service', 'ai-driven', 'autonomous', 'dao', 
        'smart contract', 'synthetic', 'digital twin', 'global transformation', 
        'bhag', 'democratiz', 'decentraliz', 'exponential growth', 'multiplier'
    ];
    const expHits = expVocab.filter(v => allText.includes(v)).length;
    
    // TRIGGER HITS (High quality predefined phrases)
    const triggerHits = (theme.triggers || []).filter(v => allText.includes(v.toLowerCase())).length;

    let score = 1;

    // DETERMINISTIC THRESHOLDS
    if (triggerHits >= 2 && expHits >= 3 && count >= 8) {
        score = 5; // Completely Exponential
    } else if ((triggerHits >= 1 || expHits >= 2) && count >= 5) {
        score = 4; // Emerging Exponential
    } else if (count >= 3 || expHits >= 1) {
        score = 3; // Partially Exponential
    } else if (count >= 1) {
        score = 2; // Partially Linear
    } else {
        score = 1;
    }

    return {
        score,
        label: labels[score - 1],
        color: colors[score - 1],
        bestStatement: question.levels[score - 1] || question.levels[0]
    };
};

module.exports = { scoreExtracts };
