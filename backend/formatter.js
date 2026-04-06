/**
 * MIE Output Formatter v5.0
 * Produces structured Audit JSON and deep-text reports.
 */

const formatOutput = (dimension, extracts, scoreData, justificationData, representativeStatement) => {
    // This function is used by the Engine to build the final question object.
    // Ensure keys match the USER'S EXACT REQUEST for audit reporting.
    return {
        "QUESTION": dimension.title,
        "MOST REPRESENTATIVE STATEMENT": representativeStatement || scoreData.bestStatement,
        "SCORE": scoreData.score,
        "LEVEL": `Level ${scoreData.score} (${scoreData.label})`,
        "JUSTIFICATION FOR LEVEL": justificationData.main,
        "JUSTIFICATION AS TO WHY OTHER STATEMENTS ARE NOT RELEVANT": justificationData.others,
        "SUMMARY STATEMENT": justificationData.summary || "",
        "EXTRACT STATEMENTS": extracts.map((e, idx) => `Extract ${idx + 1}: "${e.text}" (Page ${e.page})`)
    };
};

const formatAsText = (results) => {
    let output = "════════════════════════════════════════\n";
    output += "   MIE DETERMINISTIC AUDIT REPORT       \n";
    output += "════════════════════════════════════════\n\n";

    Object.keys(results).forEach(themeName => {
        const theme = results[themeName];
        output += `THEME ${theme.id}: ${theme.theme}\n`;
        output += `────────────────────────────────────────\n\n`;

        theme.questions.forEach((q, idx) => {
            output += `--- \n`;
            output += `QUESTION [${q.QuestionID}]: ${q.Question}\n\n`;
            output += `MOST REPRESENTATIVE STATEMENT:\n${q.MostRepresentativeStatement}\n\n`;
            output += `SCORE: ${q.Score}\n`;
            output += `LEVEL: ${q.Level}\n\n`;
            output += `JUSTIFICATION FOR LEVEL:\n${q.JustificationForLevel}\n\n`;
            output += `JUSTIFICATION AS TO WHY OTHER STATEMENTS ARE NOT RELEVANT:\n${q.JustificationOtherRelevance}\n\n`;
            output += `SUMMARY STATEMENT:\n${q.SummaryStatement}\n\n`;
            output += `EXTRACT STATEMENTS:\n${q.ExtractStatements.join('\n')}\n`;
            output += `---\n\n`;
        });
    });

    return output;
};

module.exports = { formatOutput, formatAsText };
