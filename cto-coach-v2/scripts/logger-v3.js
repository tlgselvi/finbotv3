import fs from "fs";

export function logReport(data) {
    const path = "./logs/cto-reports.log";
    const entry = `[${new Date().toISOString()}] ${data.command}: ${data.status} - ${data.report || "no file"}\n`;
    fs.appendFileSync(path, entry);
}
