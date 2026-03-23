/**
 * MIE Section Builder
 * Groups pages into sections of ~2500 words for AI processing.
 */

export const buildSections = (pages) => {
    const TARGET_WORDS = 2500;
    const sections = [];
    
    let currentSection = {
        section_id: 1,
        page_range: '',
        text: '',
        wordCount: 0,
        startPage: 0
    };

    pages.forEach((page, index) => {
        const words = page.text.split(/\s+/);
        const pageWordCount = words.length;

        // If this is the start of a section
        if (currentSection.wordCount === 0) {
            currentSection.startPage = page.page;
        }

        currentSection.text += ` [PAGE ${page.page}]\n${page.text}\n`;
        currentSection.wordCount += pageWordCount;

        // Check if we should close this section
        const atTarget = currentSection.wordCount >= TARGET_WORDS;
        const isLastPage = index === pages.length - 1;

        if (atTarget || isLastPage) {
            currentSection.page_range = `${currentSection.startPage}-${page.page}`;
            sections.push({
                section_id: currentSection.section_id,
                page_range: currentSection.page_range,
                text: currentSection.text.trim()
            });

            // Start new section if not last page
            if (!isLastPage) {
                currentSection = {
                    section_id: currentSection.section_id + 1,
                    page_range: '',
                    text: '',
                    wordCount: 0,
                    startPage: 0
                };
            }
        }
    });

    return sections;
};
