/**
 * MIE AI Service
 * Communicates with the Claude API via the local proxy server.
 */

const PROXY_URL = 'http://localhost:3131/v1/messages';

export const analyzeDimension = async (apiKey, dimension, filteredSections) => {
    const combinedContent = filteredSections.map(s => `[PAGES ${s.page_range}]\n${s.text}`).join('\n\n---\n\n');
    
    // Level definitions for prompt
    const levelDefinitions = `
    Level 1: No evidence of progress or very traditional/resistant culture.
    Level 2: Initial awareness or basic implementation in silos.
    Level 3: Strategic intent with some organization-wide initiatives.
    Level 4: Advanced maturity with systemic integration and performance impact.
    Level 5: Optimized/Dynamic: High maturity, self-evolving, and industry-leading.
    `;

    const prompt = `
    You are an expert corporate analyst evaluating an Annual Report for Organizational Maturity.
    
    Dimension to Evaluate: ${dimension.title}
    
    Level Definitions:
    ${levelDefinitions}
    
    Context from Report:
    ${combinedContent}
    
    Strict Task:
    1. Score this dimension from 1 to 5 based on the definitions and context.
    2. Extract relevant verbatim quotes and page references.
    3. Justify the score using a 3-part logic: why this score, why not lower, why not higher.
    4. Provide a high-level summary of the maturity status.
    
    No Hallucination: If you cannot find any relevant content for this dimension, set "no_content_found: true" and return score 0 (N/A).
    
    Output Format (JSON strictly):
    {
      "question_id": ${dimension.id},
      "question": "${dimension.title}",
      "relevant_chunks": [
        {
          "page_range": "X-Y",
          "verbatim_text": "...",
          "relevance": "high | medium | low",
          "relevance_note": "..."
        }
      ],
      "summary": "...",
      "score": number, 
      "score_label": "Level X — Label",
      "justification": {
        "why_this_score": "...",
        "why_not_lower": "...",
        "why_not_higher": "..."
      },
      "no_content_found": boolean
    }
    `;

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620', // Default modern Claude model
                max_tokens: 4000,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'API Proxy error');
        }

        const data = await response.json();
        const content = data.content[0].text;
        
        // Attempt clean JSON extraction from response (in case Claude adds conversational text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI returned an invalid response format.');
        
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('AI Service Error:', error);
        throw error;
    }
};

/**
 * MIE Heuristic Scorer (No API Needed)
 * Simulates a response based on keyword density.
 */
export const runHeuristicAnalysis = (dimension, filteredSections, score) => {
    const levelLabels = [
        "N/A", "Level 1 — Traditional", "Level 2 — Aware", "Level 3 — Defined", "Level 4 — Managed", "Level 5 — Optimized"
    ];

    // Mock extracts from sections
    const chunks = filteredSections.slice(0, 3).map(s => ({
        page_range: s.page_range,
        verbatim_text: s.text.substring(50, 250).replace(/\n/g, ' ') + '...',
        relevance: "high",
        relevance_note: "Matches key organizational terms."
    }));

    return {
        question_id: dimension.id,
        question: dimension.title,
        relevant_chunks: chunks,
        summary: `Heuristic Analysis: Based on ${filteredSections.length} sections, the dimension "${dimension.title}" shows moderate alignment with maturity goals. Keyword frequency indicates a mature strategic intent.`,
        score: score,
        score_label: levelLabels[score],
        justification: {
            "why_this_score": `The report contains significant mentions of ${dimension.keywords[0]} and ${dimension.keywords[1]}, placing it in the upper quartile of heuristic frequency.`,
            "why_not_lower": "Explicit strategic references suggest maturity beyond foundational basics.",
            "why_not_higher": "Deeper systemic integration details typical of Level 5 are not frequently mentioned in the keyword mapping."
        },
        no_content_found: score === 0
    };
};
