/**
 * MIE Justifier v2.1 — cleaner prose generation
 *
 * Exports match engine.js's call signatures:
 *   buildJustification(question, extracts, scoreData)   → {main, others}
 *   buildSummary(question, extracts, scoreData)         → string
 * Internal helpers (buildMainJustification, buildOtherLevelsJustification,
 * buildSummaryCore, distinctivePhrases) are also exported for direct use.
 */

const DISTINCTIVE_STOPWORDS = new Set([
    'the','is','a','an','and','or','but','of','to','in','on','at','for','with',
    'by','from','as','it','its','this','that','these','those','be','been','being',
    'are','was','were','has','have','had','do','does','did','will','would','should',
    'could','may','might','our','we','us','they','their','them','which','who','whom',
    'well','bring','beyond','aims','within','across','both','also','different','various',
    'several','certain','specific','particular','achieving','delivering','serving',
    'doing','including','notably','particularly','especially','etc','eg','ie',
    'organization','organizations','organizational',
    'level','linear','exponential','partially','emerging','completely',
    'based','make','makes','very','only','not','no','yes',
]);

function tokenize(text) {
    return (text.toLowerCase().match(/[a-z][a-z\-]+/g) || [])
        .filter(t => t.length > 3 && !DISTINCTIVE_STOPWORDS.has(t));
}

