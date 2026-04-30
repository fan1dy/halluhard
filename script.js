// Leaderboard data structure
let leaderboardData = {};

// Models with publicly released weights
const OPEN_WEIGHT_MODELS = new Set([
    'deepseek-chat',
    'deepseek-reasoner',
    'deepseek-v4-pro',
    'glm-4-7-thinking',
    'glm-5-thinking',
    'glm-5-thinking-websearch',
    'kimi-k2-thinking',
    'kimi-k2.5-thinking',
    'kimi-k2.6-thinking',
    'kimi-k2.5-websearch',
]);

// Current sort state
let currentSort = { by: 'rate', order: 'asc' };

// Initialize the leaderboard (only on index page)
async function init() {
    if (!document.getElementById('domain-select') || !document.getElementById('leaderboard-body')) {
        return;
    }
    try {
        // Prevent scroll restoration on navigation
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        // Prevent navigation when clicking active nav link and scroll to top on navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.classList.contains('active')) {
                    e.preventDefault();
                    return false;
                } else {
                    // Scroll to top smoothly when navigating to a different page
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
        
        // Load data from the data file
        if (typeof LEADERBOARD_DATA !== 'undefined') {
            leaderboardData = LEADERBOARD_DATA;
        } else {
            // Fallback: try to load from JSON files
            await loadDataFromFiles();
        }
        
        // Set up event listeners
        document.getElementById('domain-select').addEventListener('change', updateLeaderboard);
        document.getElementById('turn-select').addEventListener('change', updateLeaderboard);
        
        // Set up sortable column headers
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', function() {
                const sortBy = this.dataset.sort;
                handleSort(sortBy);
            });
        });
        
        // Set up sortable domain breakdown headers
        document.querySelectorAll('.domain-sortable').forEach(span => {
            span.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event bubbling
                const sortBy = this.dataset.sort;
                handleSort(sortBy);
            });
        });
        
        // Initial render
        updateLeaderboard();
    } catch (error) {
        console.error('Error initializing leaderboard:', error);
        document.getElementById('leaderboard-body').innerHTML = 
            '<tr><td colspan="5" class="loading">Error loading data. Please check the data files.</td></tr>';
    }
}

// Handle column header sorting
function handleSort(sortBy) {
    // If clicking the same column, toggle order
    if (currentSort.by === sortBy) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.by = sortBy;
        // Default order: rate ascending (lower is better), name ascending
        currentSort.order = 'asc';
    }
    
    // Update main header icons
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('active-sort');
        th.querySelector('.sort-icon').textContent = '↕';
    });
    
    // Update domain breakdown header icons
    document.querySelectorAll('.domain-sortable').forEach(span => {
        span.classList.remove('active-sort');
        span.querySelector('.sort-icon').textContent = '↕';
    });
    
    // Set active state on the correct header
    const activeHeader = document.querySelector(`.sortable[data-sort="${sortBy}"]`);
    if (activeHeader) {
        activeHeader.classList.add('active-sort');
        activeHeader.querySelector('.sort-icon').textContent = currentSort.order === 'asc' ? '↑' : '↓';
    }
    
    const activeDomainHeader = document.querySelector(`.domain-sortable[data-sort="${sortBy}"]`);
    if (activeDomainHeader) {
        activeDomainHeader.classList.add('active-sort');
        activeDomainHeader.querySelector('.sort-icon').textContent = currentSort.order === 'asc' ? '↑' : '↓';
    }
    
    updateLeaderboard();
}


// Load data from individual JSON files (fallback)
async function loadDataFromFiles() {
    const domains = ['legal_cases', 'research_questions', 'medical_guidelines', 'coding'];
    
    for (const domain of domains) {
        try {
            const response = await fetch(`data/${domain}_turn_wise_rates.json`);
            if (response.ok) {
                const data = await response.json();
                leaderboardData[domain] = data;
            }
        } catch (error) {
            console.warn(`Could not load ${domain} data:`, error);
        }
    }
}

