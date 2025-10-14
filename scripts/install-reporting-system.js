import fs from "fs";

const dirs = ["logs", "cto-coach-v2/src/utils", "cto-coach-v2/src/commands", "cto-coach-v2/scripts"];

dirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

console.log("✅ Reporting system structure created.");
