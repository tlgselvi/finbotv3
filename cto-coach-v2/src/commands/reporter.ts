interface Template { success: string; error: string; }

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
    
    return renderNormal(parsed);
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
