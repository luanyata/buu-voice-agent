import { existsSync } from "node:fs";

/**
 * Carrega arquivos .env caso o runtime não o faça nativamente.
 * O Bun carrega .env nativamente. Esta função garante compatibilidade
 * com o LiveKit CLI ('lk agent console') quando executado via Node.js/tsx.
 */
export function loadEnvIfNeeded(): void {
  for (const envFile of [".env.local", ".env"]) {
    if (existsSync(envFile)) {
      try {
        // @ts-ignore
        process.loadEnvFile?.(envFile);
      } catch {
        // Ignora silenciosamente se o método não existir ou falhar
      }
    }
  }
}
