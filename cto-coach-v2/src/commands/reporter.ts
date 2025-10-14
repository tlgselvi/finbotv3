interface Template { success: string; error: string; }

// Chart generation utilities
interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string;
    }>;
}

interface ChartConfig {
    type: 'bar' | 'line' | 'pie' | 'doughnut';
    title: string;
    data: ChartData;
    options?: any;
}

const tpl: Template = {
    success: `
✅ **{{command | upper}} RAPORU**
📁 Dosya: \`{{report}}\`
📊 Skor: {{score}}/10
🕒 Tarih: {{timestamp}}
`,
    error: `
❌ **HATA: {{message}}**
🔍 Komut: {{command}}
🕒 {{timestamp}}
`
};

export function renderReport(parsed: any): string {
    // Düzeltme durumu kontrolü
    if (parsed._repaired) {
        return `🔧 **DÜZELTME DENENDİ**\n` +
            `📝 Açıklama: ${parsed._repairDescription || 'Otomatik düzeltme uygulandı'}\n` +
            renderNormal(parsed);
    }

    // Browser test durumu
    if (parsed.command === "browser-test") {
        return `🔍 **BROWSER TEST**\n` +
            `🌐 URL: ${parsed.url || 'N/A'}\n` +
            `📄 Başlık: ${parsed.title || 'N/A'}\n` +
            `📊 Durum: ${parsed.status === 'success' ? '✅ Başarılı' : '❌ Başarısız'}\n` +
            (parsed.errors ? `⚠️ Hatalar: ${parsed.errors.join(', ')}\n` : '') +
            (parsed.performance ? `⚡ Yükleme Süresi: ${parsed.performance.loadTime}ms\n` : '') +
            `🕒 Tarih: ${parsed.timestamp || new Date().toISOString()}`;
    }

    // Self-heal durumu
    if (parsed.command === "self-heal") {
        return `🛠️ **SELF-HEAL RAPORU**\n` +
            `🔧 Otomatik düzeltme: ${parsed.autoFixed || 0} sorun\n` +
            `📊 Skor: ${parsed.score || 0}/10\n` +
            `🕒 Tarih: ${parsed.timestamp || new Date().toISOString()}`;
    }

    // Rollback durumu
    if (parsed.command === "rollback") {
        return `⏪ **ROLLBACK RAPORU**\n` +
            `📸 Snapshot: ${parsed.snapshotId || 'N/A'}\n` +
            `📊 Durum: ${parsed.status === 'success' ? '✅ Başarılı' : '❌ Başarısız'}\n` +
            `🕒 Tarih: ${parsed.timestamp || new Date().toISOString()}`;
    }

    // Script çalıştırma durumu
    if (parsed.command.includes("guncelle") || parsed.command.includes("update")) {
        return `🔄 **OTOMATIK GÜNCELLEME**\n` +
            `📝 Komut: ${parsed.command}\n` +
            `📊 Durum: ${parsed.status === 'success' ? '✅ Başarılı' : '❌ Başarısız'}\n` +
            (parsed.output ? `📄 Çıktı: ${parsed.output.substring(0, 200)}...\n` : '') +
            `🕒 Tarih: ${parsed.timestamp || new Date().toISOString()}`;
    }

    return renderNormal(parsed);
}

/**
 * Generate ASCII chart for performance metrics
 */
export function generateASCIIChart(data: ChartData, type: 'bar' | 'line' = 'bar'): string {
    if (type === 'bar') {
        return generateBarChart(data);
    } else if (type === 'line') {
        return generateLineChart(data);
    }
    return '';
}

function generateBarChart(data: ChartData): string {
    const maxValue = Math.max(...data.datasets[0]?.data || [0]);
    const scale = maxValue > 0 ? 50 / maxValue : 1;

    let chart = '\n📊 **PERFORMANCE CHART**\n';
    chart += '```\n';

    data.labels.forEach((label, index) => {
        const value = data.datasets[0]?.data[index] || 0;
        const barLength = Math.round(value * scale);
        const bar = '█'.repeat(barLength);
        const spaces = ' '.repeat(Math.max(0, 15 - label.length));
        chart += `${label}${spaces} │${bar} ${value}\n`;
    });

    chart += '```\n';
    return chart;
}

function generateLineChart(data: ChartData): string {
    const maxValue = Math.max(...data.datasets[0]?.data || [0]);
    const scale = maxValue > 0 ? 20 / maxValue : 1;

    let chart = '\n📈 **TREND CHART**\n';
    chart += '```\n';

    // Create a simple line chart representation
    const points = data.datasets[0]?.data.map(value => Math.round(value * scale)) || [];
    const maxHeight = Math.max(...points);

    for (let i = maxHeight; i >= 0; i--) {
        let line = '';
        points.forEach((point, index) => {
            if (point === i) {
                line += '●';
            } else if (point > i) {
                line += '│';
            } else {
                line += ' ';
            }
            line += ' ';
        });
        chart += line + '\n';
    }

    // Add labels
    let labelLine = '';
    data.labels.forEach(label => {
        labelLine += label.substring(0, 2) + ' ';
    });
    chart += labelLine + '\n';

    chart += '```\n';
    return chart;
}

/**
 * Generate base64 chart image (for future use)
 */
export function generateBase64Chart(config: ChartConfig): string {
    // This would integrate with a chart library like Chart.js
    // For now, return a placeholder
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
}

/**
 * Enhanced report rendering with charts
 */
