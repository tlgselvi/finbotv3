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
