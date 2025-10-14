import fs from "fs";
import path from "path";

const LOG_PATH = path.resolve(process.cwd(), "logs/cto-reports.log");
const HISTORY_PATH = path.resolve(process.cwd(), "logs/history.json");
const METRICS_PATH = path.resolve(process.cwd(), "logs/agent-metrics.json");

// Observation Layer - Agent Metrics
interface AgentMetrics {
  command: string;
  executionTime: number;
  errorRate: number;
  retryCount: number;
  success: boolean;
  timestamp: Date;
  context: any;
}

class ObservationLayer {
  private metrics: AgentMetrics[] = [];
  private readonly MAX_METRICS = 1000;

  /**
   * Record command execution metrics
   */
  recordMetrics(metrics: AgentMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
    
    this.saveMetrics();
  }

  /**
   * Get metrics for a specific command
   */
  getCommandMetrics(command: string): AgentMetrics[] {
    return this.metrics.filter(m => m.command === command);
  }

  /**
   * Get overall performance metrics
   */
  getOverallMetrics(): {
    totalCommands: number;
    averageExecutionTime: number;
    overallErrorRate: number;
    mostUsedCommands: Array<{command: string, count: number}>;
    recentErrors: AgentMetrics[];
  } {
    const totalCommands = this.metrics.length;
    const averageExecutionTime = this.metrics.reduce((sum, m) => sum + m.executionTime, 0) / totalCommands;
    const errorCount = this.metrics.filter(m => !m.success).length;
    const overallErrorRate = totalCommands > 0 ? (errorCount / totalCommands) * 100 : 0;
    
    // Most used commands
    const commandCounts = new Map<string, number>();
    this.metrics.forEach(m => {
      const count = commandCounts.get(m.command) || 0;
      commandCounts.set(m.command, count + 1);
    });
    
    const mostUsedCommands = Array.from(commandCounts.entries())
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Recent errors (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentErrors = this.metrics
      .filter(m => !m.success && m.timestamp > oneDayAgo)
      .slice(-10);

    return {
      totalCommands,
      averageExecutionTime,
      overallErrorRate,
      mostUsedCommands,
      recentErrors
    };
  }

  /**
   * Save metrics to file
   */
  private saveMetrics(): void {
    try {
      const logsDir = path.dirname(METRICS_PATH);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      fs.writeFileSync(METRICS_PATH, JSON.stringify({
        lastUpdated: new Date().toISOString(),
        metrics: this.metrics
      }, null, 2));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * Load metrics from file
   */
  loadMetrics(): void {
    try {
      if (fs.existsSync(METRICS_PATH)) {
        const data = JSON.parse(fs.readFileSync(METRICS_PATH, 'utf8'));
        this.metrics = data.metrics || [];
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
      this.metrics = [];
    }
  }
}

// Singleton instance
export const observationLayer = new ObservationLayer();

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
  },
  
  // Enhanced logging with metrics
  commandStart: (command: string, context: any = {}) => {
    const startTime = Date.now();
    console.log(`[CMD_START] ${command}`, context);
    return startTime;
  },
  
  commandEnd: (command: string, startTime: number, success: boolean, retryCount: number = 0, context: any = {}) => {
    const executionTime = Date.now() - startTime;
    console.log(`[CMD_END] ${command} - ${executionTime}ms - ${success ? 'SUCCESS' : 'FAILED'}`);
    
    // Record metrics
    observationLayer.recordMetrics({
      command,
      executionTime,
      errorRate: success ? 0 : 100,
      retryCount,
      success,
      timestamp: new Date(),
      context
    });
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
