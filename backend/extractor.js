/**
 * MIE Extraction Engine
 * Step 1: Zero-hallucination verbatim extraction from parsed PDF pages.
 * Groups sentence-level matches into extracts with page references.
 */

/**
 * extractVerbatimStatements
 * @param {Array} pages - Array of { page: number, text: string } from PDF parser
 * @param {Object} dimension - Dimension config with keywords and triggers
 * @returns {Array} extracts - Array of { text, page, matchScore, matchedKeywords }
 */
const extractVerbatimStatements = (pages, dimension) => {
    const allKeywords = [
        ...dimension.keywords.map(k => k.toLowerCase()),
        ...dimension.triggers.map(k => k.toLowerCase())
    ];

    const extractMap = new Map(); // keyed by page number

    pages.forEach(({ page, text }) => {
        // Split text into sentence-level segments
        const sentences = text
            .replace(/\n+/g, ' ')
            .split(/(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length >= 40); // minimum meaningful length

        sentences.forEach(sentence => {
            const lower = sentence.toLowerCase();
            const matched = [];

            allKeywords.forEach(kw => {
                const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Regex: match keyword with flexible boundaries (allow punctuation or spaces around it)
                const pattern = new RegExp(`${escaped}`, 'i');
                if (pattern.test(lower)) {
                    matched.push(kw);
                }
            });


            if (matched.length > 0) {
                if (!extractMap.has(page)) {
                    extractMap.set(page, {
                        page,
                        sentences: [],
                        matchScore: 0,
                        matchedKeywords: new Set()
                    });
                }
                const entry = extractMap.get(page);
                // Avoid duplicate sentences
                if (!entry.sentences.includes(sentence)) {
                    entry.sentences.push(sentence);
                }
                entry.matchScore += matched.length;
                matched.forEach(k => entry.matchedKeywords.add(k));
            }
        });
    });

    // Convert to array and build final extract objects
    const extracts = Array.from(extractMap.values())
        .map(entry => ({
            page: entry.page,
            text: entry.sentences.join(' '),
            matchScore: entry.matchScore,
            matchedKeywords: Array.from(entry.matchedKeywords)
        }))
        .sort((a, b) => a.page - b.page); // chronological order

    return extracts;
};

/**
 * selectMostRepresentativeStatement
 * Picks the highest-scoring extract and prefixes it with context from the
 * second-highest if available, to form a synthesis combining multiple extracts.
 *
 * @param {Array} extracts
 * @returns {string}
 */
const selectMostRepresentativeStatement = (extracts) => {
    if (!extracts || extracts.length === 0) return "no relevant content found";

    // Sort by match score descending
    const sorted = [...extracts].sort((a, b) => b.matchScore - a.matchScore);
    const best = sorted[0];

    // Truncate to 500 chars max to keep it representative, not exhaustive
    const truncate = (str, max) => str.length > max ? str.substring(0, max).trimEnd() + '...' : str;

    if (sorted.length === 1) {
        return truncate(best.text, 500);
    }

    // Attempt to fuse best + second-best if they differ meaningfully
    const second = sorted[1];
    const combined = `${truncate(best.text, 300)} [...] ${truncate(second.text, 200)}`;
    return combined;
};

module.exports = { extractVerbatimStatements, selectMostRepresentativeStatement };