function trigrams(tokens) {
    const out = [];
    for (let i = 0; i < tokens.length - 2; i++) {
        out.push(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
    }
    return out;
}

function distinctivePhrases(targetText, allOtherTexts, maxN = 3) {
    const targetTri = new Set(trigrams(tokenize(targetText)));
    const otherTri = new Set();
    for (const other of allOtherTexts) {
        trigrams(tokenize(other)).forEach(t => otherTri.add(t));
    }
    return [...targetTri]
        .filter(t => !otherTri.has(t))
        .filter(t => t.length >= 14)
        .sort((a, b) => b.length - a.length)
        .slice(0, maxN);
}

function truncate(text, maxChars) {
    if (!text) return '';
    if (text.length <= maxChars) return text;
    const cut = text.slice(0, maxChars).replace(/\s\S*$/, '');
    return cut + '…';
}

function summarizeLevelDef(def) {
    const firstSentence = (def.split(/(?<=[.!?])\s+/)[0] || def).trim();
    return firstSentence
        .replace(/^The organization/i, 'the organization')
        .replace(/\.$/, '');
}


// ---------------------------------------------------------------------------
// Core builders
// ---------------------------------------------------------------------------

function buildMainJustification(extracts, rubric, chosenLevel, dimensionTitle) {
    const chosenDef = (rubric || []).find(r => r.l === chosenLevel);
    if (!chosenDef) {
        return 'Unable to determine level — no relevant evidence found in the document.';
    }

    const top = (extracts || []).slice(0, 3);
    if (top.length === 0) {
        return `No relevant evidence was identified in the document for the '${dimensionTitle}' dimension.`;
    }

    const topQuotes = top
        .map(e => `(p.${e.page}) "${truncate(e.text, 180)}"`)
        .join(' ');

    return (
        `The evidence aligns most closely with Level ${chosenLevel} (${chosenDef.t}) ` +
        `for the '${dimensionTitle}' dimension. ` +
        `The rubric defines this level as: "${chosenDef.d}" ` +
        `Supporting evidence from the report includes: ${topQuotes}`
    );
}


function buildOtherLevelsJustification(rubric, chosenLevel) {
    if (!rubric || rubric.length === 0) return '';
    const chosenDef = rubric.find(r => r.l === chosenLevel);
    if (!chosenDef) return '';

    const otherDefsExceptChosen = rubric
        .filter(r => r.l !== chosenLevel)
        .map(r => r.d);

    const lines = [];
    for (const level of rubric) {
        if (level.l === chosenLevel) continue;

        const otherDefsExceptThis = rubric
            .filter(r => r.l !== level.l)
            .map(r => r.d);

        const thisDistinct = distinctivePhrases(level.d, otherDefsExceptThis, 3);
        const chosenDistinct = distinctivePhrases(chosenDef.d, otherDefsExceptChosen, 3);

        if (level.l < chosenLevel) {
            lines.push(
                `Level ${level.l} (${level.t}): Accurate but incomplete. The evidence ` +
                `extends beyond this description, substantively demonstrating aspects ` +
                `unique to Level ${chosenLevel}` +
                (chosenDistinct.length
                    ? ` — notably "${chosenDistinct.join('", "')}"`
                    : '') +
                ` — which this statement does not capture.`
            );
        } else {
            lines.push(
                `Level ${level.l} (${level.t}): Overstates the evidence. The report ` +
                `does not substantively demonstrate the distinguishing features of ` +
                `this level` +
                (thisDistinct.length
                    ? ` — notably "${thisDistinct.join('", "')}"`
                    : '') +
                `. The evidence aligns more closely with Level ${chosenLevel}.`
            );
        }
    }
    return lines.join('\n\n');
}


function buildSummaryCore(extracts, rubric, chosenLevel, dimensionTitle) {
    if (!extracts || extracts.length === 0) {
        return 'No relevant content found for this dimension in the document.';
    }

    const chosenDef = (rubric || []).find(r => r.l === chosenLevel);
    const levelName = chosenDef ? chosenDef.t : `Level ${chosenLevel}`;

    const uniquePages = [...new Set(extracts.map(e => e.page))];
    const pageList = uniquePages.length <= 5
        ? uniquePages.join(', ')
        : `${uniquePages.slice(0, 4).join(', ')}, and others`;

    const primaryQuote = extracts[0] ? truncate(extracts[0].text, 200) : '';
    const secondaryQuote = extracts[1] ? truncate(extracts[1].text, 200) : '';
    const tertiaryQuote = extracts[2] ? truncate(extracts[2].text, 200) : '';

    const parts = [];

    parts.push(
        `The organization's approach to ${dimensionTitle.toLowerCase()} is ` +
        `characterized at Level ${chosenLevel} (${levelName}), drawing on ` +
        `${extracts.length} verbatim extracts spanning page(s) ${pageList}.`
    );

    if (primaryQuote) {
        parts.push(
            `The primary evidence appears in the form of statements such as: ` +
            `"${primaryQuote}" (p.${extracts[0].page}).`
        );
    }

    if (secondaryQuote || tertiaryQuote) {
        const supporting = [];
        if (secondaryQuote) {
            supporting.push(`"${secondaryQuote}" (p.${extracts[1].page})`);
        }
        if (tertiaryQuote) {
            supporting.push(`"${tertiaryQuote}" (p.${extracts[2].page})`);
        }
        parts.push(`Additional supporting evidence includes: ${supporting.join('; ')}.`);
    }

    if (chosenDef) {
        parts.push(
            `Taken together, these verbatim signals are consistent with the ` +
            `Level ${chosenLevel} rubric definition for this dimension, which ` +
            `describes an organization where ${summarizeLevelDef(chosenDef.d)}.`
        );
    }

    return parts.join(' ');
}


// ---------------------------------------------------------------------------
// Wrappers matching engine.js call signatures
// ---------------------------------------------------------------------------

function buildJustification(question, extracts, scoreData) {
    const rubric = (question && question.rubric) || [];
    const chosenLevel = (scoreData && scoreData.score) || 0;
    const dimensionTitle = (question && question.title) || '';

    if (!scoreData || scoreData.noContent || chosenLevel === 0) {
        return {
            main: `No relevant evidence was identified in the document for the '${dimensionTitle}' dimension.`,
            others: '',
        };
    }

    return {
        main: buildMainJustification(extracts, rubric, chosenLevel, dimensionTitle),
        others: buildOtherLevelsJustification(rubric, chosenLevel),
    };
}

function buildSummary(question, extracts, scoreData) {
    const rubric = (question && question.rubric) || [];
    const chosenLevel = (scoreData && scoreData.score) || 0;
    const dimensionTitle = (question && question.title) || '';
    return buildSummaryCore(extracts, rubric, chosenLevel, dimensionTitle);
}


module.exports = {
    buildJustification,
    buildSummary,
    buildMainJustification,
    buildOtherLevelsJustification,
    buildSummaryCore,
    distinctivePhrases,
};