// Calculate average across all domains with domain breakdown
// Uses overall rates from reports when available, falls back to averaging turn rates
function calculateAverageRates(selectedTurn) {
    const models = new Set();
    const domainData = {};
    
    // Collect all models and their rates
    Object.keys(leaderboardData).forEach(domain => {
        if (domain === 'all') return;
        domainData[domain] = leaderboardData[domain];
        Object.keys(leaderboardData[domain]).forEach(model => models.add(model));
    });
    
    const averages = {};
    const domainBreakdown = {};
    
    models.forEach(model => {
        const rates = [];
        const domainRates = {};
        
        Object.keys(domainData).forEach(domain => {
            if (domainData[domain][model]) {
                let rate;
                
                // First, try to use overall rate from reports if available
                // Skip if rate is 0.0% and we have turn data (likely a report issue)
                if (typeof OVERALL_RATES !== 'undefined' && 
                    OVERALL_RATES[domain] && 
                    OVERALL_RATES[domain][model] !== undefined &&
                    !(OVERALL_RATES[domain][model] === 0.0 && domainData[domain][model] && Object.keys(domainData[domain][model]).length > 0)) {
                    // Use overall rate from report (for 'avg' turn selection)
                    if (selectedTurn === 'avg') {
                        rate = OVERALL_RATES[domain][model];
                    } else {
                        // For specific turns, still use turn-wise data
                        rate = domainData[domain][model][selectedTurn];
                    }
                } else {
                    // Fallback: calculate from turn rates
                    if (selectedTurn === 'avg') {
                        // Calculate average across all available turns
                        const turnRates = Object.values(domainData[domain][model]).map(Number);
                        if (turnRates.length > 0) {
                            rate = turnRates.reduce((a, b) => a + b, 0) / turnRates.length;
                        }
                    } else {
                        rate = domainData[domain][model][selectedTurn];
                    }
                }
                
                if (rate !== undefined && rate !== null) {
                    rates.push(Number(rate));
                    domainRates[domain] = Number(rate);
                }
            }
        });
        
        if (rates.length > 0) {
            averages[model] = rates.reduce((a, b) => a + b, 0) / rates.length;
            domainBreakdown[model] = domainRates;
        }
    });
    
    return { averages, domainBreakdown };
}

// Get rates for a specific domain and turn
// Uses overall rates from reports when available for 'avg' turn
function getRatesForDomain(domain, turn) {
    if (!leaderboardData[domain]) return {};
    
    const rates = {};
    Object.keys(leaderboardData[domain]).forEach(model => {
        if (turn === 'avg') {
            // Try to use overall rate from report first
            // Skip if rate is 0.0% and we have turn data (likely a report issue)
            if (typeof OVERALL_RATES !== 'undefined' && 
                OVERALL_RATES[domain] && 
                OVERALL_RATES[domain][model] !== undefined &&
                !(OVERALL_RATES[domain][model] === 0.0 && leaderboardData[domain][model] && Object.keys(leaderboardData[domain][model]).length > 0)) {
                rates[model] = OVERALL_RATES[domain][model];
            } else {
                // Fallback: average turn rates
                const turnRates = Object.values(leaderboardData[domain][model]).map(Number);
                if (turnRates.length > 0) {
                    rates[model] = turnRates.reduce((a, b) => a + b, 0) / turnRates.length;
                }
            }
        } else {
            const rate = leaderboardData[domain][model][turn];
            if (rate !== undefined) {
                rates[model] = Number(rate);
            }
        }
    });
    
    return rates;
}

// Get turn progression data for a model
function getTurnProgression(domain, model) {
    if (!leaderboardData[domain] || !leaderboardData[domain][model]) return null;
    return leaderboardData[domain][model];
}

