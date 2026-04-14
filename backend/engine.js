/**
 * MIE Analysis Engine — Main Orchestrator v8.1 (Bug-Fixed)
 */

const { extractVerbatimStatements, selectMostRepresentativeStatement } = require('./extractor');
const { scoreExtracts } = require('./scorer');
const { buildJustification, buildSummary } = require('./justifier');
const { DIMENSIONS } = require('./dimensions');

const runFullAnalysis = (pages, dimIds) => {
    const results = [];
    console.log(`[MIE_ENGINE] Starting analysis for ${pages.length} pages...`);

    // Filter themes by selected dimension IDs; default to all
    const targetDimensions = dimIds && dimIds.length > 0
        ? DIMENSIONS.filter(d => dimIds.includes(d.id.toString()) || dimIds.includes(d.id))
        : DIMENSIONS;

    console.log(`[MIE_ENGINE] Target themes: ${targetDimensions.length}`);

    targetDimensions.forEach(theme => {
        if (!theme.questions || !Array.isArray(theme.questions)) return;

        console.log(`[MIE_ENGINE] Analyzing Theme: ${theme.theme}`);

        theme.questions.forEach(q => {
            const combinedTriggers = [
                ...(q.triggers || []),
                ...(theme.triggers || [])
            ];
            const uniqueTriggers = [...new Set(combinedTriggers)];

            const dimensionForExtractor = {
                title: q.title,
                keywords: uniqueTriggers,
                triggers: uniqueTriggers
            };

            const extracts = extractVerbatimStatements(pages, dimensionForExtractor);
            const scoreData = scoreExtracts(extracts, { triggers: uniqueTriggers }, q);
            const justification = buildJustification(q, extracts, scoreData);
            const summary = buildSummary(q, extracts, scoreData);
            const mostRep = selectMostRepresentativeStatement(extracts);

            let exactFormat = `**Attribute:**\n${theme.theme}\n\n`;
            exactFormat += `**Question:**\n${q.title}\n\n`;
            exactFormat += `**Most Representative Statement:**\n${mostRep}\n\n`;
            exactFormat += `**Score:**\n${scoreData.score}\n\n`;
            exactFormat += `**Level:**\nLevel ${scoreData.score} (${scoreData.label})\n\n`;
            exactFormat += `**Justification for Level:**\n${justification.main}\n\n`;
            exactFormat += `**Justification as to why other statements are not relevant:**\n${justification.others}\n\n`;
            exactFormat += `**Summary Statement:**\n${summary}\n\n`;

            extracts.forEach((e, idx) => {
                exactFormat += `**Extract Statement ${idx + 1}:**\n${e.text}\n`;
                exactFormat += `**Page:** ${e.page}\n\n`;
            });

            const result = {
                'Theme': theme.theme,
                'Attribute': theme.theme,
                'QuestionID': q.id,
                'Question': q.title,
                'Questions': q.title,
                'Most Representative Statement': mostRep,
                'Score': scoreData.score,
                'Level': `Level ${scoreData.score} (${scoreData.label})`,
                'LevelColor': scoreData.color,
                'Justification for Level': justification.main,
                'Justification as to why other statements are not relevant': justification.others,
                'Summary Statement': summary,
                'Extract Count': extracts.length,
                'exactFormat': exactFormat.trim()
            };

            extracts.forEach((e, idx) => {
                result[`Extract Statement ${idx + 1}`] = e.text;
                result[`Extract Page ${idx + 1}`] = e.page;
            });

            results.push(result);
        });
    });

    console.log(`\n[MIE_ENGINE] Analysis complete. Generated ${results.length} reports.`);
    return results;
};

const formatAsText = (results) => {
    return results.map(r => r.exactFormat).join('\n\n---\n\n');
};

module.exports = { runFullAnalysis, formatAsText };
