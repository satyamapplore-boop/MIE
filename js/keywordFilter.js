/**
 * MIE Keyword Pre-Filtering Engine
 * Scores sections for each dimension and selects the most relevant.
 */

export const DIMENSIONS = [
    {
        id: 1,
        title: "Purpose / Vision / Mission",
        keywords: ["purpose", "vision", "mission", "values", "culture", "belief", "why we exist", "aspiration"]
    },
    {
        id: 2,
        title: "Workforce Model",
        keywords: ["workforce", "talent", "employees", "remote", "hybrid", "skills", "upskilling", "wellbeing", "DEI", "retention"]
    },
    {
        id: 3,
        title: "Stakeholder Community",
        keywords: ["stakeholder", "community", "partners", "ecosystem", "customers", "society", "environment", "impact"]
    },
    {
        id: 4,
        title: "Disruptive Technology",
        keywords: ["AI", "generative", "automation", "digitization", "quantum", "innovation", "blockchain", "R&D", "transformation"]
    },
    {
        id: 5,
        title: "External Integration",
        keywords: ["supply chain", "api", "integration", "outreach", "mergers", "acquisitions", "dynamic", "network"]
    },
    {
        id: 6,
        title: "Risk & Failure Culture",
        keywords: ["risk", "failure", "experiment", "learning", "safety", "governance", "resilience", "psychological safety"]
    },
    {
        id: 7,
        title: "Decentralized Decision-Making",
        keywords: ["decentralized", "autonomy", "flatter hierarchy", "agility", "empowerment", "teams", "ownership"]
    }
];

export const filterSectionsForDimension = (sections, dimensionId) => {
    const dimension = DIMENSIONS.find(d => d.id === dimensionId);
    if (!dimension) return sections;

    // Score each section
    const scoredSections = sections.map(section => {
        let score = 0;
        const text = section.text.toLowerCase();
        
        dimension.keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
            const matches = text.match(regex);
            if (matches) {
                score += matches.length;
            }
        });

        return { ...section, relevanceScore: score };
    });

    // Strategy: Select top sections up to 15,000 words total, min 3
    // Sort by score descending
    scoredSections.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const LIMIT_WORDS = 15000;
    const selected = [];
    let totalWords = 0;

    for (let i = 0; i < scoredSections.length; i++) {
        const sectionWords = scoredSections[i].text.split(/\s+/).length;
        
        // Always pick at least 3 if available, or if within word limit
        if (selected.length < 3 || (totalWords + sectionWords <= LIMIT_WORDS)) {
            selected.push(scoredSections[i]);
            totalWords += sectionWords;
        } else {
            break;
        }
    }

    // Reorder back to original page order
    selected.sort((a, b) => a.section_id - b.section_id);

    return selected;
};

/**
 * Calculates a maturity score (1-5) based on keyword frequency.
 */
export const getHeuristicScore = (sections) => {
    let totalScore = 0;
    sections.forEach(s => totalScore += (s.relevanceScore || 0));

    // Heuristic buckets:
    if (totalScore >= 40) return 5;
    if (totalScore >= 25) return 4;
    if (totalScore >= 12) return 3;
    if (totalScore >= 5)  return 2;
    return 1;
};
