import fs from "fs";
import path from "path";

const LOG_PATH = path.resolve(process.cwd(), "logs/cto-reports.log");
const HISTORY_PATH = path.resolve(process.cwd(), "logs/history.json");

// Logger interface for compatibility
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta || '');
    logReport({ command: 'system', status: 'info', message });
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta || '');
    logReport({ command: 'system', status: 'error', message });
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta || '');
    logReport({ command: 'system', status: 'warn', message });
  },
  debug: (message: string, meta?: any) => {
    console.debug(`[DEBUG] ${message}`, meta || '');
    logReport({ command: 'system', status: 'debug', message });
  }
};

export function logReport(entry: {
  command: string;
  status: string;
  report?: string;
  message?: string;
}) {
  // Ensure logs directory exists
  const logsDir = path.dirname(LOG_PATH);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const line = `[${new Date().toISOString()}] ${entry.command}: ${entry.status}`
    + (entry.report ? ` - ${entry.report}` : "")
    + (entry.message ? ` - ${entry.message}` : "")
    + "\n";
  fs.appendFileSync(LOG_PATH, line);

  let hist: any[] = [];
  try {
    hist = JSON.parse(fs.readFileSync(HISTORY_PATH, "utf8"));
  } catch { }
  hist.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(hist, null, 2));
}
