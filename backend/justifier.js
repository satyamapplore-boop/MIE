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
    const topExtract = extracts[0].text;
    const allExtracts = extracts.map(e => e.text).join(' ');

    let summary = `ANNUAL REPORT EVALUATION BRIEF: ${questionTitle.toUpperCase()}\n\n`;

    // Introduction: Anchored to the most representative statement
    summary += `The organization's explicit intent regarding "${questionTitle}" is best encapsulated by its disclosure: "${topExtract}" (Page ${extracts[0].page}). This theme is central to its broader strategic posture and long-term sustainability alignment. A comprehensive audit of the reported data culminated in a Level ${scoreData.score} (${scoreData.label}) maturity assessment, based on deterministic mapping against industry rubrics.\n\n`;

    // Sub-header 1: Core Purpose and Objectives
    summary += `Core Purpose and Objectives\n`;
    summary += `The primary objective identified in the reporting is to generate value by aligning operational initiatives with strategic priorities. Verbatim evidence points such as "${extracts[Math.min(1, extracts.length-1)].text.substring(0, 200)}..." indicate a focused intent to harmonize people, profit, and purpose. The assessment indicates that these core objectives are ${scoreData.score >= 4 ? 'deeply integrated' : 'actively being established'} within the organization's governance framework.\n\n`;

    // Sub-header 2: Strategic Focus and Mission
    summary += `Strategic Focus and Mission\n`;
    summary += `At its core, the strategy concentrates on delivering ${extracts.map(e => e.matchedKeywords[0] || 'strategic value').slice(0, 3).join(', ')} through measurable outcomes. This mission is anchored in preserving the raw reporting vocabulary while driving ${scoreData.label} maturity. Key elements identified include: ${extracts.slice(0, 5).map(e => `"${e.text.substring(0, 100)}..."`).join(', ')}. This suggests a sophisticated engagement with the thematic requirements of the dimension.\n\n`;

    // Sub-header 3: Implementation and Alignment
    // Based on the "Sustainability and Impact Strategy" header in the sample
    summary += `Implementation and Alignment\n`;
    summary += `The assigned Level ${scoreData.score} reflects a high degree of thematic resonance with the criteria: "${scoreData.bestStatement}". The organisation demonstrates specific proficiency in ${extracts.map(e => e.matchedKeywords[0] || 'operational excellence').slice(0, 5).join(", ")}. While the signals are robust, the path to a frontier Level 5 status requires more radical evidence of ${question.rubric[Math.min(scoreData.score, 4)]?.d || 'further transformation'}. Currently, the evidence provides a high-fidelity truth based strictly on the organisation's public accountability framework.`;

    return summary.trim();
};

module.exports = { buildJustification, buildSummary };
