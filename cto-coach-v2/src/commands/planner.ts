export function planCommand(cmd: string, args: string[]) {
  switch (cmd) {
    case "hazirla":
      return { cli: ["hazirla", ...args] };
    case "audit":
      return { cli: ["audit"] };
    case "optimize":
      return { cli: ["optimize"] };
    case "release":
      return { cli: ["release"] };
    case "temizle":
      return { cli: ["temizle", ...args] };
    default:
      throw new Error(`Unknown command: ${cmd}`);
  }
}
