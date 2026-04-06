/**
 * MIE Scoring Engine v5.0
 * Calculates Maturity Scores (1-5) across the 40-question framework.
 */

const scoreExtracts = (extracts, theme, question) => {
    // Deterministic Scoring Engine
    // Logic: Identify keywords corresponding to each level definition 1-5.
    
    // Fallback: If no extracts, score is 1 (Completely Linear)
    if (!extracts || extracts.length === 0) {
        return { 
            score: 1, 
            label: "Completely Linear", 
            color: "#888888",
            bestStatement: question.levels[0]
        };
    }

    // Heuristics:
    // 1. Keyword diversity (how many theme-specific keywords found)
    // 2. Trigger Signal Strength (matching specific exponential phrases)
    // 3. Document density (page frequency)
    
    let baseScore = 2; // Default starting point if extracts found
    
    const count = extracts.length;
    const pagesFound = [...new Set(extracts.map(e => e.page))].length;
    
    // Check for Exponential Signals (Pillar 4/5)
    // Example: If terms like "ecosystem", "transformation", "force for good" are found
    const expCounter = extracts.filter(e => 
        e.text.toLowerCase().includes('exponential') || 
        e.text.toLowerCase().includes('global') || 
        e.text.toLowerCase().includes('ecosystem')
    ).length;

    if (expCounter > 2) baseScore = 5;
    else if (expCounter > 0 || count > 10 || pagesFound > 3) baseScore = 4;
    else if (count > 5) baseScore = 3;

    const labels = [
        "Completely Linear",
        "Partially Linear",
        "Partially Exponential",
        "Emerging Exponential",
        "Completely Exponential"
    ];

    const colors = [
        "#888888",
        "#ff4444",
        "#ffcc00",
        "#5dc9ff", 
        "#01ff88"
    ];

    return {
        score: baseScore,
        label: labels[baseScore - 1],
        color: colors[baseScore - 1],
        bestStatement: question.levels[baseScore - 1]
    };
};

module.exports = { scoreExtracts };
