/**
 * MIE Analysis Engine — Main Orchestrator v8.1 (Bug-Fixed)
 */

const { extractVerbatimStatements, selectMostRepresentativeStatement } = require('./extractor');
const { scoreExtracts } = require('./scorer');
const { buildJustification, buildSummary } = require('./justifier');
const { DIMENSIONS } = require('./dimensions');

const runFullAnalysis = (pages, dimIds) => {
    const results = [];

    // Filter themes by selected dimension IDs; default to all
    const targetDimensions = dimIds && dimIds.length > 0
        ? DIMENSIONS.filter(d => dimIds.includes(d.id.toString()) || dimIds.includes(d.id))
        : DIMENSIONS;

    targetDimensions.forEach(theme => {
        // theme.questions is the array of question objects
        if (!theme.questions || !Array.isArray(theme.questions)) return;

        theme.questions.forEach(q => {
            // Merge theme-level triggers with question-level triggers (questions may not have keywords)
            const combinedTriggers = [
                ...(q.triggers || []),
                ...(theme.triggers || [])
            ];
            // Deduplicate
            const uniqueTriggers = [...new Set(combinedTriggers)];

            const dimensionForExtractor = {
                title: q.title,
                keywords: uniqueTriggers,   // extractor reads .keywords
                triggers: uniqueTriggers    // extractor also reads .triggers for boost
            };

            const extracts = extractVerbatimStatements(pages, dimensionForExtractor);

            // Pass raw theme and question so scorer/justifier can access triggers / rubric
            const scoreData = scoreExtracts(extracts, {
                triggers: uniqueTriggers
            }, q);

            const justification = buildJustification(q, extracts, scoreData);
            const summary = buildSummary(q, extracts, scoreData);
            const mostRep = selectMostRepresentativeStatement(extracts);

            // Build exact text format string
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

            // Add dynamic extract fields
            extracts.forEach((e, idx) => {
                result[`Extract Statement ${idx + 1}`] = e.text;
                result[`Extract Page ${idx + 1}`] = e.page;
            });

            results.push(result);
        });
    });

    return results;
};

const formatAsText = (results) => {
    return results.map(r => r.exactFormat).join('\n\n---\n\n');
};

module.exports = { runFullAnalysis, formatAsText };
