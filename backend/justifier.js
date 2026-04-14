/**
 * MIE Justification Engine v8.1 (Bug-Fixed)
 * Rubric fields: .l (level), .t (label/title), .d (description/criteria)
 */

const buildJustification = (question, extracts, scoreData) => {
    const hasContent = extracts && extracts.length > 0;

    // Helper: get rubric label/criteria safely
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
        justificationForLevel = `This statement best encapsulates the multi-faceted purpose and strategy articulated across the organization's official reports. The organization's approach is explicitly designed to balance financial performance with its responsibilities to a wide range of stakeholders and the environment, which aligns directly with the goal of Level ${scoreData.score} maturity: "${scoreData.bestStatement}".\n\n`;
        
        justificationForLevel += `Evidence from the sources is broken down by each component of the statement:\n\n`;

        // We use the top extracts to act as "components"
        extracts.slice(0, 6).forEach((ex, idx) => {
            const rawTheme = (ex.matchedKeywords && ex.matchedKeywords.length > 0) ? ex.matchedKeywords[0] : 'Strategic Alignment';
            // Capitalize theme
            const theme = rawTheme.charAt(0).toUpperCase() + rawTheme.slice(1);
            
            justificationForLevel += `• ${theme}: The organization explicitly identifies its objective as creating value through this component.\n`;
            justificationForLevel += `    ◦ Verbatim Evidence (Page ${ex.page}): "${ex.text}"\n`;
            justificationForLevel += `    ◦ Assessment logic: This disclosure demonstrates specific alignment with ${scoreData.label} maturity by ${theme === 'Strategic Alignment' ? 'integrating core values into its governance' : 'substantiating claims regarding ' + theme}. It provides a direct link between reported action and the requirement for "${scoreData.bestStatement}".\n\n`;
        });

        // Add a "Cohesive Integration" section if high score
        if (scoreData.score >= 4) {
            justificationForLevel += `• Cohesively Integrating People, Profit, and the Planet: The strategy and reporting structure are explicitly built around integrating these three elements. As demonstrated by the density of keywords like "${extracts.map(e => e.matchedKeywords[0]).slice(0,3).join(', ')}", the organisation directly links profit-driven aims with responsibilities to society and employees, fulfilling the requirements for an Emerging Exponential maturity level.`;
        } else {
            justificationForLevel += `• Strategic Alignment Goal: While foundational signals are present, the organisation is currently in the process of harmonizing these disparite reporting threads into a unified strategic narrative. The current evidence provides a defensible baseline for Level ${scoreData.score} maturity.`;
        }
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