// Update the leaderboard display
function updateLeaderboard() {
    const domain = document.getElementById('domain-select').value;
    const turn = document.getElementById('turn-select').value;
    
    let rates, domainBreakdown = {};
    
    if (domain === 'all') {
        const result = calculateAverageRates(turn);
        rates = result.averages;
        domainBreakdown = result.domainBreakdown;
    } else {
        rates = getRatesForDomain(domain, turn);
    }
    
    // Convert to array and sort
    const entries = Object.entries(rates).map(([model, rate]) => ({
        model,
        rate,
        domainBreakdown: domain === 'all' ? domainBreakdown[model] : null,
        turnProgression: domain !== 'all' ? getTurnProgression(domain, model) : null
    }));
    
    // Sort based on current sort state
    if (currentSort.by === 'rate' || currentSort.by === 'rank') {
        // Rank is based on rate (lower rate = better rank)
        entries.sort((a, b) => {
            const diff = a.rate - b.rate;
            return currentSort.order === 'asc' ? diff : -diff;
        });
    } else if (currentSort.by === 'name') {
        entries.sort((a, b) => {
            const diff = a.model.localeCompare(b.model);
            return currentSort.order === 'asc' ? diff : -diff;
        });
    } else if (['legal_cases', 'research_questions', 'medical_guidelines', 'coding'].includes(currentSort.by)) {
        // Sort by specific domain rate
        entries.sort((a, b) => {
            const aRate = a.domainBreakdown ? (a.domainBreakdown[currentSort.by] ?? Infinity) : Infinity;
            const bRate = b.domainBreakdown ? (b.domainBreakdown[currentSort.by] ?? Infinity) : Infinity;
            const diff = aRate - bRate;
            return currentSort.order === 'asc' ? diff : -diff;
        });
    }
    
    // Render both views
    renderLeaderboard(entries, domain, turn);
    
    // For bar chart, always show sorted by rate (lowest first)
    const chartEntries = [...entries].sort((a, b) => a.rate - b.rate);
    renderBarChart(chartEntries);
}


