/**
 * diagnose_strict.js
 * ===================
 * Diagnoses exactly why the strict extractor (v3.0) is returning no results.
 * Shows how many sentences pass each of the 3 gates, and prints sample
 * sentences that FAILED Gate 2 (the intent pattern filter) — usually the
 * tightest gate.
 *
 * Run from the MIE project root:
 *     node diagnose_strict.js "C:\Users\Satyam\Downloads\RIL-Integrated-Annual-Report-2022-23.pdf"
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const {
    hitsHardExclusion,
    findIntentMatch,
    isStructurallyCoherent,
    INTENT_PATTERNS,
} = require('./backend/extractor');

const { DIMENSIONS } = require('./backend/dimensions');


async function parsePdf(pdfPath) {
    const buf = fs.readFileSync(pdfPath);
    const pages = [];
    const pdfData = await pdfParse(buf, {
        pagerender: (pageData) => {
            return pageData.getTextContent()
                .then(tc => {
                    const text = tc.items.map(i => i.str).join(' ').trim();
                    if (text.length > 30) {
                        pages.push({ page: pages.length + 1, text });
                    }
                    return text;
                });
        },
    });
    // Fallback if pagerender didn't populate (some PDFs)
    if (pages.length === 0 && pdfData.text) {
        const chunks = pdfData.text.split(/\f/);
        chunks.forEach((chunk, i) => {
            if (chunk.trim().length > 30) {
                pages.push({ page: i + 1, text: chunk.trim() });
            }
        });
    }
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
    console.log('STRICT EXTRACTOR DIAGNOSTIC');
    console.log(`File: ${pdfPath}`);
    console.log('='.repeat(80));

    console.log('\n[1] Parsing PDF...');
    const pages = await parsePdf(pdfPath);
    console.log(`    Got ${pages.length} pages with text`);

    console.log('\n[2] Splitting into sentences...');
    const sentences = splitSentences(pages);
    console.log(`    Got ${sentences.length} candidate sentences`);

    console.log('\n[3] Global gate stats (before any pillar filter):');
    let dropG1 = 0, dropG3 = 0, passBoth = 0;
    for (const s of sentences) {
        if (hitsHardExclusion(s.text)) { dropG1++; continue; }
        if (!isStructurallyCoherent(s.text)) { dropG3++; continue; }
        passBoth++;
    }
    console.log(`    Killed by Gate 1 (hard exclusions): ${dropG1}`);
    console.log(`    Killed by Gate 3 (not coherent)   : ${dropG3}`);
    console.log(`    Survive G1 + G3 (eligible pool)   : ${passBoth}`);

    console.log('\n[4] Per-pillar Gate 2 (intent pattern) results:');
    console.log(`    ${'Pillar'.padEnd(40)} ${'Eligible'.padStart(10)} ${'IntentHit'.padStart(10)}`);
    console.log(`    ${'-'.repeat(40)} ${'-'.repeat(10)} ${'-'.repeat(10)}`);

    const pillarTitles = DIMENSIONS.map(d => d.theme);
    const eligibleByPillar = {};

    for (const pillarTitle of pillarTitles) {
        let eligible = 0, hit = 0;
        const hits = [];
        const misses = [];

        for (const s of sentences) {
            if (hitsHardExclusion(s.text)) continue;
            if (!isStructurallyCoherent(s.text)) continue;
            eligible++;
            const { matched, phrase } = findIntentMatch(s.text, pillarTitle);
            if (matched) {
                hit++;
                if (hits.length < 3) hits.push({ ...s, phrase });
            } else {
                if (misses.length < 3) misses.push(s);
            }
        }
        eligibleByPillar[pillarTitle] = { eligible, hit, hits, misses };

        const flag = hit === 0 ? ' ⚠' : (hit < 2 ? ' (sparse)' : '');
        console.log(`    ${pillarTitle.padEnd(40)} ${String(eligible).padStart(10)} ${String(hit).padStart(10)}${flag}`);
    }

    console.log('\n[5] Sample sentences that PASSED intent pattern (per pillar):');
    for (const pillarTitle of pillarTitles) {
        const d = eligibleByPillar[pillarTitle];
        console.log(`\n  ▸ ${pillarTitle}  (${d.hit} hits)`);
        if (d.hits.length === 0) {
            console.log('    (none)');
        } else {
            for (const h of d.hits) {
                console.log(`    p.${h.page}  [matched: "${h.phrase}"]`);
                console.log(`      "${h.text.slice(0, 200)}${h.text.length > 200 ? '…' : ''}"`);
            }
        }
    }

    console.log('\n[6] Sample sentences that FAILED intent for P1 (MTP) — these might');
    console.log('    be sentences you EXPECTED to match but the regex missed.');
    console.log('    Review to see if a pattern needs widening:');
    const p1 = eligibleByPillar['Purpose / Vision / Mission'];
    if (p1) {
        for (const m of p1.misses) {
            if (/\b(purpose|vision|mission|values|aspir)/i.test(m.text)) {
                console.log(`\n    p.${m.page}`);
                console.log(`      "${m.text.slice(0, 250)}${m.text.length > 250 ? '…' : ''}"`);
            }
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('Paste this entire output back to the assistant for targeted pattern fixes.');
    console.log('='.repeat(80));
}


const pdfArg = process.argv[2];
if (!pdfArg) {
    console.error('Usage: node diagnose_strict.js <pdf_path>');
    process.exit(1);
}
run(pdfArg).catch(err => {
    console.error('Error:', err.message);
    console.error(err.stack);
    process.exit(1);
});
