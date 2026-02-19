// Store data for resize handling
let groundingFailuresData = null;

// Render reference vs content grounding failures chart
function initGroundingFailures(domain) {
    try {
        if (typeof GROUNDING_FAILURES === 'undefined' || !GROUNDING_FAILURES[domain]) {
            document.getElementById('grounding-failures-chart-container').innerHTML = 
                '<div class="loading">Error loading grounding failure data.</div>';
            return;
        }

        const domainData = GROUNDING_FAILURES[domain];
        const models = Object.keys(domainData).filter(model => !model.includes('websearch'));
        
        // Sort models by total failure rate (reference + content)
        const modelStats = models.map(model => ({
            model,
            reference: domainData[model].reference_failure,
            content: domainData[model].content_failure,
            total: domainData[model].reference_failure + domainData[model].content_failure
        })).sort((a, b) => a.total - b.total);

        groundingFailuresData = modelStats;
        renderGroundingFailuresChart(modelStats);

        // Add resize handler
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                if (groundingFailuresData) {
                    renderGroundingFailuresChart(groundingFailuresData);
                }
            }, 250);
        });
    } catch (error) {
        console.error('Error initializing grounding failures:', error);
        document.getElementById('grounding-failures-chart-container').innerHTML = 
            '<div class="loading">Error loading data.</div>';
    }
}

