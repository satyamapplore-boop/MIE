/**
 * diagnose_missing.js
 * =====================
 * For the 4 weakly-covered pillars, finds sentences that:
 *   - survived Gate 1 (not hard-excluded)
 *   - survived Gate 3 (structurally coherent)
 *   - contain pillar-VOCABULARY (e.g. "workforce", "supplier", "risk", "empower")
 *   - BUT failed the current Gate 2 intent patterns
 *
 * These are the sentences we should probably match. Shows up to 10 per
 * pillar so we can see the ACTUAL writing style of the document and
 * widen patterns precisely, not hypothetically.
 *
 * Run:
 *     node diagnose_missing.js "C:\Users\Satyam\Downloads\RIL-Integrated-Annual-Report-2022-23.pdf"
 */

const fs = require('fs');
const pdfParse = require('pdf-parse');

const {
    hitsHardExclusion,
    findIntentMatch,
    isStructurallyCoherent,
} = require('./backend/extractor');


// Pillar vocabulary — these are hints that a sentence MIGHT be relevant.
// If a sentence contains any of these words, it gets surfaced as a candidate
// for pattern widening (even if the current intent regex missed it).
const PILLAR_VOCAB = {
    "Workforce Model": [
        'workforce', 'talent', 'employees', 'headcount', 'contractual',
        'contractors', 'freelance', 'gig', 'on-demand', 'permanent',
        'full-time', 'part-time', 'outsourc', 'hybrid', 'remote',
        'reskill', 'upskill', 'learning and development', 'L&D',
        'training', 'capability building', 'retention', 'attrition',
        'people strategy', 'talent strategy', 'human capital', 'wellbeing',
    ],
    "External Integration": [
        'supply chain', 'value chain', 'procurement', 'vendor', 'supplier',
        'partner integration', 'API', 'ecosystem', 'interoperability',
        'automation', 'enterprise architecture', 'value stream',
        'digitization', 'digitalization', 'alliance', 'joint venture',
    ],
    "Risk & Failure Culture": [
        'risk', 'failure', 'experiment', 'pilot', 'prototype', 'MVP',
        'innovation lab', 'incubator', 'accelerator', 'hackathon',
        'agile', 'scrum', 'sprint', 'design thinking', 'test and learn',
        'fail fast', 'feedback loop', 'iteration', 'pivot',
        'psychological safety', 'resilience', 'antifragile', 'learning culture',
    ],
    "Decentralized Decision-Making": [
        'decentrali', 'autonomy', 'autonomous', 'empowerment', 'empowered',
        'self-organizing', 'self-managing', 'agile squads', 'cross-functional',
        'flat', 'hierarch', 'top-down', 'bottom-up', 'delegation',
        'OKR', 'DAO', 'governance', 'decision-making',
        'squad', 'tribe', 'chapter', 'guild', 'matrix organization',
    ],
};


async function parsePdf(pdfPath) {
    const buf = fs.readFileSync(pdfPath);
    const pages = [];
    await pdfParse(buf, {
        pagerender: (pageData) => {
            return pageData.getTextContent().then(tc => {
                const text = tc.items.map(i => i.str).join(' ').trim();
                if (text.length > 30) {
                    pages.push({ page: pages.length + 1, text });
                }
                return text;
            });
        },
    });
    return pages;
}


function splitSentences(pages) {
    const sentences = [];
    for (const p of pages) {
        const text = (p.text || '').replace(/\s+/g, ' ').trim();
        if (!text) continue;
        const parts = text.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);
        for (const raw of parts) {
            const s = raw.trim();
            if (s.length < 30 || s.length > 1200) continue;
            sentences.push({ text: s, page: p.page });
        }
    }
    return sentences;
}


async function run(pdfPath) {
    console.log(`\n${'='.repeat(80)}`);
    console.log('MISSING-MATCH DIAGNOSTIC — for weak pillars');
    console.log('='.repeat(80));

    const pages = await parsePdf(pdfPath);
    const sentences = splitSentences(pages);
    console.log(`\nParsed ${pages.length} pages → ${sentences.length} candidate sentences\n`);

    for (const [pillar, vocab] of Object.entries(PILLAR_VOCAB)) {
        console.log('\n' + '='.repeat(80));
        console.log(`PILLAR: ${pillar}`);
        console.log('='.repeat(80));

        const vocabRegex = new RegExp(
            '\\b(' + vocab.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
            'i'
        );

        const missed = [];
        for (const s of sentences) {
            if (hitsHardExclusion(s.text)) continue;
            if (!isStructurallyCoherent(s.text)) continue;
            if (!vocabRegex.test(s.text)) continue;
            const { matched } = findIntentMatch(s.text, pillar);
            if (matched) continue;  // already caught — skip
            missed.push(s);
        }

        console.log(`\n  Eligible-but-missed sentences containing pillar vocabulary: ${missed.length}`);
        console.log(`  Showing first 10 (these show how Reliance ACTUALLY writes about this topic):\n`);

        missed.slice(0, 10).forEach((m, i) => {
            console.log(`  [${i + 1}] p.${m.page}`);
            console.log(`      "${m.text.slice(0, 300)}${m.text.length > 300 ? '…' : ''}"\n`);
        });
    }

    console.log('\n' + '='.repeat(80));
    console.log('Paste this output back for pattern widening based on real language.');
    console.log('='.repeat(80));
}


const pdfArg = process.argv[2];
if (!pdfArg) {
    console.error('Usage: node diagnose_missing.js <pdf_path>');
    process.exit(1);
}
run(pdfArg).catch(err => {
    console.error('Error:', err.message);
    console.error(err.stack);
    process.exit(1);
});
