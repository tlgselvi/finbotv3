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
export function renderEnhancedReport(parsed: any): string {
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
    }

    return report;
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
