// Render coding language-specific hallucination rates
function initCodingLanguageRates() {
    try {
        if (typeof CODING_LANGUAGE_RATES === 'undefined') {
            document.getElementById('coding-language-chart-container').innerHTML = 
                '<div class="loading">Error loading coding language data.</div>';
            return;
        }

        const models = Object.keys(CODING_LANGUAGE_RATES).filter(model => !model.includes('websearch'));
        const languages = ['elixir', 'python', 'r', 'scala'];
        const languageLabels = { elixir: 'Elixir', python: 'Python', r: 'R', scala: 'Scala' };

        // Prepare data for grouped bar chart
        const modelStats = models.map(model => ({
            model,
            elixir: CODING_LANGUAGE_RATES[model].elixir || 0,
            python: CODING_LANGUAGE_RATES[model].python || 0,
            r: CODING_LANGUAGE_RATES[model].r || 0,
            scala: CODING_LANGUAGE_RATES[model].scala || 0,
            avg: (CODING_LANGUAGE_RATES[model].elixir + CODING_LANGUAGE_RATES[model].python + 
                  CODING_LANGUAGE_RATES[model].r + CODING_LANGUAGE_RATES[model].scala) / 4
        })).sort((a, b) => a.avg - b.avg);

        renderCodingLanguageChart(modelStats, languages, languageLabels);
    } catch (error) {
        console.error('Error initializing coding language rates:', error);
        document.getElementById('coding-language-chart-container').innerHTML = 
            '<div class="loading">Error loading data.</div>';
    }
}

