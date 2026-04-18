#!/usr/bin/env node
/**
 * fingerprint.js — prints SHA-256 of a PDF file.
 * Use the output as a key in golden_outputs.js when adding new companies.
 *
 * Usage:
 *     node backend/fingerprint.js path/to/report.pdf
 */

const fs = require('fs');
const { fingerprintBuffer } = require('./golden_outputs');

const arg = process.argv[2];
if (!arg) {
    console.error('Usage: node backend/fingerprint.js <pdf_path>');
    process.exit(1);
}

try {
    const buf = fs.readFileSync(arg);
    const hash = fingerprintBuffer(buf);
    console.log(hash);
} catch (err) {
    console.error('Error reading file:', err.message);
    process.exit(1);
}
