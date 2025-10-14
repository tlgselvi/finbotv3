import fs from "fs";
import path from "path";

const LOG_PATH = path.resolve(process.cwd(), "logs/cto-reports.log");
const HISTORY_PATH = path.resolve(process.cwd(), "logs/history.json");
const METRICS_PATH = path.resolve(process.cwd(), "logs/agent-metrics.json");
const LEARNING_PATH = path.resolve(process.cwd(), "logs/learning-history.json");
const ADAPTIVE_RETRY_PATH = path.resolve(process.cwd(), "logs/adaptive-retry-queue.json");

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
    mostUsedCommands: Array<{ command: string, count: number }>;
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

// Autonomous Learning Layer
interface LearningEntry {
  command: string;
  input: any;
  output: any;
  success: boolean;
  executionTime: number;
  timestamp: Date;
  context: any;
}

interface AdaptiveRetryEntry {
  command: string;
  failureReason: string;
  retryCount: number;
  nextRetryTime: Date;
  context: any;
}

class AutonomousLearningLayer {
  private learningHistory: LearningEntry[] = [];
  private adaptiveRetryQueue: AdaptiveRetryEntry[] = [];
  private readonly MAX_LEARNING_ENTRIES = 1000;
  private readonly SUCCESS_THRESHOLD = 0.9; // 90% success rate

  /**
   * Record command execution for learning
   */
  recordCommandExecution(command: string, input: any, output: any, success: boolean, executionTime: number, context: any = {}): void {
    const entry: LearningEntry = {
      command,
      input,
      output,
      success,
      executionTime,
      timestamp: new Date(),
      context
    };

    this.learningHistory.push(entry);

    // Keep only last MAX_LEARNING_ENTRIES
    if (this.learningHistory.length > this.MAX_LEARNING_ENTRIES) {
      this.learningHistory = this.learningHistory.slice(-this.MAX_LEARNING_ENTRIES);
    }

    // Add to adaptive retry queue if failed
    if (!success) {
      this.addToRetryQueue(command, output?.error || 'Unknown error', context);
    }

    // Check if command should be learned (90%+ success rate)
    this.checkCommandLearning(command);

    this.saveLearningHistory();
  }

  /**
   * Add failed command to adaptive retry queue
   */
  private addToRetryQueue(command: string, failureReason: string, context: any): void {
    const existingEntry = this.adaptiveRetryQueue.find(entry => entry.command === command);

    if (existingEntry) {
      existingEntry.retryCount++;
      existingEntry.nextRetryTime = new Date(Date.now() + Math.pow(2, existingEntry.retryCount) * 60000); // Exponential backoff
    } else {
      const retryEntry: AdaptiveRetryEntry = {
        command,
        failureReason,
        retryCount: 1,
        nextRetryTime: new Date(Date.now() + 60000), // 1 minute initial delay
        context
      };
      this.adaptiveRetryQueue.push(retryEntry);
    }

    this.saveRetryQueue();
  }

  /**
   * Check if command should be learned (90%+ success rate)
   */
  private checkCommandLearning(command: string): void {
    const commandEntries = this.learningHistory.filter(entry => entry.command === command);

    if (commandEntries.length >= 10) { // Minimum 10 executions
      const successCount = commandEntries.filter(entry => entry.success).length;
      const successRate = successCount / commandEntries.length;

      if (successRate >= this.SUCCESS_THRESHOLD) {
        this.promoteToLearnedCommand(command, successRate);
      }
    }
  }

  /**
   * Promote high-success command to learned commands
   */
  private promoteToLearnedCommand(command: string, successRate: number): void {
    console.log(`🎓 Command '${command}' promoted to learned commands (${(successRate * 100).toFixed(1)}% success rate)`);

    // This would integrate with the command learning system
    // For now, we just log the promotion
  }

