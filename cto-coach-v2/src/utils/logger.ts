import fs from "fs";
import path from "path";

const LOG_PATH = path.resolve(process.cwd(), "logs/cto-reports.log");
const HISTORY_PATH = path.resolve(process.cwd(), "logs/history.json");

export function logReport(entry: {
  command: string;
  status: string;
  report?: string;
  message?: string;
}) {
  const line = `[${new Date().toISOString()}] ${entry.command}: ${entry.status}`
    + (entry.report ? ` - ${entry.report}` : "")
    + (entry.message ? ` - ${entry.message}` : "")
    + "\n";
  fs.appendFileSync(LOG_PATH, line);

  let hist: any[] = [];
  try {
    hist = JSON.parse(fs.readFileSync(HISTORY_PATH, "utf8"));
  } catch {}
  hist.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(hist, null, 2));
}
