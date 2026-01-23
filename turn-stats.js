// Turn-wise statistics display with line plots
function initTurnStats(domain) {
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
        
        if (typeof LEADERBOARD_DATA === 'undefined') {
            document.getElementById('line-chart-container').innerHTML = 
                '<div class="loading">Error loading data. Please check the data files.</div>';
            return;
        }

        const domainData = LEADERBOARD_DATA[domain];
        if (!domainData) {
            document.getElementById('line-chart-container').innerHTML = 
                '<div class="loading">No data available for this domain.</div>';
            return;
        }

        // Get all models and calculate their turn-wise stats
        // Filter out websearch models
        const models = Object.keys(domainData).filter(model => !model.includes('websearch'));
        const stats = models.map(model => {
            const turns = domainData[model];
            const turn1 = turns["1"] !== undefined ? Number(turns["1"]) : null;
            const turn3 = turns["3"] !== undefined ? Number(turns["3"]) : null;
            const turn5 = turns["5"] !== undefined ? Number(turns["5"]) : null;
            
            // Calculate average
            const rates = [turn1, turn3, turn5].filter(r => r !== null);
            const avg = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : null;
            
            return {
                model,
                turn1,
                turn3,
                turn5,
                avg
            };
        });

        // Sort by average (best first)
        stats.sort((a, b) => {
            if (a.avg === null) return 1;
            if (b.avg === null) return -1;
            return a.avg - b.avg;
        });

        // Render line chart
        renderLineChart(stats, domain);
    } catch (error) {
        console.error('Error initializing turn stats:', error);
        document.getElementById('line-chart-container').innerHTML = 
            '<div class="loading">Error loading data. Please check the data files.</div>';
    }
}

