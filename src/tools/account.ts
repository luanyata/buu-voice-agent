import { llm } from "@livekit/agents";
import { z } from "zod";

export const AccountStatusInputSchema = z.object({
  accountId: z
    .string()
    .describe("The alphanumeric account ID (e.g. A1234)"),
});

export const AccountStatusOutputSchema = z.object({
  status: z.string(),
  tier: z.string(),
  balance: z.number().optional(),
  hasIssues: z.boolean(),
});

export type AccountStatusInput = z.infer<typeof AccountStatusInputSchema>;
export type AccountStatusOutput = z.infer<typeof AccountStatusOutputSchema>;

/**
 * Ferramenta que consulta o status cadastral e plano do cliente por accountId.
 */
export const checkAccountStatus = llm.tool({
  name: "checkAccountStatus",
  description: "Lookup a customer's account status by account ID",
  parameters: AccountStatusInputSchema,
  execute: async ({ accountId }): Promise<string> => {
    console.log(`[Tool] Consultando conta: ${accountId}...`);

    let result: AccountStatusOutput;
    if (accountId.toUpperCase() === "A1234") {
      result = {
        status: "active",
        tier: "premium",
        balance: 0,
        hasIssues: false,
      };
    } else {
      result = {
        status: "active",
        tier: "standard",
        hasIssues: false,
      };
    }

    return JSON.stringify(result);
  },
});
