import { logger } from '../utils/logger.js';
import { spawn } from 'child_process'; // Added for getCommandHelp

// Role-Based Mode System
interface UserRole {
  name: string;
  permissions: string[];
  commandLimits: Map<string, number>;
  allowedCommands: string[];
  restrictedCommands: string[];
}

class RoleBasedMode {
  private roles: Map<string, UserRole> = new Map();
  private currentRole: string = 'developer'; // Default role

  constructor() {
    this.initializeRoles();
  }

  /**
   * Initialize default roles
   */
  private initializeRoles(): void {
    // Admin role - full access
    this.roles.set('admin', {
      name: 'admin',
      permissions: ['all'],
      commandLimits: new Map(),
      allowedCommands: ['*'], // All commands
      restrictedCommands: []
    });

    // Developer role - development commands
    this.roles.set('developer', {
      name: 'developer',
      permissions: ['build', 'test', 'audit', 'optimize'],
      commandLimits: new Map([
        ['hazirla', 10],
        ['audit', 5],
        ['optimize', 3],
        ['temizle', 5],
        ['set-role', 1]
      ]),
      allowedCommands: ['hazirla', 'audit', 'optimize', 'browser-test', 'self-heal', 'temizle', 'set-role'],
      restrictedCommands: ['release', 'deploy', 'db-backup', 'db-restore']
    });

    // Monitor role - read-only operations
    this.roles.set('monitor', {
      name: 'monitor',
      permissions: ['read', 'metrics'],
      commandLimits: new Map([
        ['audit', 2],
        ['browser-test', 5]
      ]),
      allowedCommands: ['audit', 'browser-test', 'metrics', 'status'],
      restrictedCommands: ['hazirla', 'optimize', 'release', 'deploy', 'temizle', 'db-backup', 'db-restore']
    });
  }

  /**
   * Set current role
   */
  setRole(role: string): boolean {
    if (this.roles.has(role)) {
      this.currentRole = role;
      logger.info(`Role changed to: ${role}`);
      return true;
    }
    logger.warn(`Invalid role: ${role}`);
    return false;
  }

  /**
   * Get current role
   */
  getCurrentRole(): string {
    return this.currentRole;
  }

  /**
   * Check if command is allowed for current role
   */
  isCommandAllowed(command: string): boolean {
    const role = this.roles.get(this.currentRole);
    if (!role) return false;

    // Admin has access to all commands
    if (role.allowedCommands.includes('*')) return true;

    // Check if command is in allowed list
    if (role.allowedCommands.includes(command)) return true;

    // Check if command is restricted
    if (role.restrictedCommands.includes(command)) return false;

    return false;
  }

  /**
   * Check command limits for current role
   */
  isWithinLimits(command: string): boolean {
    const role = this.roles.get(this.currentRole);
    if (!role) return false;

    const limit = role.commandLimits.get(command);
    if (!limit) return true; // No limit set

    // In a real implementation, you would track usage here
    // For now, we'll assume limits are not exceeded
    return true;
  }

  /**
   * Get role information
   */
  getRoleInfo(roleName?: string): UserRole | null {
    const role = roleName || this.currentRole;
    return this.roles.get(role) || null;
  }

  /**
   * List all available roles
   */
  listRoles(): string[] {
    return Array.from(this.roles.keys());
  }
}

// Singleton instance
export const roleBasedMode = new RoleBasedMode();

// Governance / Approval Mode System
interface ApprovalRequest {
  id: string;
  command: string;
  args: string[];
  requester: string;
  role: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  reason?: string;
}

interface ApprovalLog {
  id: string;
  action: 'request' | 'approve' | 'reject';
  command: string;
  user: string;
  role: string;
  timestamp: Date;
  details: any;
}

class GovernanceSystem {
  private approvalRequests: Map<string, ApprovalRequest> = new Map();
  private approvalLog: ApprovalLog[] = [];
  private readonly APPROVAL_LOG_PATH = 'logs/approval-log.json';
  private readonly REQUIRES_APPROVAL_COMMANDS = ['release', 'deploy', 'db-backup', 'db-restore', 'rollback'];

  /**
   * Check if command requires approval
   */
  requiresApproval(command: string): boolean {
    return this.REQUIRES_APPROVAL_COMMANDS.includes(command);
  }

