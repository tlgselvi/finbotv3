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
            return { type: "cli", command: "audit", args: ["--auto-fix"] };
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
            throw new Error(`Unknown command: ${cmd}`);
    }
}
