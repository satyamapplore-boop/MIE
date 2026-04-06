const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const path = require('path');

const { runFullAnalysis, getDimensions, formatAsText } = require('./engine');

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
    const dims = getDimensions().map(d => ({
        id: d.id,
        title: d.title,
        question: d.question,
        rubric: d.rubric.map(r => ({ level: r.l, label: r.t, criteria: r.d }))
    }));
    res.json({ success: true, dimensions: dims });
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

        // --- Custom Pagerender to capture text with page mapping ---
        let pageTexts = [];
        
        const render_page = (pageData) => {
            // Check if pageData has what we need
            return pageData.getTextContent()
            .then(function(textContent) {
                let lastY, text = '';
                for (let item of textContent.items) {
                    if (lastY == item.transform[5] || !lastY){
                        text += item.str;
                    } else {
                        text += '\n' + item.str;
                    }
                    lastY = item.transform[5];
                }
                pageTexts.push(text.trim());
                return text;
            });
        }

        const options = { pagerender: render_page };

        // Parse with custom rendering
        const pdfData = await pdfParse(req.file.buffer, options);
        
        // Final cleaning: pdf-parse invokes pagerender sequentially, 
        // but we filter empty or invalid page extracts
        const pages = pageTexts.map((text, i) => ({
            page: i + 1,
            text: text
        })).filter(p => p.text.length > 5);

        console.log(`[MIE] Parsing Success: Extracted ${pages.length} readable pages.`);
        
        if (pages.length === 0) {
            // Absolute fallback for simple PDFs where pagerender might fail
            console.log("[MIE] Pagerender empty, falling back to rawText analysis...");
            const raw = pdfData.text;
            const fallbackPages = raw.split(/\f/).map((txt, i) => ({
                page: i + 1,
                text: txt.trim()
            })).filter(p => p.text.length > 5);
            
            if (fallbackPages.length === 0) {
                throw new Error("No readable text content found in PDF. This may be a non-OCR scanned document.");
            }
            
            pages.push(...fallbackPages);
        }

        // --- Analysis Execution ---
        const results = runFullAnalysis(pages, dimIds);

        res.json({
            success: true,
            meta: {
                filename: req.file.originalname,
                totalPages: pages.length,
                totalChars: pdfData.text.length,
                evalCount: results.length
            },
            results
        });

    } catch (err) {
        console.error('[MIE_BACKEND_ERR]', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`[MIE_SERVER] v2.1 (Determinism Mode) Active on http://localhost:${PORT}`);
});
