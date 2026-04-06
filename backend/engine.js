/**
 * MIE Analysis Engine — Main Orchestrator v5.0
 * Deep Audit Pipeline: Processes 40 Sub-Questions across 12 Strategic Themes.
 */

const { extractVerbatimStatements } = require('./extractor');
const { scoreExtracts } = require('./scorer');
const { buildJustification, buildSummary } = require('./justifier');
const { DIMENSIONS } = require('./dimensions');

/**
 * runFullAnalysis
 * @param {Array} pages      - Array of { page: number, text: string }
 * @returns {Object}         - Theme-grouped results
 */
const runFullAnalysis = (pages) => {
    const results = {};

    DIMENSIONS.forEach(theme => {
        results[theme.theme] = {
            id: theme.id,
            theme: theme.theme,
            questions: []
        };

        theme.questions.forEach(q => {
            // STEP 1: Targeted Extraction
            const extracts = extractVerbatimStatements(pages, {
                title: q.title,
                keywords: theme.keywords,
                triggers: theme.triggers
            });

            // STEP 2: Scoring (1-5)
            const scoreData = scoreExtracts(extracts, theme, q);

            // STEP 3: Deep Justification (Audit Grade)
            const justification = buildJustification(q, extracts, scoreData);
            const summary = buildSummary(q, extracts, scoreData);

            // STEP 4: Build Audit Block
            results[theme.theme].questions.push({
                QuestionID: q.id,
                Question: q.title,
                MostRepresentativeStatement: q.levels[scoreData.score - 1] || "N/A",
                Score: scoreData.score,
                Level: `Level ${scoreData.score} (${scoreData.label})`,
                JustificationForLevel: justification.main,
                JustificationOtherRelevance: justification.others,
                SummaryStatement: summary,
                ExtractStatements: extracts.map((e, idx) => `Extract ${idx + 1}: "${e.text}" (Page ${e.page})`)
            });
        });
    });

    return results;
};

module.exports = { runFullAnalysis };
