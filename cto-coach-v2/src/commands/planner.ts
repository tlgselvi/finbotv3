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
        default:
            throw new Error(`Unknown command: ${cmd}`);
    }
}
