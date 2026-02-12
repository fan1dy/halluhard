// Leaderboard data structure
let leaderboardData = {};

// Current sort state
let currentSort = { by: 'rate', order: 'asc' };

// Initialize the leaderboard
async function init() {
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
        const barWidth = (entry.rate / maxRate) * 100;
        const barColor = getBarColor(entry.rate, minRate, maxRate);
        
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
                            return `<div class="domain-rate" title="${domainLabels[i]}: ${rate.toFixed(1)}%">${rate.toFixed(1)}%</div>`;
                        }
                        return `<div class="domain-rate" style="opacity: 0.3;">-</div>`;
                    }).join('')}
                </div>
            `;
        }
        
        return `
            <tr>
                <td class="rank-col">${rank}</td>
                <td class="model-col">${formatModelName(entry.model)}</td>
                <td class="rate-col">
                    <span class="rate-value">${entry.rate.toFixed(1)}%</span>
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
        'gpt-5-medium': 'GPT-5-thinking',
        'gpt-5.2': 'GPT-5.2',
        'gpt-5.2-medium-websearch': 'GPT-5.2-thinking-Web-Search',
        'gpt-5.2-thinking': 'GPT-5.2-thinking',
        'glm-4-7-thinking': 'GLM-4.7-thinking',
        'claude-haiku-4-5': 'Claude-Haiku-4.5',
        'claude-sonnet-4-5': 'Claude-Sonnet-4.5',
        'claude-opus-4-5': 'Claude-Opus-4.5',
        'claude-opus-4-5-websearch': 'Claude-Opus-4.5-Web-Search',
        'gemini-3-flash': 'Gemini-3-Flash',
        'gemini-3-pro': 'Gemini-3-Pro',
        'deepseek-chat': 'DeepSeek-Chat',
        'deepseek-reasoner': 'DeepSeek-Reasoner',
        'kimi-k2-thinking': 'Kimi-K2-thinking',
        'kimi-k2.5-thinking': 'Kimi-K2.5-thinking',
        'grok-4.1-thinking-fast': 'Grok-4.1-thinking-fast'
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

