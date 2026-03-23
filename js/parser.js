/**
 * MIE Document Parser
 * Handles PDF and DOCX extraction using PDF.js and Mammoth.js
 */

export const parseDocument = async (file, onProgress = null) => {
    // Set PDF.js worker for browser compatibility
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
        return await parsePDF(file, onProgress);
    } else if (extension === 'docx' || extension === 'doc') {
        return await parseDOCX(file);
    } else {
        throw new Error('Unsupported file format. Please upload PDF or DOCX.');
    }
};

const parsePDF = async (file, onProgress) => {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF.js library not loaded. Check internet connection for CDN assets.');
    }
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const pages = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
        if (onProgress) onProgress(i, pdf.numPages);
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ').trim();
        
        // Ignore pages with < 30 characters
        if (text.length >= 30) {
            pages.push({ page: i, text: text });
        }
        
        // Cleanup memory for large documents
        page.cleanup();
    }
    
    if (pages.length === 0) {
        throw new Error('Scanned PDF not supported or no readable text found.');
    }
    
    return pages;
};

const parseDOCX = async (file) => {
    const data = await file.arrayBuffer();
    // Mammoth generates HTML, we'll convert it to basic page breaks
    const result = await mammoth.extractRawText({ arrayBuffer: data });
    const fullText = result.value;
    
    // DOCX doesn't have explicit pages like PDF. We'll split by ~3000 chars to simulate pages
    const PAGE_ESTIMATE = 3000;
    const pages = [];
    let currentPos = 0;
    let pageNum = 1;

    while (currentPos < fullText.length) {
        const textSnippet = fullText.substring(currentPos, currentPos + PAGE_ESTIMATE);
        if (textSnippet.trim().length >= 30) {
            pages.push({ page: pageNum, text: textSnippet.trim() });
        }
        currentPos += PAGE_ESTIMATE;
        pageNum++;
    }

    return pages;
};
