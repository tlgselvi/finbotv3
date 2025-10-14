import { planCommand } from "./commands/planner";
import { execute } from "./commands/executor";
import { validate } from "./commands/validator";
import { report } from "./utils/output";
import { logReport } from "./utils/logger";
import { renderReport } from "./commands/reporter";

async function main() {
    const args = process.argv.slice(2);
    const cmd = args[0];
    const rest = args.slice(1);

    const plan = planCommand(cmd, rest);
    try {
        const raw = await execute(plan.cli);
        const v = validate(raw);
        if (v.success && v.data) {
            const data = v.data;
            report(data);
            logReport(data);
            console.log(renderReport(data));
        } else {
            const errorData = {
                status: "error",
                command: cmd,
                message: v.error || "Unknown error",
                timestamp: new Date().toISOString()
            };
            report(errorData);
            logReport(errorData);
            console.log(renderReport(errorData));
        }
    } catch (err: any) {
        const errorData = {
            status: "error",
            command: cmd,
            message: `Execution error: ${err.message}`,
            timestamp: new Date().toISOString()
        };
        report(errorData);
        logReport(errorData);
        console.log(renderReport(errorData));
    }
}

main();
