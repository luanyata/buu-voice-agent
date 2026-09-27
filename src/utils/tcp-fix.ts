import { AgentsConsole, type JobContext } from "@livekit/agents";

/**
 * Intercepta a condição de corrida no LiveKit CLI ('lk agent console').
 * Em modo console (fakeJob), o AgentSession emite eventos de contexto antes que o
 * transporte TCP complete o handshake inicial. Esta função envelopa o método
 * `sendMessage` para aguardar a abertura do socket por até 1000ms, eliminando
 * completamente o log de aviso "tcp session transport is closed".
 */
export function applyTcpConsoleRaceConditionFix(ctx: JobContext): void {
  if (!ctx.isFakeJob) return;

  const consoleInst = AgentsConsole.getInstance();
  const transport = consoleInst.transport as any;

  if (transport && typeof transport.sendMessage === "function") {
    const originalSend = transport.sendMessage.bind(transport);

    transport.sendMessage = async (msg: any) => {
      if (!transport.socket && !transport.closed) {
        for (let i = 0; i < 50; i++) {
          if (transport.socket || transport.closed) break;
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
      }

      if (transport.socket) {
        return originalSend(msg);
      }
    };
  }
}
