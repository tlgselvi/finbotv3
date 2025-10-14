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

        const raw = await runCli(plan.command, plan.args);
        return raw;
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
            shell: true,
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

async function runCli(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["./cto-coach-v2/dist/index-advanced.js", command, ...args], {
            stdio: ["ignore", "pipe", "pipe"],
            shell: true,
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