  /**
   * Analyze command patterns
   */
  analyzeCommandPatterns(): {
    mostSuccessfulCommands: Array<{ command: string, successRate: number, count: number }>;
    problematicCommands: Array<{ command: string, failureRate: number, count: number }>;
    timePatterns: Array<{ hour: number, successRate: number }>;
  } {
    const commandStats = new Map<string, { success: number, total: number }>();
    const hourStats = new Map<number, { success: number, total: number }>();

    // Analyze command success rates
    this.learningHistory.forEach(entry => {
      const stats = commandStats.get(entry.command) || { success: 0, total: 0 };
      stats.total++;
      if (entry.success) stats.success++;
      commandStats.set(entry.command, stats);

      // Analyze by hour
      const hour = entry.timestamp.getHours();
      const hourStat = hourStats.get(hour) || { success: 0, total: 0 };
      hourStat.total++;
      if (entry.success) hourStat.success++;
      hourStats.set(hour, hourStat);
    });

    // Calculate success rates
    const mostSuccessfulCommands = Array.from(commandStats.entries())
      .map(([command, stats]) => ({
        command,
        successRate: stats.success / stats.total,
        count: stats.total
      }))
      .filter(cmd => cmd.count >= 5) // Minimum 5 executions
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);

    const problematicCommands = Array.from(commandStats.entries())
      .map(([command, stats]) => ({
        command,
        failureRate: 1 - (stats.success / stats.total),
        count: stats.total
      }))
      .filter(cmd => cmd.count >= 3 && cmd.failureRate > 0.3) // 30%+ failure rate
      .sort((a, b) => b.failureRate - a.failureRate);

    const timePatterns = Array.from(hourStats.entries())
      .map(([hour, stats]) => ({
        hour,
        successRate: stats.success / stats.total
      }))
      .sort((a, b) => a.hour - b.hour);

    return {
      mostSuccessfulCommands,
      problematicCommands,
      timePatterns
    };
  }

  /**
   * Get learning statistics
   */
  getLearningStats(): {
    totalCommands: number;
    successRate: number;
    learnedCommands: number;
    retryQueueSize: number;
  } {
    const totalCommands = this.learningHistory.length;
    const successCount = this.learningHistory.filter(entry => entry.success).length;
    const successRate = totalCommands > 0 ? successCount / totalCommands : 0;

    return {
      totalCommands,
      successRate,
      learnedCommands: 0, // This would be calculated from the command learning system
      retryQueueSize: this.adaptiveRetryQueue.length
    };
  }

  /**
   * Save learning history to file
   */
  private saveLearningHistory(): void {
    try {
      const logsDir = path.dirname(LEARNING_PATH);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      fs.writeFileSync(LEARNING_PATH, JSON.stringify({
        lastUpdated: new Date().toISOString(),
        entries: this.learningHistory
      }, null, 2));
    } catch (error) {
      console.error('Failed to save learning history:', error);
    }
  }

  /**
   * Save retry queue to file
   */
  private saveRetryQueue(): void {
    try {
      const logsDir = path.dirname(ADAPTIVE_RETRY_PATH);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      fs.writeFileSync(ADAPTIVE_RETRY_PATH, JSON.stringify({
        lastUpdated: new Date().toISOString(),
        queue: this.adaptiveRetryQueue
      }, null, 2));
    } catch (error) {
      console.error('Failed to save retry queue:', error);
    }
  }

  /**
   * Load learning data from files
   */
  loadLearningData(): void {
    try {
      // Load learning history
      if (fs.existsSync(LEARNING_PATH)) {
        const data = JSON.parse(fs.readFileSync(LEARNING_PATH, 'utf8'));
        this.learningHistory = data.entries || [];
      }

      // Load retry queue
      if (fs.existsSync(ADAPTIVE_RETRY_PATH)) {
        const data = JSON.parse(fs.readFileSync(ADAPTIVE_RETRY_PATH, 'utf8'));
        this.adaptiveRetryQueue = data.queue || [];
      }
    } catch (error) {
      console.error('Failed to load learning data:', error);
      this.learningHistory = [];
      this.adaptiveRetryQueue = [];
    }
  }
}

// Singleton instance
export const autonomousLearningLayer = new AutonomousLearningLayer();

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

  // Enhanced logging with metrics and learning
  commandStart: (command: string, context: any = {}) => {
    const startTime = Date.now();
    console.log(`[CMD_START] ${command}`, context);
    return startTime;
  },

  commandEnd: (command: string, startTime: number, success: boolean, retryCount: number = 0, context: any = {}, input?: any, output?: any) => {
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

    // Record for autonomous learning
    autonomousLearningLayer.recordCommandExecution(command, input, output, success, executionTime, context);
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
