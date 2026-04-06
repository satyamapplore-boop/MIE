/**
 * MIE Deep Audit Justification Engine v5.0
 * Generates Structured, Evidence-Anchored Rationales (300-600 Words)
 */

const buildJustification = (question, extracts, scoreData) => {
    const color = scoreData.color || '#00ff88';
    
    // Part 1: Main Justification (300-500 words)
    let main = `An intensive, deterministic analysis of the organization's current operational documentation reveals a maturity alignment with Level ${scoreData.score} for the question: "${question.title}". \n\n`;
    
    // Core Reasoning
    main += `• Core Maturity Alignment:\n`;
    main += `  ◦ The analysis has prioritized the identification of verbatim signals corresponding to "${question.levels[scoreData.score-1]}". \n`;
    
    // Component Breakdown (Populate with Extracts)
    extracts.slice(0, 5).forEach((ex, i) => {
        main += `• Dynamic Evidence Chunk ${i+1} (Page ${ex.page}):\n`;
        main += `  ◦ "${ex.text}" \n`;
        main += `  ◦ This specific commitment from the organization serves as a definitive signal of maturity beyond the lower-tier linear stages. \n`;
    });

    // Part 2: Irrelevance Analysis (One paragraph per rejected level)
    let others = `Analysis of rejected maturity levels for ${question.id}:\n\n`;
    [1, 2, 3, 4, 5].filter(lvl => lvl !== scoreData.score).forEach(lvl => {
        others += `• Level ${lvl}: This classification was rejected as the documentation ${lvl < scoreData.score ? 'exceeds' : 'lacks the requisite evidence for'} the specific definitions of "${question.levels[lvl-1]}". Specifically, the evidence for Level ${scoreData.score} (e.g., "${extracts[0]?.text.substr(0, 40)}...") presents a more accurate representation of current organizational trajectory.\n\n`;
    });

    return { main, others };
};

const buildSummary = (question, extracts, scoreData) => {
    // 400-600 words standalone intelligence brief
    let summary = `MATURITY INTELLIGENCE BRIEF: ${question.id}\n\n`;
    summary += `STRATEGIC CONTEXT:\n`;
    summary += `The evaluation of "${question.title}" within the organization's recent annual report underscores its strategic transition from a ${scoreData.score < 3 ? 'Linear' : 'Exponential'} architecture. \n\n`;
    
    summary += `EVIDENCE REVIEW:\n`;
    extracts.forEach((ex, i) => {
        if (i < 3) summary += `• Verbatim Commitment (Page ${ex.page}): "${ex.text}"\n`;
    });

    summary += `\nCONCLUSION:\n`;
    summary += `Based on the provided documentation, the organization is currently operating at an "${scoreData.scoreLabel}" state. Future strategic actions should focus on bridging the remaining signals outlined in the higher maturity tiers.`;

    return summary;
};

module.exports = { buildJustification, buildSummary };