function renderGroundingFailuresChart(modelStats) {
    const svg = document.getElementById('grounding-failures-chart');
    svg.innerHTML = '';

    if (modelStats.length === 0) {
        svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" class="chart-title">No data available</text>';
        return;
    }

    // Responsive margins and height based on screen size
    const isMobile = window.innerWidth <= 768;
    const margin = isMobile 
        ? { top: 50, right: 30, bottom: 160, left: 60 }
        : { top: 50, right: 40, bottom: 160, left: 80 };
    const chartHeight = isMobile ? 440 : 520;
    
    // For mobile, ensure minimum width so labels don't overlap
    const containerWidth = svg.clientWidth;
    const minBarSpacing = isMobile ? 55 : 70; // Minimum space per model group
    const minChartWidth = modelStats.length * minBarSpacing + margin.left + margin.right;
    const actualWidth = Math.max(containerWidth, minChartWidth);
    
    // Set SVG width to enable horizontal scrolling if needed
    svg.setAttribute('width', actualWidth);
    
    const width = actualWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;
    
    // Update SVG height dynamically
    svg.setAttribute('height', chartHeight);

    const maxRate = Math.max(...modelStats.map(m => Math.max(m.reference, m.content)));
    const barWidth = Math.max(15, (width / modelStats.length) * 0.35); // Width of each bar
    const spacing = width / modelStats.length;
    const groupSpacing = spacing * 0.1; // Space between the two bar groups

    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

    // Draw side-by-side vertical bars (rotated 90 degrees)
    modelStats.forEach((stat, index) => {
        const x = index * spacing + (spacing - barWidth * 2 - groupSpacing) / 2;
        const refHeight = (stat.reference / maxRate) * height;
        const contentHeight = (stat.content / maxRate) * height;

        // Reference failure bar (left bar in the group)
        const refBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        refBar.setAttribute('x', x);
        refBar.setAttribute('y', height - refHeight);
        refBar.setAttribute('width', barWidth);
        refBar.setAttribute('height', refHeight);
        refBar.setAttribute('fill', '#7a9a8b'); // muted teal-green for reference failures
        refBar.setAttribute('rx', 4);
        refBar.setAttribute('class', 'grounding-bar');
        chartGroup.appendChild(refBar);

        // Content failure bar (right bar in the group, next to reference bar)
        const contentBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        contentBar.setAttribute('x', x + barWidth + groupSpacing);
        contentBar.setAttribute('y', height - contentHeight);
        contentBar.setAttribute('width', barWidth);
        contentBar.setAttribute('height', contentHeight);
        contentBar.setAttribute('fill', '#c4a88a'); // muted beige/tan for content failures
        contentBar.setAttribute('rx', 4);
        contentBar.setAttribute('class', 'grounding-bar');
        chartGroup.appendChild(contentBar);

        // Model name label (on x-axis, rotated)
        const nameLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameLabel.setAttribute('x', x + barWidth + groupSpacing / 2);
        nameLabel.setAttribute('y', height + 15);
        nameLabel.setAttribute('text-anchor', 'end');
        nameLabel.setAttribute('class', 'chart-axis');
        nameLabel.setAttribute('font-size', isMobile ? '9px' : '11px');
        nameLabel.setAttribute('transform', `rotate(-45, ${x + barWidth + groupSpacing / 2}, ${height + 15})`);
        nameLabel.textContent = formatModelName(stat.model);
        chartGroup.appendChild(nameLabel);

        // Reference failure label (on top of bar)
        if (refHeight > 20) {
            const refLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            refLabel.setAttribute('x', x + barWidth / 2);
            refLabel.setAttribute('y', height - refHeight - 5);
            refLabel.setAttribute('text-anchor', 'middle');
            refLabel.setAttribute('dominant-baseline', 'baseline');
            refLabel.setAttribute('class', 'chart-axis');
            refLabel.setAttribute('font-size', isMobile ? '8px' : '10px');
            refLabel.setAttribute('font-weight', '600');
            refLabel.textContent = `${stat.reference.toFixed(1)}%`;
            chartGroup.appendChild(refLabel);
        }

        // Content failure label (on top of bar)
        if (contentHeight > 20) {
            const contentLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            contentLabel.setAttribute('x', x + barWidth + groupSpacing + barWidth / 2);
            contentLabel.setAttribute('y', height - contentHeight - 5);
            contentLabel.setAttribute('text-anchor', 'middle');
            contentLabel.setAttribute('dominant-baseline', 'baseline');
            contentLabel.setAttribute('class', 'chart-axis');
            contentLabel.setAttribute('font-size', isMobile ? '8px' : '10px');
            contentLabel.setAttribute('font-weight', '600');
            contentLabel.textContent = `${stat.content.toFixed(1)}%`;
            chartGroup.appendChild(contentLabel);
        }
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

    // Y-axis label
    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('x', -height / 2);
    yAxisLabel.setAttribute('y', -50);
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('class', 'chart-axis');
    yAxisLabel.setAttribute('font-size', isMobile ? '11px' : '14px');
    yAxisLabel.setAttribute('font-weight', '600');
    yAxisLabel.setAttribute('transform', 'rotate(-90)');
    yAxisLabel.textContent = 'Failure Rate (%)';
    chartGroup.appendChild(yAxisLabel);

    // Title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', width / 2);
    title.setAttribute('y', -20);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('class', 'chart-title');
    title.setAttribute('font-size', isMobile ? '14px' : '18px');
    title.setAttribute('font-weight', '700');
    title.textContent = 'Reference vs Content Grounding Failures';
    chartGroup.appendChild(title);

    // Legend - positioned lower to avoid overlapping with x-axis labels
    const legendY = height + (isMobile ? 140 : 145);
    const legendItemWidth = isMobile ? 125 : 150;
    const legendTotalWidth = legendItemWidth * 2;
    const legendX = Math.max(10, (width - legendTotalWidth) / 2);
    
    // Reference legend
    const refLegendRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    refLegendRect.setAttribute('x', legendX);
    refLegendRect.setAttribute('y', legendY);
    refLegendRect.setAttribute('width', 14);
    refLegendRect.setAttribute('height', 10);
    refLegendRect.setAttribute('fill', '#7a9a8b');
    refLegendRect.setAttribute('rx', 2);
    chartGroup.appendChild(refLegendRect);
    
    const refLegendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    refLegendText.setAttribute('x', legendX + 18);
    refLegendText.setAttribute('y', legendY + 9);
    refLegendText.setAttribute('class', 'chart-axis');
    refLegendText.setAttribute('font-size', isMobile ? '10px' : '12px');
    refLegendText.textContent = 'Reference Failure';
    chartGroup.appendChild(refLegendText);

    // Content legend
    const contentLegendRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    contentLegendRect.setAttribute('x', legendX + legendItemWidth);
    contentLegendRect.setAttribute('y', legendY);
    contentLegendRect.setAttribute('width', 14);
    contentLegendRect.setAttribute('height', 10);
    contentLegendRect.setAttribute('fill', '#c4a88a');
    contentLegendRect.setAttribute('rx', 2);
    chartGroup.appendChild(contentLegendRect);
    
    const contentLegendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    contentLegendText.setAttribute('x', legendX + legendItemWidth + 18);
    contentLegendText.setAttribute('y', legendY + 9);
    contentLegendText.setAttribute('class', 'chart-axis');
    contentLegendText.setAttribute('font-size', isMobile ? '10px' : '12px');
    contentLegendText.textContent = 'Content Failure';
    chartGroup.appendChild(contentLegendText);

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
        'claude-opus-4-6': 'Claude-Opus-4.6',
        'claude-sonnet-4-6': 'Claude-Sonnet-4.6',
        'gemini-3-flash': 'Gemini-3-Flash',
        'gemini-3-pro': 'Gemini-3-Pro',
        'deepseek-chat': 'DeepSeek-Chat',
        'deepseek-reasoner': 'DeepSeek-Reasoner',
        'kimi-k2-thinking': 'Kimi-K2-thinking',
        'kimi-k2.5-thinking': 'Kimi-K2.5-thinking',
        'grok-4.1-thinking-fast': 'Grok-4.1-thinking-fast'
    };
    
    if (nameMap[name]) {
        return nameMap[name];
    }
    
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