function renderLineChart(stats, domain) {
    const container = document.getElementById('line-chart-container');
    const svg = document.getElementById('line-chart');
    
    if (stats.length === 0) {
        container.innerHTML = '<div class="loading">No data available.</div>';
        return;
    }

    // Clear previous content
    svg.innerHTML = '';

    // Responsive margins and height based on screen size
    const isMobile = window.innerWidth <= 768;
    const margin = isMobile 
        ? { top: 50, right: 20, bottom: 50, left: 60 }
        : { top: 50, right: 200, bottom: 60, left: 80 };
    const chartHeight = isMobile ? 420 : 600;
    const width = svg.clientWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;
    
    // Update SVG height dynamically
    svg.setAttribute('height', chartHeight);

    // Find min and max values for scaling
    let minRate = Infinity;
    let maxRate = -Infinity;
    
    stats.forEach(stat => {
        [stat.turn1, stat.turn3, stat.turn5].forEach(rate => {
            if (rate !== null) {
                minRate = Math.min(minRate, rate);
                maxRate = Math.max(maxRate, rate);
            }
        });
    });

    // Add some padding
    const padding = (maxRate - minRate) * 0.1;
    minRate = Math.max(0, minRate - padding);
    maxRate = maxRate + padding;

    // Create main group
    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

    // X scale (turns)
    const turns = [1, 3, 5];
    const xScale = (turn) => ((turn - 1) / 4) * width;
    const xStep = width / 4;

    // Y scale (rates)
    const yScale = (rate) => height - ((rate - minRate) / (maxRate - minRate)) * height;

    // Draw grid lines
    const gridLines = [0, 20, 40, 60, 80, 100].filter(v => v >= minRate && v <= maxRate);
    gridLines.forEach(value => {
        const y = yScale(value);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 0);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#e0ded9');
        line.setAttribute('stroke-width', 1);
        line.setAttribute('stroke-dasharray', '2,2');
        chartGroup.appendChild(line);

        // Y-axis label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', -10);
        label.setAttribute('y', y);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('dominant-baseline', 'middle');
        label.setAttribute('class', 'chart-axis');
        label.setAttribute('font-size', '12px');
        label.setAttribute('fill', '#6b6a67');
        label.textContent = value + '%';
        chartGroup.appendChild(label);
    });

    // Color families - Impressionist-inspired palette (soft, vibrant, harmonious)
    const colorFamilies = {
        'gpt-5': ['#6b9dc4', '#5a8db4', '#7badc4', '#8bbdd4'], // Soft sky blue (Monet water)
        'gpt-5.2': ['#7db89a', '#6da88a', '#8dc8aa', '#9dd8ba'], // Fresh mint green (Monet garden)
        'claude': ['#c49a8a', '#b48a7a', '#d4aa9a', '#e4baaa'], // Warm peach (Renoir skin tones)
        'gemini': ['#d4b88a', '#c4a87a', '#e4c89a', '#f4d8aa'], // Golden yellow (sunlight)
        'deepseek': ['#9a8ab8', '#8a7aa8', '#aa9ac8', '#baaad8'], // Lavender purple (impressionist shadows)
        'kimi': ['#b88ab8', '#a87aa8', '#c89ac8', '#d8aad8'], // Soft pink-purple (flower petals)
        'default': ['#a8a8b8', '#b8b8c8', '#c8c8d8', '#d8d8e8'] // Soft blue-gray
    };

    // Function to get model family
    function getModelFamily(modelName) {
        const name = modelName.toLowerCase();
        if (name.startsWith('gpt-5.2')) return 'gpt-5.2';
        if (name.startsWith('gpt-5')) return 'gpt-5';
        if (name.startsWith('claude')) return 'claude';
        if (name.startsWith('gemini')) return 'gemini';
        if (name.startsWith('deepseek')) return 'deepseek';
        if (name.startsWith('kimi')) return 'kimi';
        return 'default';
    }

    // Group models by family
    const modelFamilies = {};
    stats.forEach(stat => {
        const family = getModelFamily(stat.model);
        if (!modelFamilies[family]) {
            modelFamilies[family] = [];
        }
        modelFamilies[family].push(stat);
    });

    // Assign colors to models within each family
    const modelColors = {};
    Object.keys(modelFamilies).forEach(family => {
        const colors = colorFamilies[family] || colorFamilies['default'];
        modelFamilies[family].forEach((stat, index) => {
            modelColors[stat.model] = colors[index % colors.length];
        });
    });

    // Draw lines for each model
    stats.forEach((stat) => {
        const color = modelColors[stat.model];
        const points = [];
        
        // Collect valid points
        turns.forEach(turn => {
            const rate = stat[`turn${turn}`];
            if (rate !== null) {
                points.push({ turn, rate });
            }
        });

        if (points.length < 2) return; // Need at least 2 points for a line

        // Draw line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = `M ${xScale(points[0].turn)} ${yScale(points[0].rate)}`;
        for (let i = 1; i < points.length; i++) {
            pathData += ` L ${xScale(points[i].turn)} ${yScale(points[i].rate)}`;
        }
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', 2.5);
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', 0.8);
        path.setAttribute('class', 'line-path');
        path.setAttribute('data-model', stat.model);
        chartGroup.appendChild(path);

        // Draw points
        points.forEach(point => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', xScale(point.turn));
            circle.setAttribute('cy', yScale(point.rate));
            circle.setAttribute('r', 4);
            circle.setAttribute('fill', color);
            circle.setAttribute('stroke', '#faf9f7');
            circle.setAttribute('stroke-width', 1.5);
            circle.setAttribute('class', 'line-point');
            circle.setAttribute('data-model', stat.model);
            chartGroup.appendChild(circle);
        });
    });

    // X-axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', height);
    xAxis.setAttribute('x2', width);
    xAxis.setAttribute('y2', height);
    xAxis.setAttribute('stroke', '#e0ded9');
    xAxis.setAttribute('stroke-width', 2);
    chartGroup.appendChild(xAxis);

    // X-axis labels
    turns.forEach(turn => {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', xScale(turn));
        label.setAttribute('y', height + 25);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'chart-axis');
        label.setAttribute('font-size', '14px');
        label.setAttribute('font-weight', '500');
        label.setAttribute('fill', '#6b6a67');
        label.textContent = `Turn ${turn}`;
        chartGroup.appendChild(label);
    });

    // Y-axis label
    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('x', -height / 2);
    yAxisLabel.setAttribute('y', -50);
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('transform', 'rotate(-90)');
    yAxisLabel.setAttribute('class', 'chart-axis');
    yAxisLabel.setAttribute('font-size', isMobile ? '11px' : '14px');
    yAxisLabel.setAttribute('font-weight', '500');
    yAxisLabel.setAttribute('fill', '#6b6a67');
    yAxisLabel.textContent = 'Hallucination Rate (%)';
    chartGroup.appendChild(yAxisLabel);

    // Title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', width / 2);
    title.setAttribute('y', -20);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('class', 'chart-title');
    title.setAttribute('font-size', isMobile ? '14px' : '18px');
    title.setAttribute('font-weight', '600');
    title.setAttribute('fill', '#3a3936');
    title.setAttribute('font-family', "'Avenir', 'Avenir Next', sans-serif");
    title.textContent = 'Turn-wise Hallucination Rates';
    chartGroup.appendChild(title);

    // Legend
    const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    legendGroup.setAttribute('transform', `translate(${width + 20}, 0)`);
    
    stats.forEach((stat, index) => {
        const y = index * 25;
        const color = modelColors[stat.model];
        
        // Legend line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 0);
        line.setAttribute('y1', y + 5);
        line.setAttribute('x2', 20);
        line.setAttribute('y2', y + 5);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', 2.5);
        legendGroup.appendChild(line);
        
        // Legend text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 25);
        text.setAttribute('y', y + 8);
        text.setAttribute('font-size', '12px');
        text.setAttribute('fill', '#3a3936');
        text.setAttribute('font-family', "'Avenir', 'Avenir Next', sans-serif");
        text.textContent = formatModelName(stat.model);
        legendGroup.appendChild(text);
    });

    chartGroup.appendChild(legendGroup);
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

