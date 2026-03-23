/**
 * MIE UI Renderer
 * Manages dynamic dashboard generation and DOM updates.
 */

export const renderDimensionsList = (dimensions, container) => {
    container.innerHTML = dimensions.map(d => `
        <label class="dimension-item">
            <input type="checkbox" name="dimension" value="${d.id}" checked>
            <span>${d.title}</span>
        </label>
    `).join('');
};

export const updateProxyStatus = (isOnline) => {
    const dot = document.querySelector('#proxy-status .status-dot');
    const text = document.querySelector('#proxy-status .status-text');
    dot.className = `status-dot ${isOnline ? 'online' : 'offline'}`;
    text.textContent = isOnline ? 'Proxy Online' : 'Proxy Offline';
};

export const renderDashboard = (results) => {
    const scorecardGrid = document.getElementById('scorecard-grid');
    const detailsContainer = document.getElementById('dimensions-results');
    
    // Clear previous
    scorecardGrid.innerHTML = '';
    detailsContainer.innerHTML = '';

    results.forEach(res => {
        // Scorebox per dimension
        const colorClass = res.no_content_found ? 'lvl-na' : `lvl-${res.score}`;
        const scoreVal = res.no_content_found ? 'N/A' : res.score;
        const box = document.createElement('div');
        box.className = `score-box ${colorClass}`;
        box.innerHTML = `
            <div class="label">${res.question}</div>
            <div class="value">${scoreVal}</div>
        `;
        scorecardGrid.appendChild(box);

        // Detail Card
        const card = document.createElement('div');
        card.className = 'dimension-result-card glass';
        card.innerHTML = `
            <div class="card-header">
                <h4>${res.question}</h4>
                <span class="badge ${colorClass}">${res.score_label || 'Not Found'}</span>
            </div>
            <div class="tabs-nav">
                <button class="tab-btn active" data-tab="summary">Summary</button>
                <button class="tab-btn" data-tab="justification">Justification</button>
                <button class="tab-btn" data-tab="extracts">Extracted Chunks</button>
            </div>
            <div class="tab-content" id="tab-content-${res.question_id}">
                ${renderTab('summary', res)}
            </div>
        `;
        
        // Add tab event listeners
        card.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                card.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const contentArea = card.querySelector('.tab-content');
                contentArea.innerHTML = renderTab(btn.dataset.tab, res);
            });
        });

        detailsContainer.appendChild(card);
    });
};

const renderTab = (tabName, data) => {
    switch (tabName) {
        case 'summary':
            return `<p class="summary-text">${data.summary || 'No summary available.'}</p>`;
        case 'justification':
            return `
                <div class="justification-list">
                    <div class="just-item"><strong>Score Context:</strong> ${data.justification?.why_this_score || 'N/A'}</div>
                    <div class="just-item"><strong>Comparison (Lower):</strong> ${data.justification?.why_not_lower || 'N/A'}</div>
                    <div class="just-item"><strong>Comparison (Higher):</strong> ${data.justification?.why_not_higher || 'N/A'}</div>
                </div>
            `;
        case 'extracts':
            if (!data.relevant_chunks || data.relevant_chunks.length === 0) return '<p>No extracts found.</p>';
            return `
                <table class="extracts-table">
                    <thead><tr><th>Page</th><th>Text Quote</th><th>Relevance</th></tr></thead>
                    <tbody>
                        ${data.relevant_chunks.map(c => `
                            <tr>
                                <td style="color: var(--primary-color)">[${c.page_range}]</td>
                                <td style="font-size: 13px; font-style: italic;">"${c.verbatim_text}"</td>
                                <td><span class="badge ${c.relevance === 'high' ? 'lvl-4' : 'lvl-na'}">${c.relevance}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
    }
};
