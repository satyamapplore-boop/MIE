/**
 * MIE Export Service
 * Generates downloadable JSON and CSV reports.
 */

export const exportToJSON = (data) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MIE_Report_${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

export const exportToCSV = (results) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let csvContentString = "Dimension ID,Dimension,Score,Score Label,Summary,Justification_WhyThis,Justification_WhyNotLower,Justification_WhyNotHigher\n";
    
    results.forEach(res => {
        const row = [
            res.question_id,
            `"${res.question.replace(/"/g, '""')}"`,
            res.score,
            `"${res.score_label?.replace(/"/g, '""') || 'N/A'}"`,
            `"${res.summary?.replace(/"/g, '""') || ''}"`,
            `"${res.justification?.why_this_score?.replace(/"/g, '""') || ''}"`,
            `"${res.justification?.why_not_lower?.replace(/"/g, '""') || ''}"`,
            `"${res.justification?.why_not_higher?.replace(/"/g, '""') || ''}"`
        ];
        csvContentString += row.join(',') + "\n";
    });

    const blob = new Blob([csvContentString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MIE_Report_${timestamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};
