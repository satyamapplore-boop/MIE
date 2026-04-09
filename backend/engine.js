/**
 * MIE Analysis Engine — Main Orchestrator v8.0
 */

const { extractVerbatimStatements, selectMostRepresentativeStatement } = require('./extractor');
const { scoreExtracts } = require('./scorer');
const { buildJustification, buildSummary } = require('./justifier');
const { DIMENSIONS } = require('./dimensions');

const runFullAnalysis = (pages, dimIds) => {
    const results = [];

    const targetDimensions = dimIds && dimIds.length > 0
        ? DIMENSIONS.filter(d => dimIds.includes(d.id))
        : DIMENSIONS;

    targetDimensions.forEach(theme => {
        theme.questions.forEach(q => {
            const extracts = extractVerbatimStatements(pages, {
                title: q.title,
                keywords: theme.keywords,
                triggers: theme.triggers
            });

            const scoreData = scoreExtracts(extracts, theme, q);
            const justification = buildJustification(q, extracts, scoreData);
            const summary = buildSummary(q, extracts, scoreData);
            const mostRep = selectMostRepresentativeStatement(extracts);

            const result = {
                Theme: theme.theme,
                ThemeID: theme.id,
                Attribute: theme.theme,
                QuestionID: q.id,
                Question: q.title,
                Score: scoreData.score,
                Level: `Level ${scoreData.score} (${scoreData.label})`,
                LevelColor: scoreData.color,
                "Most Representative Statement": mostRep,
                "Justification for Level": justification.main,
                "Justification as to why other statements are not relevant": justification.others,
                "Summary Statement": summary,
            };

            // Individual extracts
            extracts.slice(0, 15).forEach((e, idx) => {
                result[`Extract Statement ${idx + 1}`] = e.text;
                result[`Extract Page ${idx + 1}`] = e.page;
            });
            result['Extract Count'] = Math.min(extracts.length, 15);

            // EXACT FORMAT STRING AS PER USER REQUEST PROMPT
            // Note: StartLine:1 should be "Attribute:"
            let exactFormat = `Attribute:\n${theme.theme}\n\n`;
            exactFormat += `Questions:\n${q.title}\n\n`;
            exactFormat += `Most Representative Statement:\n${mostRep}\n\n`;
            exactFormat += `Score:\n${scoreData.score}\n\n`;
            exactFormat += `Level:\nLevel ${scoreData.score} (${scoreData.label})\n\n`;
            exactFormat += `Justification for Level:\n${justification.main}\n\n`;
            exactFormat += `Justification as to why other statements are not relevant:\n${justification.others}\n\n`;
            exactFormat += `Summary Statement:\n${summary}\n\n`;
            
            extracts.slice(0, 6).forEach((e, idx) => {
                exactFormat += `Extract Statement ${idx + 1}:\n${e.text}\n`;
                exactFormat += `Page: ${e.page}\n\n`;
            });

            result.exactFormat = exactFormat.trim();
            results.push(result);
        });
    });

    return results;
};

const getDimensions = () => {
    return DIMENSIONS.flatMap(theme =>
        theme.questions.map(q => ({
            id: theme.id,
            title: theme.theme,
            question: q.title,
            rubric: q.levels.map((l, i) => {
                const parts = l.split(':');
                return {
                    l: i + 1,
                    t: parts[0]?.trim() || `Level ${i+1}`,
                    d: parts[1]?.trim() || l
                };
            })
        }))
    );
};

const formatAsText = (results) => {
    return results.map(r => r.exactFormat).join("\n\n---\n\n");
};

module.exports = { runFullAnalysis, getDimensions, formatAsText };
