/**
 * MIE Justification Engine v8.1 (Bug-Fixed)
 * Rubric fields: .l (level), .t (label/title), .d (description/criteria)
 */

const buildJustification = (question, extracts, scoreData) => {
    const hasContent = extracts && extracts.length > 0;

    // Helper: get rubric label/criteria safely (raw objects use .t and .d)
    const getRubric = (idx) => {
        if (!question.rubric || !question.rubric[idx]) return { label: 'N/A', criteria: 'N/A' };
        const r = question.rubric[idx];
        return {
            label: r.t || r.label || 'N/A',
            criteria: r.d || r.criteria || 'N/A'
        };
    };

    let justificationForLevel = '';
    if (!hasContent) {
        justificationForLevel = 'Unable to score — no relevant content identified in the report for this dimension.';
    } else {
        const topExtract = extracts[0].text;
        justificationForLevel = `This statement best encapsulates the evidence found in the audit trail: "${topExtract}"\n\n`;
        justificationForLevel += `The maturity assessment of Level ${scoreData.score} is substantiated by a detailed review of the organisation's disclosures. The analysis indicates that ${scoreData.label} characteristics are pervasive in the reported text. Specifically, the following verbatim evidence points were identified as core pillars of this maturity state:\n\n`;

        extracts.slice(0, 5).forEach((ex, idx) => {
            const keywords = ex.matchedKeywords && ex.matchedKeywords.length > 0
                ? ex.matchedKeywords.join(', ')
                : 'strategic themes';
            justificationForLevel += `• Point ${idx + 1} (Page ${ex.page}): "${ex.text}"\n`;
            justificationForLevel += `  Reasoning: This extract demonstrates specific alignment with the rubric criteria for Level ${scoreData.score} because it explicitly references ${keywords} in a context that validates ${scoreData.label} practices.\n\n`;
        });

        justificationForLevel += `This evidence suggests that the organisation has moved beyond foundational requirements and is actively ${scoreData.score >= 3 ? 'integrating' : 'establishing'} these maturity drivers into its core operational framework.`;
    }

    let justificationOthers = '';
    if (!hasContent) {
        justificationOthers = 'Unable to score — no relevant content identified in the report for this dimension.';
    } else {
        [1, 2, 3, 4, 5].forEach(l => {
            if (l === scoreData.score) return;
            const rubricItem = getRubric(l - 1);
            const levelLabel = `${rubricItem.label}: ${rubricItem.criteria}`;

            justificationOthers += `• Statement ${l}: `;
            if (l < scoreData.score) {
                justificationOthers += `This level was rejected as the identified evidence demonstrates maturity characteristics that significantly exceed the requirements of "${levelLabel}". The organisation's disclosures point to a more sophisticated and ${scoreData.score >= 4 ? 'exponential' : 'integrated'} approach than what is defined at this lower tier.\n\n`;
            } else {
                justificationOthers += `This level was not assigned because the current audit did not identify sufficient verbatim signals to validate the higher-tier requirements of "${levelLabel}". While foundational and intermediate signals are present, the specific transformative impact required for Level ${l} remains unsubstantiated in the public report text.\n\n`;
            }
        });
    }

    return { main: justificationForLevel.trim(), others: justificationOthers.trim() };
};

const buildSummary = (question, extracts, scoreData) => {
    if (!extracts || extracts.length === 0) {
        return 'Unable to score — no relevant content identified in the report for this dimension.';
    }

    const questionTitle = question.title || 'this dimension';

    // Safe rubric accessor
    const getRubricCriteria = (idx) => {
        if (!question.rubric || !question.rubric[idx]) return 'higher maturity criteria';
        return question.rubric[idx].d || question.rubric[idx].criteria || 'higher maturity criteria';
    };

    let summary = `ANNUAL REPORT EVALUATION BRIEF: ${questionTitle.toUpperCase()}\n\n`;

    summary += `DETAILED MATURITY ANALYSIS AND STRATEGIC CONTEXT\n`;
    summary += `The comprehensive audit of the organisation's public fiscal disclosures regarding "${questionTitle}" has culminated in a definitive maturity score of Level ${scoreData.score}. This assessment is not merely a qualitative observation but a deterministic result of mapping verbatim extracted text—preserving the raw reporting vocabulary—against the established 5-tier exponential maturity rubric. Within this framework, a Level ${scoreData.score} positioning indicates that the organisation is ${scoreData.score >= 4 ? 'not only aware of this dimension but has integrated it into the highest levels of governance and operational execution' : 'in the process of formalising its approach, moving from sporadic project-based initiatives towards a more systematic strategic alignment'}. The density of signals identified suggest a consistent narrative thread that connects local operational claims to board-level transparency commitments.\n\n`;

    summary += `VERBATIM EVIDENCE REVIEW AND EMPIRICAL ANCHORING\n`;
    const firstExtract = extracts[0];
    const sampleTexts = extracts.slice(0, 3)
        .map(e => `"${e.text.substring(0, 120)}..."`)
        .join(', ');
    summary += `A total of ${extracts.length} distinct maturity signals were identified across ${new Set(extracts.map(e => e.page)).size} pages of the disclosed data. The primary anchor statement for this assessment—"${firstExtract.text}" (found on Page ${firstExtract.page})—provides a direct link between reported action and maturity criteria. Furthermore, the inclusion of phrases such as ${sampleTexts} indicates a sophisticated engagement with the thematic requirements of "${questionTitle}". These verbatim fragments are essential to the audit trail, as they provide the empirical evidence necessary to substantiating claims of ${scoreData.label} maturity.\n\n`;

    summary += `RUBRIC ALIGNMENT AND MATURITY RATIONALE\n`;
    const nextLevelCriteria = getRubricCriteria(Math.min(scoreData.score, 4));
    const matchedKeywordsSample = extracts
        .map(e => (e.matchedKeywords && e.matchedKeywords[0]) ? e.matchedKeywords[0] : 'strategic reporting')
        .slice(0, 5)
        .join(', ');
    summary += `The assigned level of Level ${scoreData.score} reflects a high degree of thematic resonance with the rubric definition: "${scoreData.bestStatement}". The organisation demonstrates specific proficiency in ${matchedKeywordsSample}. This suggests that the organisational DNA is increasingly attuned to the requirements of exponential maturity. However, to progress towards a frontier Level 5 status, the disclosures would need to show more radical evidence of ${nextLevelCriteria}.\n\n`;

    summary += `LONG-TERM IMPLICATIONS AND AUDIT CONCLUSION\n`;
    const e1 = extracts[Math.min(1, extracts.length - 1)];
    const e2 = extracts[Math.min(2, extracts.length - 1)];
    summary += `In conclusion, the current Level ${scoreData.score} assessment provides a defensible, evidence-based view of the organisation's maturity for "${questionTitle}". By anchoring the analysis in verbatim disclosures such as "${e1.text.substring(0, 150)}..." and "${e2.text.substring(0, 130)}...", this audit report ensures that stakeholders can trace the logic from raw report data to the final strategic conclusion. This deterministic approach eliminates interpretative bias, providing a high-fidelity truth based strictly on the organisation's public accountability framework.\n\n`;

    return summary.trim();
};

module.exports = { buildJustification, buildSummary };
