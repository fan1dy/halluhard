let codingFunctionData = null;
let codingFunctionCategories = null;
let codingFunctionLabels = null;

function initCodingFunctionRates() {
    try {
        if (typeof CODING_FUNCTION_RATES === 'undefined') {
            document.getElementById('coding-function-chart-container').innerHTML =
                '<div class="loading">Error loading coding function data.</div>';
            return;
        }

        const models = Object.keys(CODING_FUNCTION_RATES);
        const categories = ['import', 'install', 'function'];
        const categoryLabels = { import: 'Import', install: 'Install', function: 'Function Call' };

        const modelStats = models.map(model => ({
            model,
            import: CODING_FUNCTION_RATES[model].import || 0,
            install: CODING_FUNCTION_RATES[model].install || 0,
            function: CODING_FUNCTION_RATES[model].function || 0,
            avg: (CODING_FUNCTION_RATES[model].import + CODING_FUNCTION_RATES[model].install +
                  CODING_FUNCTION_RATES[model].function) / 3
        })).sort((a, b) => a.avg - b.avg);

        codingFunctionData = modelStats;
        codingFunctionCategories = categories;
        codingFunctionLabels = categoryLabels;
        renderCodingFunctionChart(modelStats, categories, categoryLabels);

        let resizeTimeout;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                if (codingFunctionData) {
                    renderCodingFunctionChart(codingFunctionData, codingFunctionCategories, codingFunctionLabels);
                }
            }, 250);
        });
    } catch (error) {
        console.error('Error initializing coding function rates:', error);
        document.getElementById('coding-function-chart-container').innerHTML =
            '<div class="loading">Error loading data.</div>';
    }
}

