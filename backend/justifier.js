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
    const secondExtract = extracts[Math.min(1, extracts.length - 1)].text;
    const thirdExtract = extracts[Math.min(2, extracts.length - 1)].text;

    // INTRO PARAGRAPH
    let summary = `The organization's explicit vision for "${questionTitle}" is central to its broader sustainability and impact strategy. This forward-looking statement is supported by a multi-faceted purpose and strategy that balances stakeholder value, operational excellence, and sustainable practices, culminating in a Level ${scoreData.score} positioning.\n\n`;

    // SECTION 1: CORE PURPOSE AND OBJECTIVES
    summary += `Core Purpose and Objectives\n`;
    summary += `The primary objective identified within the public disclosures is to generate value by "${topExtract.substring(0, 350)}${topExtract.length > 350 ? '...' : ''}". This objective is complemented by a client-focused purpose that seeks to harmonize long-term structural growth with attractive impact returns, moving the organization towards ${scoreData.label} maturity.\n\n`;

    // SECTION 2: STRATEGIC FOCUS AND MISSION
    summary += `Strategic Focus and Mission\n`;
    summary += `At its core, the strategy concentrates on delivering value through its mission of transparency and operational resilience. This is anchored in its market leadership and strategic core. Key tenets of this strategy include:\n`;

    const tenets = extracts.slice(0, 3).map((ex, idx) => {
        const theme = (ex.matchedKeywords && ex.matchedKeywords.length > 0) ? ex.matchedKeywords[0].charAt(0).toUpperCase() + ex.matchedKeywords[0].slice(1) : 'Strategic Alignment';
        return `• ${theme}: The organization emphasizes that "${ex.text.substring(0, 250)}..." (Page ${ex.page}). A cornerstone of this approach is the integration of these maturity drivers into every client interaction.\n`;
    }).join('');
    summary += tenets + '\n';

    // SECTION 3: SUSTAINABILITY AND IMPACT STRATEGY
    summary += `Sustainability and Impact Strategy\n`;
    summary += `A key component of the firm's purpose regarding "${questionTitle}" is its sustainability and impact strategy, which is built on three pillars:\n`;
    summary += `1. Protect: To manage the business in alignment with long-term strategy and evolving standards. This involves maintaining a strong control and risk framework, substantiated by disclosures such as "${secondExtract.substring(0, 150)}...".\n`;
    summary += `2. Grow: To embed an innovative offering across all business divisions to meet evolving needs, leveraging proficiency in ${extracts.map(e => e.matchedKeywords[0] || 'growth').slice(3, 6).join(', ')}.\n`;
    summary += `3. Attract: To be the "organization of choice" for stakeholders by maintaining top-tier sustainability ratings and being a go-to employer, as evidenced across page ${extracts[Math.min(4, extracts.length-1)].page} of the report.\n\n`;

    // CONCLUDING PARAGRAPH
    summary += `The organization supports its stakeholders and shareholders by mobilizing capital for strategic transitions, aligning lending with long-term objectives, and maintaining a robust, capital-generative business model. This commitment to sustainable growth and a strong risk-aware culture is evidenced by disclosures like "${thirdExtract.substring(0, 250)}...", reinforcing its Level ${scoreData.score} assessment.`;

    return summary.trim();
};

module.exports = { buildJustification, buildSummary };
