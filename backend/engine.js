/**
 * MIE Analysis Engine — Main Orchestrator v9.0
 * Refined for 7 Core Parameters and Precision Extraction
 */

const { extractRelevantContent } = require('./extractor');
const { scoreExtracts } = require('./scorer');
const { buildJustification, buildSummary } = require('./justifier');
const { DIMENSIONS } = require('./dimensions');

/**
 * Executes the full audit pipeline for the uploaded document
 * @param {Array} pages - Extracted text pages from PDF
 * @param {Array} dimIds - IDs of dimensions to analyze (optional)
 */
const runFullAnalysis = (pages, dimIds) => {
    const results = [];
    console.log(`[MIE_ENGINE] v9.0: Initializing analysis for ${pages.length} pages...`);

    // Filter themes by selected dimension IDs; default to all
    const targetDimensions = dimIds && dimIds.length > 0
        ? DIMENSIONS.filter(d => dimIds.includes(d.id.toString()) || dimIds.includes(d.id))
        : DIMENSIONS;

    console.log(`[MIE_ENGINE] Target parameters: ${targetDimensions.length}`);

    targetDimensions.forEach(theme => {
        if (!theme.questions || !Array.isArray(theme.questions)) return;

        console.log(`[MIE_ENGINE] Processing Parameter: ${theme.theme}`);

        theme.questions.forEach(q => {
            console.log(`[DEBUG] Processing Question: "${q.title}"`);
            // Aggregate keywords and triggers for extraction
            const combinedTriggers = [
                ...(q.triggers || []),
                ...(theme.triggers || [])
            ];
            const uniqueTriggers = [...new Set(combinedTriggers)];
            const antiPatterns = q.antiPatterns || theme.antiPatterns || [];

            const dimensionForExtractor = {
                title: q.title,
                keywords: uniqueTriggers,
                triggers: uniqueTriggers,
                antiPatterns: antiPatterns
            };

            // 1. Extraction (Precision Verbatim)
            const extracts = extractRelevantContent(pages, dimensionForExtractor);
            
            // 2. Scoring (Deterministic Rubric Matching)
            const scoreData = scoreExtracts(extracts, { triggers: uniqueTriggers }, q);
            
            // 3. Justification (Evidentiary Rationale)
            const justification = buildJustification(q, extracts, scoreData);
            
            // 4. Summarization (Contextual Synthesis)
            const summary = buildSummary(q, extracts, scoreData);
            
            // 5. Representative Statement Selection
            //    Returns the rubric definition of the chosen level (not a PDF quote),
            //    matching the client's sample output format where this field shows
            //    the canonical level description.
            let mostRep;
            if (!extracts || extracts.length === 0 || !scoreData || scoreData.noContent) {
                mostRep = 'No directly relevant content identified in the report for this parameter.';
            } else {
                const chosenRubric = (q.rubric || []).find(r => r.l === scoreData.score);
                mostRep = chosenRubric
                    ? chosenRubric.d
                    : 'No rubric definition available for the chosen level.';
            }

            // Construct exact format for text-based audit trail
            let exactFormat = `**Attribute:**\n${theme.theme}\n\n`;
            exactFormat += `**Question:**\n${q.title}\n\n`;
            exactFormat += `**Most Representative Statement:**\n${mostRep}\n\n`;
            exactFormat += `**Score:**\n${scoreData.score}\n\n`;
            exactFormat += `**Level:**\n${scoreData.label.replace('\n', ' ')}\n\n`;
            exactFormat += `**Justification for Level:**\n${justification.main}\n\n`;
            exactFormat += `**Justification as to why other statements are not relevant:**\n${justification.others}\n\n`;
            exactFormat += `**Summary Statement:**\n${summary}\n\n`;

            extracts.forEach((e, idx) => {
                exactFormat += `**Extract Statement ${idx + 1} (Page ${e.page}):**\n${e.text}\n\n`;
            });

            const result = {
                'Theme': theme.theme,
                'Attribute': theme.theme,
                'QuestionID': q.id,
                'Question': q.title,
                'Most Representative Statement': mostRep,
                'Score': scoreData.score,
                'Level': scoreData.label,
                'LevelColor': scoreData.color,
                'Justification for Level': justification.main,
                'Justification as to why other statements are not relevant': justification.others,
                'Summary Statement': summary,
                'Extract Count': extracts.length,
                'exactFormat': exactFormat.trim()
            };

            // Add individual extract fields for UI mapping
            extracts.forEach((e, idx) => {
                result[`Extract Statement ${idx + 1}`] = e.text;
                result[`Extract Page ${idx + 1}`] = e.page;
            });

            results.push(result);
        });
    });

    console.log(`[MIE_ENGINE] Workflow Complete. Generated ${results.length} audit reports.`);
    return results;
};

const formatAsText = (results) => {
    return results.map(r => r.exactFormat).join('\n\n' + '═'.repeat(40) + '\n\n');
};

module.exports = { runFullAnalysis, formatAsText };
