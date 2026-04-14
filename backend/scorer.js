/**
 * MIE Scoring Engine v8.1 (Bug-Fixed)
 * Hardened scoring to prevent "Level 5 inflation".
 * Rubric fields: .l (level), .t (label), .d (criteria/description)
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

    // Fallback rubric  descriptor from raw question object (uses .d, not .criteria)
    const getRubricDesc = (idx) => {
        if (!question.rubric || !question.rubric[idx]) return 'N/A';
        return question.rubric[idx].d || question.rubric[idx].criteria || 'N/A';
    };

    if (!extracts || extracts.length === 0) {
        return { score: 1, label: labels[0], color: colors[0], bestStatement: getRubricDesc(0) };
    }

    const count = extracts.length;
    const allText = extracts.map(e => e.text.toLowerCase()).join(' ');

    // EXPONENTIAL SIGNALS (Required for Level 4 and 5)
    const expVocab = [
        'ecosystem', 'platform service', 'ai-driven', 'autonomous', 'dao',
        'smart contract', 'synthetic', 'digital twin', 'global transformation',
        'bhag', 'democratiz', 'decentraliz', 'exponential growth', 'multiplier'
    ];
    const expHits = expVocab.filter(v => allText.includes(v)).length;

    // TRIGGER HITS (High quality predefined phrases)
    const triggers = theme.triggers || question.triggers || [];
    const triggerHits = triggers.filter(v => allText.includes(v.toLowerCase())).length;

    let score = 1;

    // DETERMINISTIC THRESHOLDS
    if (triggerHits >= 2 && expHits >= 3 && count >= 8) {
        score = 5;
    } else if ((triggerHits >= 1 || expHits >= 2) && count >= 5) {
        score = 4;
    } else if (count >= 3 || expHits >= 1) {
        score = 3;
    } else if (count >= 1) {
        score = 2;
    } else {
        score = 1;
    }

    return {
        score,
        label: labels[score - 1],
        color: colors[score - 1],
        bestStatement: getRubricDesc(score - 1)
    };
};

module.exports = { scoreExtracts };
