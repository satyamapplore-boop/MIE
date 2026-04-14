const { DIMENSIONS } = require('./backend/dimensions');

try {
    DIMENSIONS.forEach((d, di) => {
        if (!d) console.log(`Theme ${di} is null`);
        if (!d.questions) console.log(`Theme ${d.id} (${d.theme}) has no questions`);
        d.questions.forEach((q, qi) => {
            if (!q) console.log(`Question ${qi} in Theme ${d.id} is null`);
            if (!q.rubric) console.log(`Question ${q.id} in Theme ${d.id} has no rubric`);
            q.rubric.forEach((r, ri) => {
                if (!r) console.log(`Rubric ${ri} in Question ${q.id} is null`);
            });
        });
    });
    console.log("Validation complete.");
} catch (e) {
    console.error("Validation failed:", e.message);
}