  /**
   * Request approval for a command
   */
  requestApproval(command: string, args: string[], requester: string, role: string): string {
    const requestId = this.generateRequestId();
    const request: ApprovalRequest = {
      id: requestId,
      command,
      args,
      requester,
      role,
      timestamp: new Date(),
      status: 'pending'
    };

    this.approvalRequests.set(requestId, request);
    this.logApprovalAction('request', command, requester, role, { requestId, args });

    console.log(`⏳ Approval requested for command '${command}' by ${requester} (${role})`);
    console.log(`📋 Request ID: ${requestId}`);
    console.log(`⏰ Waiting for admin approval...`);

    return requestId;
  }

  /**
   * Approve a command (admin only)
   */
  approveCommand(requestId: string, approver: string, role: string): boolean {
    const request = this.approvalRequests.get(requestId);

    if (!request) {
      console.log(`❌ Approval request ${requestId} not found`);
      return false;
    }

    if (role !== 'admin') {
      console.log(`❌ Only admin can approve commands. Current role: ${role}`);
      return false;
    }

    if (request.status !== 'pending') {
      console.log(`❌ Request ${requestId} is already ${request.status}`);
      return false;
    }

    request.status = 'approved';
    request.approvedBy = approver;
    request.approvedAt = new Date();

    this.logApprovalAction('approve', request.command, approver, role, { requestId });

    console.log(`✅ Command '${request.command}' approved by ${approver}`);
    return true;
  }

  /**
   * Reject a command (admin only)
   */
  rejectCommand(requestId: string, rejector: string, role: string, reason: string): boolean {
    const request = this.approvalRequests.get(requestId);

    if (!request) {
      console.log(`❌ Approval request ${requestId} not found`);
      return false;
    }

    if (role !== 'admin') {
      console.log(`❌ Only admin can reject commands. Current role: ${role}`);
      return false;
    }

    if (request.status !== 'pending') {
      console.log(`❌ Request ${requestId} is already ${request.status}`);
      return false;
    }

    request.status = 'rejected';
    request.approvedBy = rejector;
    request.approvedAt = new Date();
    request.reason = reason;

    this.logApprovalAction('reject', request.command, rejector, role, { requestId, reason });

    console.log(`❌ Command '${request.command}' rejected by ${rejector}: ${reason}`);
    return true;
  }

  /**
   * Get approval request status
   */
  getApprovalStatus(requestId: string): ApprovalRequest | null {
    return this.approvalRequests.get(requestId) || null;
  }

  /**
   * Check if command can proceed
   */
  canProceed(command: string, args: string[], user: string, role: string): { canProceed: boolean; requestId?: string; message: string } {
    if (!this.requiresApproval(command)) {
      return { canProceed: true, message: 'Command does not require approval' };
    }

    if (role === 'admin') {
      return { canProceed: true, message: 'Admin user - no approval required' };
    }

    // For non-admin users, request approval
    const requestId = this.requestApproval(command, args, user, role);
    return {
      canProceed: false,
      requestId,
      message: `Approval required for command '${command}'. Request ID: ${requestId}`
    };
  }