// Render bar chart
function renderBarChart(entries = null) {
    if (!entries) {
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
        
        entries = Object.entries(rates).map(([model, rate]) => ({
            model,
            rate,
            domainBreakdown: domain === 'all' ? domainBreakdown[model] : null
        }));
        
        entries.sort((a, b) => a.rate - b.rate);
    }
    
    const svg = document.getElementById('bar-chart');
    svg.innerHTML = ''; // Clear previous chart
    
    if (entries.length === 0) {
        svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" class="chart-title">No data available</text>';
        return;
    }
    
    // Responsive margins (on mobile, long-press a bar to see full model name)
    const isMobile = window.innerWidth <= 768;
    const margin = isMobile 
        ? { top: 30, right: 20, bottom: 80, left: 100 }
        : { top: 40, right: 40, bottom: 100, left: 200 };
    
    const maxRate = Math.max(...entries.map(e => e.rate));
    const minRate = Math.min(...entries.map(e => e.rate));
    
    // Define fixed bar height and spacing to prevent overlapping
    const barHeight = isMobile ? 28 : 32;
    const barSpacing = isMobile ? 8 : 12;
    
    // Calculate required chart height based on number of entries
    const contentHeight = entries.length * (barHeight + barSpacing) - barSpacing;
    const chartHeight = contentHeight + margin.top + margin.bottom;
    
    // Update SVG height dynamically
    svg.setAttribute('height', chartHeight);
    
    const width = svg.clientWidth - margin.left - margin.right;
    const height = contentHeight;
    const spacing = barHeight + barSpacing;
    
    // Create group for chart content
    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Color interpolation function (from teal/green for low rates to muted red for high rates)
    function interpolateColor(rate) {
        // Normalize rate to 0-1 range based on min/max in data
        const t = (rate - minRate) / (maxRate - minRate || 1);
        
        // Start color (low/good): muted teal #7a9a8b -> RGB(122, 154, 139)
        // End color (high/bad): muted red #b87a7a -> RGB(184, 122, 122)
        const r = Math.round(122 + t * (184 - 122));
        const g = Math.round(154 + t * (122 - 154));
        const b = Math.round(139 + t * (122 - 139));
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Draw bars
    entries.forEach((entry, index) => {
        const y = index * spacing;
        const barWidth = (entry.rate / maxRate) * width;
        
        // Gradient color based on rate
        const barColor = interpolateColor(entry.rate);
        
        // Bar group
        const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        barGroup.setAttribute('class', 'bar-group');
        barGroup.setAttribute('transform', `translate(0, ${y})`);
        
        // Bar rectangle
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('class', 'bar');
        bar.setAttribute('x', 0);
        bar.setAttribute('y', 0);
        bar.setAttribute('width', barWidth);
        bar.setAttribute('height', barHeight);
        bar.setAttribute('fill', barColor);
        bar.setAttribute('rx', 4);
        
        // Model name label
        const nameLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameLabel.setAttribute('x', isMobile ? -5 : -10);
        nameLabel.setAttribute('y', barHeight / 2);
        nameLabel.setAttribute('text-anchor', 'end');
        nameLabel.setAttribute('dominant-baseline', 'middle');
        nameLabel.setAttribute('class', 'chart-axis');
        nameLabel.setAttribute('fill', '#3a3936');
        nameLabel.setAttribute('font-size', isMobile ? '12px' : '15px');
        nameLabel.textContent = formatModelName(entry.model);
        
        // Rate value label on bar
        const minBarWidthForLabel = isMobile ? 50 : 60;
        if (barWidth > minBarWidthForLabel) {
            const rateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            rateLabel.setAttribute('x', barWidth / 2);
            rateLabel.setAttribute('y', barHeight / 2);
            rateLabel.setAttribute('text-anchor', 'middle');
            rateLabel.setAttribute('dominant-baseline', 'middle');
            rateLabel.setAttribute('fill', 'white');
            rateLabel.setAttribute('font-size', isMobile ? '9px' : '11px');
            rateLabel.setAttribute('font-weight', '600');
            rateLabel.textContent = `${entry.rate.toFixed(1)}%`;
            barGroup.appendChild(rateLabel);
        } else {
            // If bar is too narrow, put label outside
            const rateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            rateLabel.setAttribute('x', barWidth + (isMobile ? 5 : 10));
            rateLabel.setAttribute('y', barHeight / 2);
            rateLabel.setAttribute('text-anchor', 'start');
            rateLabel.setAttribute('dominant-baseline', 'middle');
            rateLabel.setAttribute('class', 'chart-axis');
            rateLabel.setAttribute('font-size', isMobile ? '9px' : '11px');
            rateLabel.setAttribute('font-weight', '600');
            rateLabel.textContent = `${entry.rate.toFixed(1)}%`;
            barGroup.appendChild(rateLabel);
        }
        
        barGroup.appendChild(bar);
        barGroup.appendChild(nameLabel);
        chartGroup.appendChild(barGroup);
        if (isMobile) {
            setupBarLongPress(barGroup, entry.model);
        }
    });
    
    // X-axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', height);
    xAxis.setAttribute('x2', width);
    xAxis.setAttribute('y2', height);
    xAxis.setAttribute('stroke', '#e2e8f0');
    xAxis.setAttribute('stroke-width', 2);
    chartGroup.appendChild(xAxis);
    
    // X-axis ticks with numbers
    const numTicks = 6; // Number of ticks to show
    for (let i = 0; i <= numTicks; i++) {
        const tickValue = (maxRate / numTicks) * i;
        const tickX = (tickValue / maxRate) * width;
        
        // Tick mark line
        const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tickLine.setAttribute('x1', tickX);
        tickLine.setAttribute('y1', height);
        tickLine.setAttribute('x2', tickX);
        tickLine.setAttribute('y2', height + 6);
        tickLine.setAttribute('stroke', '#e2e8f0');
        tickLine.setAttribute('stroke-width', 1.5);
        chartGroup.appendChild(tickLine);
        
        // Tick label (number)
        const tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tickLabel.setAttribute('x', tickX);
        tickLabel.setAttribute('y', height + (isMobile ? 18 : 22));
        tickLabel.setAttribute('text-anchor', 'middle');
        tickLabel.setAttribute('class', 'chart-axis');
        tickLabel.setAttribute('font-size', isMobile ? '9px' : '11px');
        tickLabel.setAttribute('fill', '#64748b');
        tickLabel.textContent = tickValue.toFixed(1);
        chartGroup.appendChild(tickLabel);
    }
    
    // X-axis label
    const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xAxisLabel.setAttribute('x', width / 2);
    xAxisLabel.setAttribute('y', height + (isMobile ? 40 : 50));
    xAxisLabel.setAttribute('text-anchor', 'middle');
    xAxisLabel.setAttribute('class', 'chart-axis');
    xAxisLabel.setAttribute('font-size', isMobile ? '11px' : '14px');
    xAxisLabel.setAttribute('font-weight', '600');
    xAxisLabel.textContent = 'Hallucination Rate (%)';
    chartGroup.appendChild(xAxisLabel);
    
    // Title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', width / 2);
    title.setAttribute('y', isMobile ? -15 : -20);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('class', 'chart-title');
    title.setAttribute('font-size', isMobile ? '14px' : '18px');
    title.setAttribute('font-weight', '700');
    title.textContent = 'Hallucination Rate by Model';
    chartGroup.appendChild(title);
    
    svg.appendChild(chartGroup);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

// Re-render chart on window resize for responsive behavior
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        updateLeaderboard();
    }, 250);
});