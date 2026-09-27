import { z } from "zod";
import { loadEnvIfNeeded } from "../utils/env-loader";

// Carrega o .env antes de validar (necessário no runner Node.js/tsx do LiveKit CLI)
loadEnvIfNeeded();

export const envSchema = z.object({
  LIVEKIT_URL: z.string().default("ws://127.0.0.1:7880"),
  LIVEKIT_API_KEY: z.string().default("devkey"),
  LIVEKIT_API_SECRET: z.string().default("secret"),
  GOOGLE_CLOUD_PROJECT: z
    .string({
      error: () => ({
        message:
          "GOOGLE_CLOUD_PROJECT não configurado. Defina o ID do projeto GCP no arquivo .env",
      }),
    })
    .min(1, "GOOGLE_CLOUD_PROJECT não pode estar vazio"),
  GOOGLE_CLOUD_LOCATION: z.string().default("us-central1"),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formattedErrors = parsed.error.issues
    .map((issue) => `  - [${issue.path.join(".")}]: ${issue.message}`)
    .join("\n");
  console.error(
    "\n❌ [Config] Falha na validação das variáveis de ambiente:\n" +
      formattedErrors +
      "\n",
  );
  throw new Error(
    "Configuração inválida de variáveis de ambiente no arquivo .env",
  );
}

export const env: Env = parsed.data;

// Sincroniza process.env.LOG_LEVEL para bibliotecas de terceiros (ex: LiveKit Agents / Pino)
process.env.LOG_LEVEL = env.LOG_LEVEL;
