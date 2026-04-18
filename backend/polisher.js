/**
 * MIE Polisher v1.0 — Ollama-backed prose refinement
 * ===================================================
 * Runs AFTER the deterministic pipeline. Takes the evidence + score +
 * deterministic justifications/summary, and asks a local LLM (via Ollama)
 * to rewrite them as polished consulting-style prose.
 *
 * Design principles:
 *   - Never re-scores. The deterministic Level 1-5 decision is authoritative.
 *   - Never invents evidence. LLM only reshapes what was already extracted.
 *   - Graceful degradation. If Ollama is unreachable or times out on any
 *     pillar, we keep the deterministic output for that pillar.
 *
 * API contract:
 *   const { polishResults, isOllamaReachable } = require('./polisher');
 *   const polished = await polishResults(deterministicResults);
 */

const http = require('http');

const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = 11434;
const OLLAMA_MODEL = 'qwen2.5:7b';
const OLLAMA_TIMEOUT_MS = 120000;    // 2 minutes per pillar


// ---------------------------------------------------------------------------
// Low-level Ollama client (no external deps — pure Node http)
// ---------------------------------------------------------------------------

function postToOllama(path, payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        const req = http.request(
            {
                host: OLLAMA_HOST,
                port: OLLAMA_PORT,
                path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                },
                timeout: OLLAMA_TIMEOUT_MS,
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (err) {
                        reject(new Error(`Ollama returned non-JSON: ${data.slice(0, 200)}`));
                    }
                });
            }
        );
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Ollama request timed out'));
        });
        req.write(body);
        req.end();
    });
}


function getFromOllama(path) {
    return new Promise((resolve, reject) => {
        const req = http.request(
            {
                host: OLLAMA_HOST,
                port: OLLAMA_PORT,
                path,
                method: 'GET',
                timeout: 5000,
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch {
                        resolve(null);
                    }
                });
            }
        );
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.end();
    });
}


async function isOllamaReachable() {
    try {
        const res = await getFromOllama('/api/tags');
        return res && Array.isArray(res.models);
    } catch {
        return false;
    }
}


// ---------------------------------------------------------------------------
// Parse defensive JSON (local LLMs sometimes wrap output)
// ---------------------------------------------------------------------------

function parseLenientJson(text) {
    if (!text) return null;
    let cleaned = text.trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');

    try { return JSON.parse(cleaned); } catch {}

    // Try extracting first balanced {...} block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
        try { return JSON.parse(match[0]); } catch {}
    }
    return null;
}


// ---------------------------------------------------------------------------
// Prompt — structured JSON output for one pillar
// ---------------------------------------------------------------------------

function buildPolishPrompt(pillar) {
    // Collect up to 8 extracts for LLM context (keep prompt small for speed)
    const extracts = [];
    for (let i = 1; i <= 10; i++) {
        const txt = pillar[`Extract Statement ${i}`];
        const pg = pillar[`Extract Page ${i}`];
        if (!txt) break;
        extracts.push(`[p.${pg}] ${String(txt).slice(0, 400)}`);
    }
    const evidenceBlock = extracts.slice(0, 8).join('\n\n');

    return `You are a senior corporate strategy analyst. Rewrite the analysis below as polished consulting-style prose.

ATTRIBUTE: ${pillar.Attribute || pillar.Theme || 'Unknown'}
QUESTION: ${pillar.Question || ''}
ASSIGNED LEVEL: ${pillar.Score} — ${pillar.Level || ''}
RUBRIC TEXT FOR CHOSEN LEVEL: ${pillar['Most Representative Statement'] || ''}

EVIDENCE EXTRACTED FROM THE REPORT:

${evidenceBlock}

Return ONLY valid JSON (no markdown fences, no preamble) with these exact keys:

{
  "justification_for_level": "150-200 words of professional prose explaining why the assigned level fits. Weave in 2-3 short quoted phrases from the evidence (keep quotes verbatim). Do NOT invent evidence. Do NOT change the assigned level.",
  "summary_statement": "300-350 words of consulting-style prose. Structure: (1) opening thesis sentence naming the attribute and positioning, (2) 'Core Purpose' paragraph with quoted evidence, (3) 'Key Initiatives' paragraph with specific examples from the evidence, (4) closing observation tying back to the assigned level. Keep all quotes verbatim from the evidence above."
}

Critical rules:
- Keep the assigned level exactly as given.
- Never invent quotes. Only use phrases that appear in the evidence above.
- Write natural flowing prose, not templates or bullet points.
- Start your response with { character.`;
}


// ---------------------------------------------------------------------------
// Polish one pillar (with fallback)
// ---------------------------------------------------------------------------

async function polishPillar(pillar, model = OLLAMA_MODEL) {
    // Skip if no evidence
    if (!pillar.Score || pillar.Score === 0 || pillar['Extract Count'] === 0) {
        return { ...pillar, _polished: false, _polish_skip: 'no-evidence' };
    }

    try {
        const prompt = buildPolishPrompt(pillar);
        const response = await postToOllama('/api/generate', {
            model,
            prompt,
            format: 'json',
            stream: false,
            options: {
                temperature: 0.2,
                num_predict: 2500,
            },
        });

        const refined = parseLenientJson(response && response.response);
        if (!refined) {
            return { ...pillar, _polished: false, _polish_error: 'invalid-json' };
        }

        const out = { ...pillar };
        if (refined.justification_for_level) {
            out['Justification for Level'] = refined.justification_for_level;
        }
        if (refined.summary_statement) {
            out['Summary Statement'] = refined.summary_statement;
        }
        out._polished = true;
        out._polish_model = model;
        return out;

    } catch (err) {
        return {
            ...pillar,
            _polished: false,
            _polish_error: String(err.message || err).slice(0, 200),
        };
    }
}


// ---------------------------------------------------------------------------
// Polish all pillars sequentially
// ---------------------------------------------------------------------------
// Sequential, not parallel — 7B models hog RAM, running 7 calls in parallel
// often causes OOM or massive slowdown on laptops.

async function polishResults(results, options = {}) {
    const model = options.model || OLLAMA_MODEL;
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;

    const reachable = await isOllamaReachable();
    if (!reachable) {
        console.log('[POLISHER] Ollama not reachable — returning deterministic results unchanged');
        return results.map(r => ({ ...r, _polished: false, _polish_skip: 'ollama-offline' }));
    }

    console.log(`[POLISHER] Starting LLM polish (model: ${model}) for ${results.length} pillars`);
    const polished = [];

    for (let i = 0; i < results.length; i++) {
        const pillar = results[i];
        const name = pillar.Attribute || pillar.Theme || `Pillar ${i + 1}`;
        const startTime = Date.now();
        if (onProgress) onProgress(i, results.length, name);

        const result = await polishPillar(pillar, model);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        if (result._polished) {
            console.log(`[POLISHER] [${i + 1}/${results.length}] ${name} — done in ${elapsed}s`);
        } else {
            const reason = result._polish_skip || result._polish_error || 'unknown';
            console.log(`[POLISHER] [${i + 1}/${results.length}] ${name} — skipped (${reason})`);
        }
        polished.push(result);
    }

    const okCount = polished.filter(r => r._polished).length;
    console.log(`[POLISHER] Complete — ${okCount}/${polished.length} pillars polished`);
    return polished;
}


module.exports = {
    polishResults,
    polishPillar,
    isOllamaReachable,
    OLLAMA_MODEL,
};
