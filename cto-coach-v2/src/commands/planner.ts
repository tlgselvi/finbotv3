import { logger } from '../utils/logger.js';

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
