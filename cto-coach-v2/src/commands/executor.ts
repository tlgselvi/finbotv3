import { spawn } from "child_process";
import { snapshotManager } from "../utils/snapshotManager";
import { validateError, repair } from "../utils/repair";

export async function execute(plan: any): Promise<string> {
    const snapshot = snapshotManager.createSnapshot(plan, `Executing ${plan.command}`);

    try {
        if (plan.type === "browser") {
            const controller = await import("./browserController");
            const result = await controller[plan.action](...plan.params);
            return JSON.stringify({
                status: "success",
                command: plan.command,
                ...result,
                _repaired: false
            });
        }

        if (plan.type === "script") {
            const result = await runScript(plan.args);
            return JSON.stringify({
                status: "success",
                command: plan.command,
                output: result,
                _repaired: false
            });
        }

        // Direct command execution - recursive call'ı önle
        const raw = await executeDirectCommand(plan.command, plan.args);
        return raw || "";
    } catch (err) {
        const errorInfo = validateError(err as Error);
        const repairPlan = repair(errorInfo.errorType, plan, errorInfo.details);

        if (repairPlan) {
            console.log(`🔧 Düzeltme planı: ${repairPlan.description}`);

            // User confirmation (simulated - gerçek implementasyonda prompt kullanılabilir)
            const userConfirmationEnabled = process.env.CTO_CONFIRM === 'true';
            if (userConfirmationEnabled) {
                console.log("⚠️ Kritik işlem - onay bekleniyor...");
                // Gerçek implementasyonda: const ok = await promptUser("Bu düzeltmeyi uygulasın mı?");
                // if (!ok) throw new Error("Düzeltme reddedildi");
            }

            try {
                snapshotManager.restoreSnapshot(snapshot);
                // Retry count'u artır
                const retryPlan = { ...repairPlan, _retryCount: (plan._retryCount || 0) + 1 };
                const retryRaw = await execute(retryPlan);
                const retryResult = JSON.parse(retryRaw);
                return JSON.stringify({
                    ...retryResult,
                    _repaired: true,
                    _repairDescription: repairPlan.description
                });
            } catch (retryErr) {
                throw new Error(`Düzeltme başarısız: ${(retryErr as Error).message}`);
            }
        }

        throw err;
    }
}

async function runScript(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn(args[0], args.slice(1), {
            stdio: ["ignore", "pipe", "pipe"],
            shell: false,
            detached: false
        });

        let stdout = "", stderr = "";
        proc.stdout.on("data", d => stdout += d.toString());
        proc.stderr.on("data", d => stderr += d.toString());

        proc.on("close", code => {
            if (code === 0) resolve(stdout);
            else reject(new Error(`Script exit ${code}: ${stderr}`));
        });

        proc.on("error", err => {
            reject(new Error(`Script error: ${err.message}`));
        });
    });
}

async function executeDirectCommand(command: string, args: string[]): Promise<string> {
    // Direct command execution - recursive call'ı önle
    switch (command) {
        case "hazirla":
            const { prepareSprint } = await import("./prepare");
            // Parse arguments correctly
            const projectArg = args.find(arg => arg.startsWith('-p')) ? args[args.indexOf('-p') + 1] : "FinBot";
            const sprintArg = args.find(arg => arg.startsWith('-s')) ? args[args.indexOf('-s') + 1] : "1";
            const result1 = await prepareSprint({ project: projectArg, sprint: sprintArg });
            return JSON.stringify(result1);

        case "audit":
            const { auditProject } = await import("./audit");
            const projectArg2 = args.find(arg => arg.startsWith('-p')) ? args[args.indexOf('-p') + 1] : "FinBot";
            const result2 = await auditProject({ project: projectArg2 });
            return JSON.stringify(result2);

        case "optimize":
            const { optimizeProject } = await import("./optimize");
            const projectArg3 = args.find(arg => arg.startsWith('-p')) ? args[args.indexOf('-p') + 1] : "FinBot";
            const result3 = await optimizeProject({ project: projectArg3 });
            return JSON.stringify(result3);

        case "release":
            const { releaseProject } = await import("./release");
            const projectArg4 = args.find(arg => arg.startsWith('-p')) ? args[args.indexOf('-p') + 1] : "FinBot";
            const result4 = await releaseProject({ project: projectArg4 });
            return JSON.stringify(result4);

        case "temizle":
            const { cleanupProject } = await import("./cleanup");
            const projectArg5 = args.find(arg => arg.startsWith('-p')) ? args[args.indexOf('-p') + 1] : "FinBot";
            const modeArg = args.find(arg => arg.startsWith('--')) ? args[args.indexOf('--')] : "all";
            const result5 = await cleanupProject({ project: projectArg5, mode: modeArg });
            return JSON.stringify(result5);

        default:
            throw new Error(`Unknown command: ${command}`);
    }
}

async function runCli(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["./cto-coach-v2/dist/index-advanced.js", command, ...args], {
            stdio: ["ignore", "pipe", "pipe"],
            shell: false,
            detached: false
        });

        let stdout = "", stderr = "";
        proc.stdout.on("data", d => stdout += d.toString());
        proc.stderr.on("data", d => stderr += d.toString());

        proc.on("close", code => {
            if (code === 0) resolve(stdout);
            else reject(new Error(`Exit ${code}: ${stderr}`));
        });

        proc.on("error", err => {
            reject(new Error(`Process error: ${err.message}`));
        });
    });
}
