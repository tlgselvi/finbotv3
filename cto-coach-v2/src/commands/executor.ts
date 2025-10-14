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
                const retryRaw = await execute(repairPlan);
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

async function runCli(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["./cto-coach-v2/dist/index.js", command, ...args], {
            stdio: ["ignore", "pipe", "pipe"]
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
