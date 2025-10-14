import { spawn } from "child_process";

export function execute(cliArgs: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("node", ["./cto-coach-v2/dist/index.js", ...cliArgs], {
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "", stderr = "";
    proc.stdout.on("data", d => stdout += d.toString());
    proc.stderr.on("data", d => stderr += d.toString());
    proc.on("close", code => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`Exit ${code}: ${stderr}`));
    });
  });
}