function renderCodingFunctionChart(modelStats, categories, categoryLabels) {
    const svg = document.getElementById('coding-function-chart');
    svg.innerHTML = '';

    if (modelStats.length === 0) {
        svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" class="chart-title">No data available</text>';
        return;
    }

    const isMobile = window.innerWidth <= 768;
    const margin = isMobile
        ? { top: 50, right: 30, bottom: 130, left: 60 }
        : { top: 50, right: 40, bottom: 140, left: 80 };
    const chartHeight = isMobile ? 440 : 520;

    const containerWidth = svg.clientWidth;
    const minBarSpacing = isMobile ? 60 : 75;
    const minChartWidth = modelStats.length * minBarSpacing + margin.left + margin.right;
    const actualWidth = Math.max(containerWidth, minChartWidth);

    svg.setAttribute('width', actualWidth);

    const width = actualWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    svg.setAttribute('height', chartHeight);

    const maxRate = Math.max(...modelStats.flatMap(m => categories.map(cat => m[cat])));
    const barWidth = Math.max(12, (width / modelStats.length) * 0.22);
    const spacing = width / modelStats.length;
    const groupSpacing = spacing * 0.02;

    const colors = {
        import: '#8fa8c8',   // muted blue
        install: '#a8c4a8',  // muted green
        function: '#c8a88f'  // muted orange
    };

    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

    modelStats.forEach((stat, modelIndex) => {
        const x = modelIndex * spacing + (spacing - barWidth * categories.length - groupSpacing * (categories.length - 1)) / 2;

        categories.forEach((cat, catIndex) => {
            const barX = x + catIndex * (barWidth + groupSpacing);
            const barHeight = (stat[cat] / maxRate) * height;

            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', barX);
            bar.setAttribute('y', height - barHeight);
            bar.setAttribute('width', barWidth);
            bar.setAttribute('height', barHeight);
            bar.setAttribute('fill', colors[cat]);
            bar.setAttribute('rx', 2);
            bar.setAttribute('class', 'language-bar');
            chartGroup.appendChild(bar);
        });

        const nameLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameLabel.setAttribute('x', x + (barWidth * categories.length + groupSpacing * (categories.length - 1)) / 2);
        nameLabel.setAttribute('y', height + 15);
        nameLabel.setAttribute('text-anchor', 'end');
        nameLabel.setAttribute('class', 'chart-axis');
        nameLabel.setAttribute('font-size', isMobile ? '9px' : '11px');
        nameLabel.setAttribute('transform', `rotate(-45, ${x + (barWidth * categories.length + groupSpacing * (categories.length - 1)) / 2}, ${height + 15})`);
        nameLabel.textContent = formatFunctionModelName(stat.model);
        chartGroup.appendChild(nameLabel);
    });

    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', height);
    xAxis.setAttribute('x2', width);
    xAxis.setAttribute('y2', height);
    xAxis.setAttribute('stroke', '#e2e8f0');
    xAxis.setAttribute('stroke-width', 2);
    chartGroup.appendChild(xAxis);

    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', 0);
    yAxis.setAttribute('y1', 0);
    yAxis.setAttribute('x2', 0);
    yAxis.setAttribute('y2', height);
    yAxis.setAttribute('stroke', '#e2e8f0');
    yAxis.setAttribute('stroke-width', 2);
    chartGroup.appendChild(yAxis);

    const numTicks = 5;
    for (let i = 0; i <= numTicks; i++) {
        const tickValue = (maxRate / numTicks) * i;
        const tickY = height - (i / numTicks) * height;

        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', 0);
        tick.setAttribute('y1', tickY);
        tick.setAttribute('x2', -5);
        tick.setAttribute('y2', tickY);
        tick.setAttribute('stroke', '#e2e8f0');
        tick.setAttribute('stroke-width', 2);
        chartGroup.appendChild(tick);

        const tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tickLabel.setAttribute('x', -10);
        tickLabel.setAttribute('y', tickY);
        tickLabel.setAttribute('text-anchor', 'end');
        tickLabel.setAttribute('dominant-baseline', 'middle');
        tickLabel.setAttribute('class', 'chart-axis');
        tickLabel.setAttribute('font-size', '11px');
        tickLabel.textContent = `${tickValue.toFixed(0)}%`;
        chartGroup.appendChild(tickLabel);
    }

    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('x', -height / 2);
    yAxisLabel.setAttribute('y', -50);
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('class', 'chart-axis');
    yAxisLabel.setAttribute('font-size', isMobile ? '11px' : '14px');
    yAxisLabel.setAttribute('font-weight', '600');
    yAxisLabel.setAttribute('transform', 'rotate(-90)');
    yAxisLabel.textContent = 'Hallucination Rate (%)';
    chartGroup.appendChild(yAxisLabel);

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', width / 2);
    title.setAttribute('y', -20);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('class', 'chart-title');
    title.setAttribute('font-size', isMobile ? '14px' : '18px');
    title.setAttribute('font-weight', '700');
    title.textContent = 'Hallucination Rates by Error Category';
    chartGroup.appendChild(title);

    const legendY = height + (isMobile ? 110 : 120);
    const legendSpacing = isMobile ? 80 : 100;
    const legendTotalWidth = categories.length * legendSpacing;
    const legendX = Math.max(0, (width - legendTotalWidth) / 2);

    categories.forEach((cat, index) => {
        const x = legendX + index * legendSpacing;

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', legendY);
        rect.setAttribute('width', 16);
        rect.setAttribute('height', 12);
        rect.setAttribute('fill', colors[cat]);
        rect.setAttribute('rx', 2);
        chartGroup.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + 20);
        text.setAttribute('y', legendY + 10);
        text.setAttribute('class', 'chart-axis');
        text.setAttribute('font-size', isMobile ? '10px' : '12px');
        text.textContent = categoryLabels[cat];
        chartGroup.appendChild(text);
    });

    svg.appendChild(chartGroup);
}

function formatFunctionModelName(name) {
    const nameMap = {
        'gpt-5-nano': 'GPT-5-nano',
        'gpt-5-mini': 'GPT-5-mini',
        'gpt-5': 'GPT-5',
        'gpt-5-thinking': 'GPT-5-thinking',
        'gpt-5.2': 'GPT-5.2',
        'gpt-5.2-thinking': 'GPT-5.2-thinking',
        'gpt-5.2-medium-websearch': 'GPT-5.2-thinking-Web-Search',
        'claude-haiku-4-5': 'Claude-Haiku-4.5',
        'claude-sonnet-4-5': 'Claude-Sonnet-4.5',
        'claude-opus-4-5': 'Claude-Opus-4.5',
        'claude-opus-4-5-websearch': 'Claude-Opus-4.5-Web-Search',
        'gemini-3-flash': 'Gemini-3-Flash',
        'gemini-3-pro': 'Gemini-3-Pro',
        'gemini-3.1-pro': 'Gemini-3.1-Pro',
        'deepseek-chat': 'DeepSeek-Chat',
        'deepseek-reasoner': 'DeepSeek-Reasoner',
        'kimi-k2-thinking': 'Kimi-K2-thinking',
        'kimi-k2.5-thinking': 'Kimi-K2.5-thinking',
        'grok-4.1-thinking-fast': 'Grok-4.1-thinking-fast',
        'grok-4-thinking': 'Grok-4-thinking',
        'glm-4-7-thinking': 'GLM-4.7-Thinking',
        'glm-5-thinking': 'GLM-5-Thinking'
    };

    if (nameMap[name]) return nameMap[name];
    return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
