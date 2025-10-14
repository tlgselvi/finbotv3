export function validate(raw: string) {
    try {
        // Extract JSON from mixed output
        const jsonMatch = raw.match(/\{.*\}/s);
        if (jsonMatch) {
            const obj = JSON.parse(jsonMatch[0]);
            return { success: true, data: obj };
        } else {
            return { success: false, error: "No JSON found in output" };
        }
    } catch (e: any) {
        return { success: false, error: `JSON parse error: ${e.message}` };
    }
}