// Color interpolation function for table bars (same as chart)
function getBarColor(rate, minRate, maxRate) {
    // Normalize rate to 0-1 range based on min/max in data
    const t = (rate - minRate) / (maxRate - minRate || 1);
    
    // Start color (low/good): muted teal #7a9a8b -> RGB(122, 154, 139)
    // End color (high/bad): muted red #c47a7a -> RGB(196, 122, 122)
    const r = Math.round(122 + t * (196 - 122));
    const g = Math.round(154 + t * (122 - 154));
    const b = Math.round(139 + t * (122 - 139));
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Render the leaderboard table
function renderLeaderboard(entries, domain, turn) {
    const tbody = document.getElementById('leaderboard-body');
    const domainHeader = document.getElementById('domain-breakdown-header');
    
    // Show/hide domain breakdown column
    if (domain === 'all') {
        domainHeader.style.display = '';
    } else {
        domainHeader.style.display = 'none';
    }
    
    if (entries.length === 0) {
        const colspan = domain === 'all' ? 5 : 4;
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="loading">No data available for this selection.</td></tr>`;
        return;
    }
    
    const maxRate = Math.max(...entries.map(e => e.rate));
    const minRate = Math.min(...entries.map(e => e.rate));
    
    tbody.innerHTML = entries.map((entry, index) => {
        const rank = index + 1;
        const rankDisplay = rank <= 3
            ? `<span class="rank-medal">${rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>`
            : String(rank);
        const barWidth = (entry.rate / maxRate) * 100;
        const barColor = getBarColor(entry.rate, minRate, maxRate);
        
        // Medal for top 3
        let medal = '';
        if (rank === 1) medal = '🥇';
        else if (rank === 2) medal = '🥈';
        else if (rank === 3) medal = '🥉';
        
        // Domain breakdown HTML
        let domainBreakdownHtml = '';
        if (domain === 'all' && entry.domainBreakdown) {
            const domains = ['legal_cases', 'research_questions', 'medical_guidelines', 'coding'];
            const domainLabels = ['Legal', 'Research', 'Medical', 'Coding'];
            domainBreakdownHtml = `
                <div class="domain-breakdown">
                    ${domains.map((dom, i) => {
                        const rate = entry.domainBreakdown[dom];
                        if (rate !== undefined) {
                            return `<div class="domain-rate" title="${domainLabels[i]}: ${rate.toFixed(1)}">${rate.toFixed(1)}</div>`;
                        }
                        return `<div class="domain-rate" style="opacity: 0.3;">-</div>`;
                    }).join('')}
                </div>
            `;
        }
        
        return `
            <tr>
                <td class="rank-col">${rankDisplay}</td>
                <td class="model-col">${formatModelName(entry.model)}</td>
                <td class="rate-col">
                    <span class="rate-value">${entry.rate.toFixed(1)}</span>
                    <div class="rate-bar">
                        <div class="rate-bar-fill" style="width: ${barWidth}%; background: ${barColor};"></div>
                    </div>
                </td>
                ${domain === 'all' ? `<td class="domain-breakdown-col">${domainBreakdownHtml}</td>` : ''}
            </tr>
        `;
    }).join('');
}

// Get badge based on rate
function getBadge(rate) {
    if (rate < 20) {
        return { class: 'excellent', label: 'Excellent' };
    } else if (rate < 40) {
        return { class: 'good', label: 'Good' };
    } else if (rate < 60) {
        return { class: 'fair', label: 'Fair' };
    } else {
        return { class: 'poor', label: 'Poor' };
    }
}

// Format model name for display
function formatModelName(name) {
    const nameMap = {
        'gpt-5-nano': 'GPT-5-nano',
        'gpt-5-mini': 'GPT-5-mini',
        'gpt-5': 'GPT-5',
        'gpt-5-thinking': 'GPT-5-thinking',
        'gpt-5.2': 'GPT-5.2',
        'gpt-5.2-medium-websearch': 'GPT-5.2-thinking-Web-Search',
        'gpt-5.2-thinking': 'GPT-5.2-thinking',
        'glm-4-7-thinking': 'GLM-4.7-Thinking',
        'glm-5-thinking': 'GLM-5-Thinking',
        'claude-haiku-4-5': 'Claude-Haiku-4.5',
        'claude-sonnet-4-5': 'Claude-Sonnet-4.5',
        'claude-opus-4-5': 'Claude-Opus-4.5',
        'claude-opus-4-5-websearch': 'Claude-Opus-4.5-Web-Search',
        'claude-opus-4-6': 'Claude-Opus-4.6',
        'claude-sonnet-4-6': 'Claude-Sonnet-4.6',
        'gemini-3-flash': 'Gemini-3-Flash',
        'gemini-3-pro': 'Gemini-3-Pro',
        'gemini-3.1-pro': 'Gemini-3.1-Pro',
        'gpt-5.3': 'GPT-5.3',
        'gpt-5.3-websearch': 'GPT-5.3-Web-Search',
        'gpt-5.4-thinking': 'GPT-5.4-Thinking',
        'gpt-5.4-thinking-websearch': 'GPT-5.4-Thinking-Web-Search',
        'deepseek-chat': 'DeepSeek-Chat',
        'deepseek-reasoner': 'DeepSeek-Reasoner',
        'kimi-k2-thinking': 'Kimi-K2-thinking',
        'kimi-k2.5-thinking': 'Kimi-K2.5-thinking',
        'kimi-k2.6-thinking': 'Kimi-K2.6-thinking',
        'grok-4.1-thinking-fast': 'Grok-4.1-thinking-fast',
        'grok-4-thinking': 'Grok-4-thinking',
        'glm-5-thinking-websearch': 'GLM-5-Thinking-Web-Search',
        'kimi-k2.5-websearch': 'Kimi-K2.5-Web-Search',
        'claude-opus-4-7': 'Claude-Opus-4.7',
        'gpt-5.5-medium': 'GPT-5.5-thinking',
        'deepseek-v4-pro': 'DeepSeek-V4-Pro'
    };
    
    // Return mapped name if exists, otherwise return original with basic formatting
    if (nameMap[name]) {
        return nameMap[name];
    }
    
    // Fallback: basic title case conversion
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Long-press popup for model name on mobile
let chartModelPopupEl = null;
let chartModelPopupHideTimer = null;
let barLongPressTimer = null;

function getChartModelPopup() {
    if (!chartModelPopupEl) {
        chartModelPopupEl = document.createElement('div');
        chartModelPopupEl.className = 'chart-model-popup';
        chartModelPopupEl.setAttribute('aria-live', 'polite');
        chartModelPopupEl.style.display = 'none';
        document.body.appendChild(chartModelPopupEl);
        document.addEventListener('touchstart', onDocumentTouchForPopup, { passive: true });
    }
    return chartModelPopupEl;
}

function showChartModelPopup(modelName, clientX, clientY) {
    const popup = getChartModelPopup();
    popup.textContent = formatModelName(modelName);
    popup.style.left = clientX + 'px';
    popup.style.top = (clientY - 12) + 'px';
    popup.style.display = 'block';
    if (chartModelPopupHideTimer) clearTimeout(chartModelPopupHideTimer);
    chartModelPopupHideTimer = setTimeout(hideChartModelPopup, 2500);
}

function hideChartModelPopup() {
    if (chartModelPopupEl) chartModelPopupEl.style.display = 'none';
    if (chartModelPopupHideTimer) {
        clearTimeout(chartModelPopupHideTimer);
        chartModelPopupHideTimer = null;
    }
}

function onDocumentTouchForPopup(e) {
    if (chartModelPopupEl && chartModelPopupEl.style.display === 'block' && !e.target.closest('.bar-group')) {
        hideChartModelPopup();
    }
}

function setupBarLongPress(barGroup, modelName) {
    barGroup.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        barLongPressTimer = setTimeout(function () {
            barLongPressTimer = null;
            showChartModelPopup(modelName, touch.clientX, touch.clientY);
        }, 500);
    }, { passive: true });
    barGroup.addEventListener('touchend', function () {
        if (barLongPressTimer) {
            clearTimeout(barLongPressTimer);
            barLongPressTimer = null;
        }
    });
    barGroup.addEventListener('touchmove', function () {
        if (barLongPressTimer) {
            clearTimeout(barLongPressTimer);
            barLongPressTimer = null;
        }
    });
    barGroup.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
}

// Render bar chart (optional chartId for domain pages; default 'bar-chart')
function renderBarChart(entries = null, chartId = 'bar-chart') {
    if (!entries) {
        const domainSelect = document.getElementById('domain-select');
        const turnSelect = document.getElementById('turn-select');
        if (!domainSelect || !turnSelect) return;
        const domain = domainSelect.value;
        const turn = turnSelect.value;
        let rates, domainBreakdown = {};

        if (domain === 'all') {
            const result = calculateAverageRates(turn);
            rates = result.averages;
            domainBreakdown = result.domainBreakdown;
        } else {
            rates = getRatesForDomain(domain, turn);
        }

        entries = Object.entries(rates).map(([model, rate]) => ({
            model,
            rate,
            domainBreakdown: domain === 'all' ? domainBreakdown[model] : null
        }));

        entries.sort((a, b) => a.rate - b.rate);
    }

    // Top 25 only (lowest hallucination rate = best)
    entries = entries.slice(0, 25);

    const svg = document.getElementById(chartId);
    if (!svg) return;
    svg.innerHTML = '';

    if (entries.length === 0) {
        svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" class="chart-title">No data available</text>';
        return;
    }

    const isMobile = window.innerWidth <= 768;
    const margin = isMobile
        ? { top: 40, right: 16, bottom: 180, left: 40 }
        : { top: 50, right: 24, bottom: 225, left: 50 };

    const maxRate = Math.max(...entries.map(e => e.rate));
    const minRate = Math.min(...entries.map(e => e.rate));

    const totalBars = entries.length;
    const contentHeight = isMobile ? 240 : 320;

    // Compute bar dimensions to fit all bars in the available container space.
    // chart-container has 2rem (32px) padding on each side.
    const svgParent = svg.parentElement;
    const parentClientWidth = (svgParent && svgParent.clientWidth > 10)
        ? svgParent.clientWidth
        : (isMobile ? 360 : 960);
    const containerPadding = isMobile ? 32 : 64; // 1rem or 2rem per side × 2
    const availableWidth = parentClientWidth - containerPadding - margin.left - margin.right;
    const slotWidth = Math.floor(availableWidth / totalBars);
    const barSpacing = Math.max(isMobile ? 3 : 5, Math.round(slotWidth * 0.22));
    const barWidth = Math.min(slotWidth - barSpacing, isMobile ? 44 : 58);

    const contentWidth = totalBars * (barWidth + barSpacing) - barSpacing;
    const chartWidth = contentWidth + margin.left + margin.right;
    const chartHeight = contentHeight + margin.top + margin.bottom;

    svg.setAttribute('width', chartWidth);
    svg.setAttribute('height', chartHeight);
    svg.style.width = chartWidth + 'px';
    svg.style.height = chartHeight + 'px';

    // Stripe pattern for open-weight models
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', 'open-weight-stripes');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '6');
    pattern.setAttribute('height', '6');
    pattern.setAttribute('patternTransform', 'rotate(45)');
    const stripeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    stripeLine.setAttribute('x1', '0'); stripeLine.setAttribute('y1', '0');
    stripeLine.setAttribute('x2', '0'); stripeLine.setAttribute('y2', '6');
    stripeLine.setAttribute('stroke', 'rgba(255,255,255,0.45)');
    stripeLine.setAttribute('stroke-width', '3');
    pattern.appendChild(stripeLine);
    defs.appendChild(pattern);
    svg.appendChild(defs);

    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

    function interpolateColor(rate) {
        const t = (rate - minRate) / (maxRate - minRate || 1);
        // Muted teal (#7a9a8b) → muted red (#b87a7a)
        const r = Math.round(122 + t * (184 - 122));
        const g = Math.round(154 + t * (122 - 154));
        const b = Math.round(139 + t * (122 - 139));
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Y-axis gridlines and ticks
    const numTicks = 5;
    for (let i = 0; i <= numTicks; i++) {
        const tickValue = (maxRate / numTicks) * i;
        const tickY = contentHeight - (tickValue / maxRate) * contentHeight;

        const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gridLine.setAttribute('x1', 0);
        gridLine.setAttribute('y1', tickY);
        gridLine.setAttribute('x2', contentWidth);
        gridLine.setAttribute('y2', tickY);
        gridLine.setAttribute('stroke', '#e2e8f0');
        gridLine.setAttribute('stroke-width', i === 0 ? 2 : 1);
        chartGroup.appendChild(gridLine);

        const tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tickLabel.setAttribute('x', -8);
        tickLabel.setAttribute('y', tickY);
        tickLabel.setAttribute('text-anchor', 'end');
        tickLabel.setAttribute('dominant-baseline', 'middle');
        tickLabel.setAttribute('class', 'chart-axis');
        tickLabel.setAttribute('font-size', isMobile ? '9px' : '11px');
        tickLabel.setAttribute('fill', '#64748b');
        tickLabel.textContent = tickValue.toFixed(0) + '%';
        chartGroup.appendChild(tickLabel);
    }

    // Draw vertical bars
    entries.forEach((entry, index) => {
        const x = index * (barWidth + barSpacing);
        const barH = (entry.rate / maxRate) * contentHeight;
        const y = contentHeight - barH;
        const barColor = interpolateColor(entry.rate);
        const isOpen = OPEN_WEIGHT_MODELS.has(entry.model);
        const barMidX = x + barWidth / 2;

        const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        barGroup.setAttribute('class', 'bar-group');

        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('class', 'bar');
        bar.setAttribute('x', x);
        bar.setAttribute('y', y);
        bar.setAttribute('width', barWidth);
        bar.setAttribute('height', barH);
        bar.setAttribute('fill', barColor);
        bar.setAttribute('rx', 3);
        barGroup.appendChild(bar);

        if (isOpen) {
            const stripeOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            stripeOverlay.setAttribute('x', x);
            stripeOverlay.setAttribute('y', y);
            stripeOverlay.setAttribute('width', barWidth);
            stripeOverlay.setAttribute('height', barH);
            stripeOverlay.setAttribute('fill', 'url(#open-weight-stripes)');
            stripeOverlay.setAttribute('rx', 3);
            barGroup.appendChild(stripeOverlay);
        }

        // Rate label above bar — shrink font if bars are narrow
        const rateFontSize = barWidth < 24 ? '7px' : (isMobile ? '9px' : '11px');
        const rateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rateLabel.setAttribute('x', barMidX);
        rateLabel.setAttribute('y', y - (isMobile ? 3 : 5));
        rateLabel.setAttribute('text-anchor', 'middle');
        rateLabel.setAttribute('dominant-baseline', 'auto');
        rateLabel.setAttribute('fill', '#3a3936');
        rateLabel.setAttribute('font-size', rateFontSize);
        rateLabel.setAttribute('font-weight', '600');
        rateLabel.setAttribute('class', 'chart-axis');
        rateLabel.textContent = entry.rate.toFixed(1);
        barGroup.appendChild(rateLabel);

        // Model name label below x-axis (rotated)
        const nameFontSize = barWidth < 24 ? (isMobile ? '8px' : '11px') : (isMobile ? '10px' : '13px');
        const nameLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameLabel.setAttribute('x', 0);
        nameLabel.setAttribute('y', 0);
        nameLabel.setAttribute('transform', `translate(${barMidX}, ${contentHeight + (isMobile ? 8 : 10)}) rotate(-90)`);
        nameLabel.setAttribute('text-anchor', 'end');
        nameLabel.setAttribute('dominant-baseline', 'middle');
        nameLabel.setAttribute('class', 'chart-axis');
        nameLabel.setAttribute('fill', '#3a3936');
        nameLabel.setAttribute('font-size', nameFontSize);
        nameLabel.textContent = formatModelName(entry.model);
        barGroup.appendChild(nameLabel);

        chartGroup.appendChild(barGroup);
        if (isMobile) setupBarLongPress(barGroup, entry.model);
    });

    // Y-axis label
    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('x', 0);
    yAxisLabel.setAttribute('y', 0);
    yAxisLabel.setAttribute('transform', `translate(${-(margin.left - 12)}, ${contentHeight / 2}) rotate(-90)`);
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('class', 'chart-axis');
    yAxisLabel.setAttribute('font-size', isMobile ? '10px' : '13px');
    yAxisLabel.setAttribute('font-weight', '600');
    yAxisLabel.setAttribute('fill', '#64748b');
    yAxisLabel.textContent = 'Hallucination Rate (%)';
    chartGroup.appendChild(yAxisLabel);

    // Title
    const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleEl.setAttribute('x', contentWidth / 2);
    titleEl.setAttribute('y', isMobile ? -22 : -28);
    titleEl.setAttribute('text-anchor', 'middle');
    titleEl.setAttribute('class', 'chart-title');
    titleEl.setAttribute('font-size', isMobile ? '13px' : '17px');
    titleEl.setAttribute('font-weight', '700');
    titleEl.textContent = 'Top 25 Models — Hallucination Rate (Lower is Better)';
    chartGroup.appendChild(titleEl);

    // Legend
    const legendY = isMobile ? -14 : -12;
    const legendX = contentWidth / 2;
    const swatchSize = isMobile ? 10 : 12;
    const legendGap = isMobile ? 90 : 120;

    const legendItems = [
        { label: 'Proprietary', stripe: false },
        { label: 'Open-weight', stripe: true },
    ];
    const swatchColor = 'rgb(140, 160, 150)';
    legendItems.forEach((item, i) => {
        const lx = legendX - legendGap / 2 + i * legendGap;
        const sx = lx - swatchSize - (isMobile ? 4 : 5);
        const sy = legendY - swatchSize / 2;

        const swatchBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        swatchBg.setAttribute('x', sx); swatchBg.setAttribute('y', sy);
        swatchBg.setAttribute('width', swatchSize); swatchBg.setAttribute('height', swatchSize);
        swatchBg.setAttribute('fill', swatchColor); swatchBg.setAttribute('rx', 2);
        chartGroup.appendChild(swatchBg);

        if (item.stripe) {
            const swatchStripe = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            swatchStripe.setAttribute('x', sx); swatchStripe.setAttribute('y', sy);
            swatchStripe.setAttribute('width', swatchSize); swatchStripe.setAttribute('height', swatchSize);
            swatchStripe.setAttribute('fill', 'url(#open-weight-stripes)');
            swatchStripe.setAttribute('rx', 2);
            chartGroup.appendChild(swatchStripe);
        }

        const lLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lLabel.setAttribute('x', lx);
        lLabel.setAttribute('y', legendY);
        lLabel.setAttribute('text-anchor', 'start');
        lLabel.setAttribute('dominant-baseline', 'middle');
        lLabel.setAttribute('font-size', isMobile ? '9px' : '11px');
        lLabel.setAttribute('fill', '#64748b');
        lLabel.setAttribute('class', 'chart-axis');
        lLabel.textContent = item.label;
        chartGroup.appendChild(lLabel);
    });

    svg.appendChild(chartGroup);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

// Re-render chart on window resize for responsive behavior
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        if (document.getElementById('leaderboard-body')) updateLeaderboard();
    }, 250);
});