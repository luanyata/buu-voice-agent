import {
  cli,
  defineAgent,
  voice,
  ServerOptions,
  type JobContext,
} from "@livekit/agents";
import * as google from "@livekit/agents-plugin-google";
import { env } from "./config/env";
import { BUU_SYSTEM_PROMPT, BUU_GREETING_INSTRUCTION } from "./config/prompts";
import { checkAccountStatus } from "./tools/account";
import { applyTcpConsoleRaceConditionFix } from "./utils/tcp-fix";

export default defineAgent({
  entry: async (ctx: JobContext) => {
    // 1. Gerenciamento de conexão (WebRTC vs Console local)
    if (!ctx.isFakeJob) {
      await ctx.connect();
      console.log(`[Agent] Conectado à sala: ${ctx.room.name}`);
    } else {
      console.log(`[Agent] Iniciando em modo Console local`);
      applyTcpConsoleRaceConditionFix(ctx);
    }

    // 2. Instância do Gemini Realtime via Google Cloud Vertex AI
    const realtimeModel = new google.realtime.RealtimeModel({
      model: "gemini-live-2.5-flash-native-audio",
      voice: "Puck",
      instructions: BUU_SYSTEM_PROMPT,
      vertexai: true,
      project: env.GOOGLE_CLOUD_PROJECT,
      location: env.GOOGLE_CLOUD_LOCATION,
    });

    // 3. Instância do Agent e da Session (100% Realtime Nativo)
    const agent = new voice.Agent({
      instructions: BUU_SYSTEM_PROMPT,
      tools: [checkAccountStatus],
    });

    const session = new voice.AgentSession({
      llm: realtimeModel,
      turnDetection: "realtime_llm",
    });

    // 4. Inicia a sessão do agente
    await session.start({
      agent,
      room: ctx.room,
    });

    // 5. Saudação inicial disparada diretamente pelo modelo Realtime
    session.generateReply({
      instructions: BUU_GREETING_INSTRUCTION,
    });
  },
});

// Inicialização via Server CLI
cli.runApp(new ServerOptions({ agent: import.meta.filename }));
