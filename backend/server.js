const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const path = require('path');

const { runFullAnalysis, formatAsText } = require('./engine');
const { getDimensions } = require('./dimensions');

const app = express();
const PORT = process.env.PORT || 4242;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
// Serve frontend files from the project root (one level up)
app.use(express.static(path.join(__dirname, '..')));

// --- Multer: in-memory PDF upload (no disk write) ---
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ status: 'ok', engine: 'v2.1' }));

app.get('/api/dimensions', (req, res) => {
    try {
        const rawDims = getDimensions();
        if (!rawDims || !Array.isArray(rawDims)) {
            console.error('[MIE] getDimensions() returned invalid data:', rawDims);
            return res.status(500).json({ success: false, error: 'Invalid dimension data' });
        }

        const dims = rawDims.filter(d => {
            if (!d) console.warn('[MIE] Found null dimension entry');
            return d;
        }).map(d => {
            const rubric = Array.isArray(d.rubric) ? d.rubric : [];
            return {
                id: d?.id || 'N/A',
                title: d?.title || d?.theme || 'Unknown',
                question: d?.question || 'N/A',
                rubric: rubric.map(r => {
                    if (!r) console.warn(`[MIE] Null rubric entry in ${d.question}`);
                    return { 
                        level: r?.l || 0, 
                        label: r?.t || 'N/A', 
                        criteria: r?.d || 'N/A' 
                    };
                })
            };
        });
        res.json({ success: true, dimensions: dims });
    } catch (err) {
        console.error('[MIE_DIM_ERR]', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/analyse
 * REFACTOR: Improved PDF Parser for higher fidelity
 */
app.post('/api/analyse', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No PDF file uploaded.' });
        }

        let dimIds = null;
        if (req.body.dimensions) {
            dimIds = req.body.dimensions.split(',').map(d => parseInt(d.trim())).filter(Boolean);
        }

        console.log(`[MIE] Incoming Analysis: ${req.file.originalname} (${Math.round(req.file.size / 1024)}KB)`);

        // --- Improved Pagerender: Ensures sequential capture and robustness ---
        const pageTexts = [];
        const render_page = async (pageData) => {
            try {
                const textContent = await pageData.getTextContent();
                let lastY, text = '';
                for (let item of textContent.items) {
                    if (lastY == item.transform[5] || !lastY) {
                        text += item.str;
                    } else {
                        text += '\n' + item.str;
                    }
                    lastY = item.transform[5];
                }
                const pageResult = text.trim();
                // We store with page index to ensure sortability if needed, 
                // though pdf-parse calls this sequentially when using await.
                pageTexts.push(pageResult);
                return pageResult;
            } catch (err) {
                console.warn(`[MIE] Page render failed: ${err.message}`);
                return "";
            }
        };

        const options = { 
            pagerender: render_page,
            max: 0 // process all pages
        };

        const pdfData = await pdfParse(req.file.buffer, options);
        
        // Reconstruct pages with correct indexing
        const pages = pageTexts.map((text, i) => ({
            page: i + 1,
            text: text
        })).filter(p => p.text && p.text.length > 5);

        console.log(`[MIE] Extraction Stage 1 (Sequential): ${pages.length} pages.`);
        
        if (pages.length === 0) {
            console.log("[MIE] Sequential extraction empty, attempting legacy fallback...");
            const raw = pdfData.text || "";
            const fallbackPages = raw.split(/\f/).map((txt, i) => ({
                page: i + 1,
                text: txt.trim()
            })).filter(p => p.text.length > 5);
            
            if (fallbackPages.length === 0) {
                throw new Error("CRITICAL: No readable text content found in PDF. Check if document is scanned/image-only.");
            }
            pages.push(...fallbackPages);
        }

        console.log(`[MIE] Ready for analysis: ${pages.length} total pages.`);

        // --- Analysis Execution ---
        const results = runFullAnalysis(pages, dimIds);

        res.json({
            success: true,
            meta: {
                filename: req.file.originalname,
                totalPages: pages.length,
                totalChars: pdfData.text ? pdfData.text.length : 0,
                evalCount: results.length,
                timestamp: new Date().toISOString()
            },
            results
        });

    } catch (err) {
        console.error('[MIE_BACKEND_ERR]', err);
        res.status(500).json({ 
            success: false, 
            error: `Analysis Engine Error: ${err.message}`,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`[MIE_SERVER] v2.5 (Industrial Mode) ACTIVE`);
    console.log(`[STATUS] Listening on http://localhost:${PORT}`);
    console.log(`[ACCESS] Open http://localhost:${PORT} in browser`);
    console.log(`=================================================\n`);
});