export function renderEnhancedReport(parsed: any, options: { svg?: boolean } = {}): string {
    let report = renderReport(parsed);

    // Add performance charts for optimize command
    if (parsed.command === 'optimize' && parsed.performance) {
        const chartData: ChartData = {
            labels: ['Bundle Size', 'Load Time', 'Memory', 'API Response'],
            datasets: [{
                label: 'Performance Metrics',
                data: [
                    parsed.performance.bundleSize || 0,
                    parsed.performance.loadTime || 0,
                    parsed.performance.memory || 0,
                    parsed.performance.apiResponse || 0
                ]
            }]
        };

        report += generateASCIIChart(chartData, 'bar');

        // Add SVG chart if requested
        if (options.svg) {
            const svgChart = generateSVGChart(chartData, 'Performance Metrics');
            report += `\n\n📊 **SVG Chart:**\n${svgChart}\n`;
        }
    }

    // Add trend chart for audit command
    if (parsed.command === 'audit' && parsed.metrics) {
        const chartData: ChartData = {
            labels: ['Security', 'Performance', 'Code Quality', 'Dependencies'],
            datasets: [{
                label: 'Audit Scores',
                data: [
                    parsed.metrics.security || 0,
                    parsed.metrics.performance || 0,
                    parsed.metrics.codeQuality || 0,
                    parsed.metrics.dependencies || 0
                ]
            }]
        };

        report += generateASCIIChart(chartData, 'line');

        // Add SVG chart if requested
        if (options.svg) {
            const svgChart = generateSVGChart(chartData, 'Audit Scores');
            report += `\n\n📊 **SVG Chart:**\n${svgChart}\n`;
        }
    }

    return report;
}

/**
 * Generate mini SVG chart
 */
export function generateSVGChart(data: ChartData, title: string): string {
    const width = 400;
    const height = 200;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const maxValue = Math.max(...data.datasets[0]?.data || [0]);
    const scale = maxValue > 0 ? chartHeight / maxValue : 1;

    // Generate SVG elements
    let svgElements = '';

    // Bars or lines based on data type
    data.datasets[0]?.data.forEach((value, index) => {
        const x = padding + (index * chartWidth) / data.labels.length + chartWidth / (data.labels.length * 2);
        const y = padding + chartHeight - (value * scale);
        const barHeight = value * scale;

        // Bar chart
        svgElements += `<rect x="${x - 10}" y="${y}" width="20" height="${barHeight}" fill="#3b82f6" opacity="0.7"/>`;

        // Label
        svgElements += `<text x="${x}" y="${padding + chartHeight + 15}" text-anchor="middle" font-size="10" fill="#374151">${data.labels[index]}</text>`;

        // Value
        svgElements += `<text x="${x}" y="${y - 5}" text-anchor="middle" font-size="8" fill="#374151">${value}</text>`;
    });

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#f9fafb"/>
    <text x="${width / 2}" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">${title}</text>
    ${svgElements}
  </svg>`;
}

/**
 * Export report data as JSON
 */
export function exportReportAsJSON(parsed: any): string {
    const exportData = {
        timestamp: new Date().toISOString(),
        command: parsed.command,
        status: parsed.status,
        data: {
            ...parsed,
            // Remove sensitive information
            password: undefined,
            token: undefined,
            secret: undefined
        },
        metadata: {
            version: 'CTO Koçu v3 Enterprise+',
            exportDate: new Date().toISOString(),
            format: 'json'
        }
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * Generate comprehensive report with multiple formats
 */
export function generateComprehensiveReport(parsed: any, options: {
    format?: 'markdown' | 'json' | 'both';
    includeCharts?: boolean;
    includeSVG?: boolean;
} = {}): { markdown: string; json?: string } {
    const { format = 'markdown', includeCharts = true, includeSVG = false } = options;

    let markdownReport = renderEnhancedReport(parsed, { svg: includeSVG });

    if (includeCharts) {
        markdownReport += '\n\n## 📊 **Additional Metrics**\n';
        markdownReport += generateDetailedMetrics(parsed);
    }

    const result: { markdown: string; json?: string } = {
        markdown: markdownReport
    };

    if (format === 'json' || format === 'both') {
        result.json = exportReportAsJSON(parsed);
    }

    return result;
}

/**
 * Generate detailed metrics section
 */
function generateDetailedMetrics(parsed: any): string {
    let metrics = '';

    if (parsed.performance) {
        metrics += '### ⚡ Performance Metrics\n';
        metrics += `- **Bundle Size:** ${parsed.performance.bundleSize || 'N/A'} KB\n`;
        metrics += `- **Load Time:** ${parsed.performance.loadTime || 'N/A'} ms\n`;
        metrics += `- **Memory Usage:** ${parsed.performance.memory || 'N/A'} MB\n`;
        metrics += `- **API Response:** ${parsed.performance.apiResponse || 'N/A'} ms\n\n`;
    }

    if (parsed.metrics) {
        metrics += '### 📊 Quality Metrics\n';
        metrics += `- **Security Score:** ${parsed.metrics.security || 'N/A'}/10\n`;
        metrics += `- **Performance Score:** ${parsed.metrics.performance || 'N/A'}/10\n`;
        metrics += `- **Code Quality:** ${parsed.metrics.codeQuality || 'N/A'}/10\n`;
        metrics += `- **Dependencies:** ${parsed.metrics.dependencies || 'N/A'}/10\n\n`;
    }

    return metrics;
}

function renderNormal(parsed: any): string {
    if (parsed.status === "success") {
        return tpl.success
            .replace("{{command | upper}}", parsed.command.toUpperCase())
            .replace("{{report}}", parsed.report || "")
            .replace("{{score}}", parsed.score?.toString() || "")
            .replace("{{timestamp}}", parsed.timestamp || "");
    } else {
        return tpl.error
            .replace("{{message}}", parsed.message || "")
            .replace("{{command}}", parsed.command)
            .replace("{{timestamp}}", parsed.timestamp || "");
    }
}
