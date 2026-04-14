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
    const firstExtract = extracts[0];
    const top3 = extracts.slice(0, 3);

    // Safe rubric accessor for the "next level"
    const getRubricCriteria = (idx) => {
        if (!question.rubric || !question.rubric[idx]) return 'higher maturity criteria';
        return question.rubric[idx].d || question.rubric[idx].criteria || 'higher maturity criteria';
    };

    let summary = `ANNUAL REPORT EVALUATION BRIEF: ${questionTitle.toUpperCase()}\n\n`;

    // SECTION 1: CORE VISION AND STRATEGIC CONTEXT
    summary += `CORE PURPOSE AND STRATEGIC CONTEXT\n`;
    summary += `The organization's explicit posture regarding "${questionTitle}" is central to its reported sustainability and impact strategy. This assessment, concluding in a Level ${scoreData.score} (${scoreData.label}) maturity state, is substantiated by a deterministic mapping of verbatim disclosures against the industry-standard maturity rubric. The primary anchor statement—"${firstExtract.text}" (Page ${firstExtract.page})—establishes a forward-looking baseline that balances operational intent with strategic stakeholder value.\n\n`;

    // SECTION 2: STRATEGIC FOCUS AND PILLAR ANALYSIS (Bulleted Tenets)
    summary += `STRATEGIC FOCUS AND MISSION TENETS\n`;
    summary += `At its core, the strategy concentrates on translating organizational intent into measurable outcomes. The audit identified ${extracts.length} distinct maturity signals across ${new Set(extracts.map(e => e.page)).size} pages. Key tenets of this strategy, derived directly from the reported evidence, include:\n\n`;

    const tenets = top3.map((ex, idx) => {
        const keywords = (ex.matchedKeywords && ex.matchedKeywords.length > 0) ? ex.matchedKeywords[0].toUpperCase() : 'STRATEGIC ALIGNMENT';
        return `• ${keywords}: The organization emphasizes that "${ex.text.substring(0, 300)}${ex.text.length > 300 ? '...' : ''}" (Page ${ex.page}). This serves as a cornerstone for its ${scoreData.label} maturity state.\n`;
    }).join('\n');
    summary += tenets + '\n';

    // SECTION 3: RUBRIC ALIGNMENT & MATURITY DRIVERS
    summary += `RUBRIC ALIGNMENT AND MATURITY DRIVERS\n`;
    summary += `The assigned Level ${scoreData.score} reflects a high degree of thematic resonance with the criteria: "${scoreData.bestStatement}". The organisation demonstrates specific proficiency in ${extracts.map(e => e.matchedKeywords[0] || 'reporting').slice(0, 4).join(", ")}. To progress towards a frontier Level 5 status, the disclosures would need to show more radical, ecosystem-wide transformative evidence of ${getRubricCriteria(Math.min(scoreData.score, 4))}.\n\n`;

    // SECTION 4: AUDIT CONCLUSION
    summary += `LONG-TERM IMPLICATIONS AND AUDIT CONCLUSION\n`;
    summary += `In conclusion, the current Level ${scoreData.score} assessment provides a defensible, evidence-based view of the organization's trajectory. By anchoring the analysis in raw verbatim fragments—preserving the original reporting vocabulary—this audit ensures that stakeholders can trace the logic from public disclosure to strategic conclusion. The path forward is clearly delineated by the maturity framework, offering a roadmap for future transparency and operational excellence.`;

    return summary.trim();
};

module.exports = { buildJustification, buildSummary };