  /**
   * List pending approval requests
   */
  listPendingRequests(): ApprovalRequest[] {
    return Array.from(this.approvalRequests.values())
      .filter(request => request.status === 'pending')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get approval history
   */
  getApprovalHistory(): ApprovalLog[] {
    return [...this.approvalLog].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log approval action
   */
  private logApprovalAction(action: 'request' | 'approve' | 'reject', command: string, user: string, role: string, details: any): void {
    const logEntry: ApprovalLog = {
      id: this.generateRequestId(),
      action,
      command,
      user,
      role,
      timestamp: new Date(),
      details
    };

    this.approvalLog.push(logEntry);

    // Keep only last 1000 log entries
    if (this.approvalLog.length > 1000) {
      this.approvalLog = this.approvalLog.slice(-1000);
    }

    this.saveApprovalLog();
  }

  /**
   * Save approval log to file
   */
  private saveApprovalLog(): void {
    try {
      const fs = require('fs');
      const path = require('path');

      const logPath = path.resolve(process.cwd(), this.APPROVAL_LOG_PATH);
      const logDir = path.dirname(logPath);

      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      fs.writeFileSync(logPath, JSON.stringify({
        lastUpdated: new Date().toISOString(),
        log: this.approvalLog,
        requests: Array.from(this.approvalRequests.entries())
      }, null, 2));
    } catch (error) {
      console.error('Failed to save approval log:', error);
    }
  }

  /**
   * Load approval data from file
   */
  loadApprovalData(): void {
    try {
      if (require('fs').existsSync(this.APPROVAL_LOG_PATH)) {
        const data = JSON.parse(require('fs').readFileSync(this.APPROVAL_LOG_PATH, 'utf8'));
        this.approvalLog = data.log || [];

        if (data.requests) {
          this.approvalRequests = new Map(data.requests);
        }
      }
    } catch (error) {
      console.error('Failed to load approval data:', error);
      this.approvalLog = [];
      this.approvalRequests = new Map();
    }
  }
}

// Singleton instance
export const governanceSystem = new GovernanceSystem();

// Command discovery and learning system
interface DiscoveredCommand {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  source: 'help' | 'docs' | 'manual';
}

// Command repository for learned commands
const commandRepository = new Map<string, DiscoveredCommand>();

export function planCommand(cmd: string, args: string[]) {
  // Role-based command validation
  if (!roleBasedMode.isCommandAllowed(cmd)) {
    throw new Error(`Command '${cmd}' not allowed for role '${roleBasedMode.getCurrentRole()}'`);
  }

  if (!roleBasedMode.isWithinLimits(cmd)) {
    throw new Error(`Command '${cmd}' limit exceeded for role '${roleBasedMode.getCurrentRole()}'`);
  }

  // Governance / Approval Mode validation
  const currentRole = roleBasedMode.getCurrentRole();
  const approvalCheck = governanceSystem.canProceed(cmd, args, 'system', currentRole);

  if (!approvalCheck.canProceed) {
    throw new Error(`GOVERNANCE: ${approvalCheck.message}`);
  }

  // Handle role switching
  if (cmd === "set-role" && args.length > 0) {
    const newRole = args[0];
    if (roleBasedMode.setRole(newRole)) {
      return { type: "cli", command: "role-set", args: [newRole] };
    } else {
      throw new Error(`Invalid role: ${newRole}. Available roles: ${roleBasedMode.listRoles().join(', ')}`);
    }
  }

  // Handle approval commands
  if (cmd === "approve" && args.length > 0) {
    const requestId = args[0];
    const success = governanceSystem.approveCommand(requestId, 'admin', currentRole);
    return {
      type: "cli",
      command: "approval-result",
      args: [requestId, success ? 'approved' : 'failed']
    };
  }

  if (cmd === "reject" && args.length > 0) {
    const requestId = args[0];
    const reason = args[1] || 'No reason provided';
    const success = governanceSystem.rejectCommand(requestId, 'admin', currentRole, reason);
    return {
      type: "cli",
      command: "approval-result",
      args: [requestId, success ? 'rejected' : 'failed', reason]
    };
  }

  if (cmd === "pending-approvals") {
    const pending = governanceSystem.listPendingRequests();
    return {
      type: "cli",
      command: "list-pending",
      args: [JSON.stringify(pending)]
    };
  }

  switch (cmd) {
    case "hazirla":
      return { type: "cli", command: "hazirla", args: [...args] };
    case "audit":
      return { type: "cli", command: "audit", args: [] };
    case "optimize":
      return { type: "cli", command: "optimize", args: [] };
    case "release":
      return { type: "cli", command: "release", args: [] };
    case "temizle":
      return { type: "cli", command: "temizle", args: [...args] };
    case "browser-test":
      const [action, ...params] = args;
      return {
        type: "browser",
        command: "browser-test",
        action: action || "testFinBot",
        params: params
      };
    case "self-heal":
      return { type: "cli", command: "audit", args: [] };
    case "rollback":
      return { type: "cli", command: "rollback", args: [...args] };
    case "ajani-guncelle":
    case "agent-update":
      return { type: "script", command: "ajani-guncelle", args: ["node", "scripts/auto-update-agent.js"] };
    case "sistemi-guncelle":
    case "system-update":
      return { type: "script", command: "sistemi-guncelle", args: ["node", "scripts/auto-update-docs.js", "&&", "node", "scripts/auto-deploy-v3.js"] };
    case "dokumantasyonu-guncelle":
    case "docs-update":
      return { type: "script", command: "dokumantasyonu-guncelle", args: ["node", "scripts/auto-update-docs.js"] };
    case "status-guncelle":
    case "status-update":
      return { type: "script", command: "status-guncelle", args: ["node", "scripts/auto-update-docs.js"] };
    case "auto-fix":
      return { type: "cli", command: "self-heal", args: [] };
    case "sistem-kontrolu":
    case "system-check":
      return { type: "cli", command: "audit", args: ["-p", "FinBot"] };
    default:
      // Try to discover command
      const discoveredCommand = commandRepository.get(cmd);
      if (discoveredCommand) {
        logger.info(`Using discovered command: ${cmd}`, { source: discoveredCommand.source });
        return { type: "cli", command: cmd, args: [...args] };
      }

      // Try to learn command from help
      return learnAndExecuteCommand(cmd, args);
  }
}

/**
 * Learn new command from help output or documentation
 */
async function learnAndExecuteCommand(cmd: string, args: string[]) {
  try {
    // Try to get help for the command
    const helpOutput = await getCommandHelp(cmd);
    if (helpOutput) {
      const discoveredCommand = parseHelpOutput(cmd, helpOutput);
      if (discoveredCommand) {
        commandRepository.set(cmd, discoveredCommand);
        logger.info(`Learned new command: ${cmd}`, { description: discoveredCommand.description });

        // Execute the learned command
        return { type: "cli", command: cmd, args: [...args] };
      }
    }

    // Try to discover from documentation
    const docCommand = await discoverFromDocumentation(cmd);
    if (docCommand) {
      commandRepository.set(cmd, docCommand);
      logger.info(`Discovered command from docs: ${cmd}`, { description: docCommand.description });

      return { type: "cli", command: cmd, args: [...args] };
    }

    throw new Error(`Unknown command: ${cmd}`);
  } catch (error) {
    logger.error(`Failed to learn command: ${cmd}`, { error });
    throw new Error(`Unknown command: ${cmd}`);
  }
}

/**
 * Get help output for a command
 */
async function getCommandHelp(cmd: string): Promise<string | null> {
  try {
    const { spawn } = await import('child_process');

    return new Promise((resolve, reject) => {
      const process = spawn(cmd, ['--help'], { shell: true });
      let output = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0 || output.length > 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    logger.warn(`Failed to get help for command: ${cmd}`, { error });
    return null;
  }
}

/**
 * Parse help output to extract command information
 */
function parseHelpOutput(cmd: string, helpOutput: string): DiscoveredCommand | null {
  try {
    const lines = helpOutput.split('\n');
    let description = '';
    let usage = '';
    const examples: string[] = [];

    // Extract description (usually first non-empty line)
    for (const line of lines) {
      if (line.trim() && !line.startsWith('Usage:') && !line.startsWith('Options:')) {
        description = line.trim();
        break;
      }
    }

    // Extract usage
    const usageLine = lines.find(line => line.startsWith('Usage:'));
    if (usageLine) {
      usage = usageLine.replace('Usage:', '').trim();
    }

    // Extract examples (lines that start with examples or contain the command)
    for (const line of lines) {
      if (line.includes(cmd) && line.trim().length > cmd.length + 5) {
        examples.push(line.trim());
      }
    }

    if (description || usage) {
      return {
        name: cmd,
        description: description || `Command: ${cmd}`,
        usage: usage || `${cmd} [options]`,
        examples: examples.slice(0, 3), // Limit to 3 examples
        source: 'help'
      };
    }

    return null;
  } catch (error) {
    logger.error(`Failed to parse help output for: ${cmd}`, { error });
    return null;
  }
}

/**
 * Discover command from documentation
 */
async function discoverFromDocumentation(cmd: string): Promise<DiscoveredCommand | null> {
  try {
    // This would scan documentation files for command information
    // For now, return null as we don't have documentation scanning implemented
    return null;
  } catch (error) {
    logger.error(`Failed to discover command from docs: ${cmd}`, { error });
    return null;
  }
}

/**
 * List all discovered commands
 */
export function listDiscoveredCommands(): DiscoveredCommand[] {
  return Array.from(commandRepository.values());
}

/**
 * Get command information
 */
export function getCommandInfo(cmd: string): DiscoveredCommand | null {
  return commandRepository.get(cmd) || null;
}

/**
 * Clear command repository
 */
export function clearCommandRepository(): void {
  commandRepository.clear();
  logger.info('Command repository cleared');
}