function renderCodingLanguageChart(modelStats, languages, languageLabels) {
    const svg = document.getElementById('coding-language-chart');
    svg.innerHTML = '';

    if (modelStats.length === 0) {
        svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" class="chart-title">No data available</text>';
        return;
    }

    const margin = { top: 40, right: 40, bottom: 120, left: 80 };
    const width = svg.clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const maxRate = Math.max(...modelStats.flatMap(m => languages.map(lang => m[lang])));
    const barWidth = Math.max(12, (width / modelStats.length) * 0.2); // Width of each bar
    const spacing = width / modelStats.length;
    const groupSpacing = spacing * 0.02; // Reduced space between bars within a group

    const colors = {
        elixir: '#b89a8a',  // muted terracotta
        python: '#9a9b8a',  // muted green-gray
        r: '#8b9a9f',       // muted blue-gray
        scala: '#c4a88a'    // muted beige
    };

    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

    // Draw side-by-side vertical bars (rotated 90 degrees, model names on x-axis)
    modelStats.forEach((stat, modelIndex) => {
        const x = modelIndex * spacing + (spacing - barWidth * languages.length - groupSpacing * (languages.length - 1)) / 2;

        languages.forEach((lang, langIndex) => {
            const barX = x + langIndex * (barWidth + groupSpacing);
            const barHeight = (stat[lang] / maxRate) * height;

            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', barX);
            bar.setAttribute('y', height - barHeight);
            bar.setAttribute('width', barWidth);
            bar.setAttribute('height', barHeight);
            bar.setAttribute('fill', colors[lang]);
            bar.setAttribute('rx', 2);
            bar.setAttribute('class', 'language-bar');
            chartGroup.appendChild(bar);
        });

        // Model name label (on x-axis, rotated)
        const nameLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameLabel.setAttribute('x', x + (barWidth * languages.length + groupSpacing * (languages.length - 1)) / 2);
        nameLabel.setAttribute('y', height + 15);
        nameLabel.setAttribute('text-anchor', 'end');
        nameLabel.setAttribute('class', 'chart-axis');
        nameLabel.setAttribute('font-size', '11px');
        nameLabel.setAttribute('transform', `rotate(-45, ${x + (barWidth * languages.length + groupSpacing * (languages.length - 1)) / 2}, ${height + 15})`);
        nameLabel.textContent = formatModelName(stat.model);
        chartGroup.appendChild(nameLabel);
    });

    // X-axis (bottom line)
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', height);
    xAxis.setAttribute('x2', width);
    xAxis.setAttribute('y2', height);
    xAxis.setAttribute('stroke', '#e2e8f0');
    xAxis.setAttribute('stroke-width', 2);
    chartGroup.appendChild(xAxis);

    // Y-axis (left line)
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', 0);
    yAxis.setAttribute('y1', 0);
    yAxis.setAttribute('x2', 0);
    yAxis.setAttribute('y2', height);
    yAxis.setAttribute('stroke', '#e2e8f0');
    yAxis.setAttribute('stroke-width', 2);
    chartGroup.appendChild(yAxis);

    // Y-axis ticks and labels
    const numTicks = 5;
    for (let i = 0; i <= numTicks; i++) {
        const tickValue = (maxRate / numTicks) * i;
        const tickY = height - (i / numTicks) * height;

        // Tick line
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', 0);
        tick.setAttribute('y1', tickY);
        tick.setAttribute('x2', -5);
        tick.setAttribute('y2', tickY);
        tick.setAttribute('stroke', '#e2e8f0');
        tick.setAttribute('stroke-width', 2);
        chartGroup.appendChild(tick);

        // Tick label
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

    // Y-axis label
    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('x', -height / 2);
    yAxisLabel.setAttribute('y', -50);
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('class', 'chart-axis');
    yAxisLabel.setAttribute('font-size', '14px');
    yAxisLabel.setAttribute('font-weight', '600');
    yAxisLabel.setAttribute('transform', 'rotate(-90)');
    yAxisLabel.textContent = 'Hallucination Rate (%)';
    chartGroup.appendChild(yAxisLabel);

    // Title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', width / 2);
    title.setAttribute('y', -20);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('class', 'chart-title');
    title.setAttribute('font-size', '18px');
    title.setAttribute('font-weight', '700');
    title.textContent = 'Hallucination Rates by Programming Language';
    chartGroup.appendChild(title);

    // Legend
    const legendY = height + 100;
    const legendX = width / 2 - 150;
    const legendSpacing = 80;

    languages.forEach((lang, index) => {
        const x = legendX + index * legendSpacing;
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', legendY);
        rect.setAttribute('width', 20);
        rect.setAttribute('height', 15);
        rect.setAttribute('fill', colors[lang]);
        rect.setAttribute('rx', 2);
        chartGroup.appendChild(rect);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + 25);
        text.setAttribute('y', legendY + 12);
        text.setAttribute('class', 'chart-axis');
        text.setAttribute('font-size', '12px');
        text.textContent = languageLabels[lang];
        chartGroup.appendChild(text);
    });

    svg.appendChild(chartGroup);
}

function formatModelName(name) {
    const nameMap = {
        'gpt-5-nano': 'GPT-5-nano',
        'gpt-5-mini': 'GPT-5-mini',
        'gpt-5': 'GPT-5',
        'gpt-5-medium': 'GPT-5-thinking',
        'gpt-5.2': 'GPT-5.2',
        'gpt-5.2-medium-websearch': 'GPT-5.2-thinking-Web-Search',
        'claude-haiku-4-5': 'Claude-Haiku-4.5',
        'claude-sonnet-4-5': 'Claude-Sonnet-4.5',
        'claude-opus-4-5': 'Claude-Opus-4.5',
        'claude-opus-4-5-websearch': 'Claude-Opus-4.5-Web-Search',
        'gemini-3-flash': 'Gemini-3-Flash',
        'gemini-3-pro': 'Gemini-3-Pro',
        'deepseek-chat': 'DeepSeek-Chat',
        'deepseek-reasoner': 'DeepSeek-Reasoner',
        'kimi-k2-thinking': 'Kimi-K2-thinking'
    };
    
    if (nameMap[name]) {
        return nameMap[name];
    }
    
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
