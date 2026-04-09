/**
 * MIE Extraction Engine v6.0
 * Returns INDIVIDUAL SENTENCE-LEVEL extracts (verbatim, not page-grouped).
 * Each extract is a single matching sentence with page reference.
 */

const extractVerbatimStatements = (pages, dimension) => {
    const allKeywords = [
        ...dimension.keywords.map(k => k.toLowerCase()),
        ...dimension.triggers.map(k => k.toLowerCase())
    ];

    const seen = new Set();
    const extracts = [];

    pages.forEach(({ page, text }) => {
        // Split into individual sentences
        const sentences = text
            .replace(/\n+/g, ' ')
            .split(/(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length >= 40 && s.length <= 1200);

        sentences.forEach(sentence => {
            const lower = sentence.toLowerCase();
            let matchScore = 0;
            const matched = [];

            allKeywords.forEach(kw => {
                const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = new RegExp(escaped, 'i');
                if (pattern.test(lower)) {
                    matchScore++;
                    matched.push(kw);
                }
            });

            // Trigger phrases get boosted score
            dimension.triggers.forEach(trigger => {
                if (lower.includes(trigger.toLowerCase())) {
                    matchScore += 3;
                }
            });

            if (matchScore > 0) {
                // Deduplicate by normalized text
                const normalized = sentence.replace(/\s+/g, ' ').toLowerCase().substring(0, 80);
                if (!seen.has(normalized)) {
                    seen.add(normalized);
                    extracts.push({
                        text: sentence,
                        page,
                        matchScore,
                        matchedKeywords: matched
                    });
                }
            }
        });
    });

    // Sort by relevance (match score desc), then by page
    return extracts
        .sort((a, b) => b.matchScore - a.matchScore || a.page - b.page);
};

/**
 * selectMostRepresentativeStatement
 * Picks the top 2 highest-scoring sentences and fuses them into one representative statement.
 */
const selectMostRepresentativeStatement = (extracts) => {
    if (!extracts || extracts.length === 0) return 'no relevant content found';

    const sorted = [...extracts].sort((a, b) => b.matchScore - a.matchScore);
    const best = sorted[0];

    if (sorted.length === 1) {
        return best.text.length > 500 ? best.text.substring(0, 500).trimEnd() + '...' : best.text;
    }

    const second = sorted[1];
    const t1 = best.text.length > 280 ? best.text.substring(0, 280).trimEnd() + '...' : best.text;
    const t2 = second.text.length > 200 ? second.text.substring(0, 200).trimEnd() + '...' : second.text;
    return `${t1} [...] ${t2}`;
};

module.exports = { extractVerbatimStatements, selectMostRepresentativeStatement };
