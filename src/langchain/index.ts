/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tool } from "langchain/tools";
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { get_bet_blink } from "@/tools/get_blink";
// import { tool, type CoreTool } from "ai";
// import { executeAction, ACTIONS } from "solana-agent-kit";
// import { fetchBettingBlink } from "@/langchain/actions/getBettingBlink";

declare module "solana-agent-kit" {
    interface SolanaAgentKit {
      getBetBlink(betTitle: string, betAmount: number, betResolutionDateString: string, tokenTicker: string): Promise<string>;
    }
  }
  
  SolanaAgentKit.prototype.getBetBlink = async function (betTitle: string, betAmount: number, betResolutionDateString: string, tokenTicker: string): Promise<string> {
    // Your implementation here
    return get_bet_blink(this, betTitle, betAmount, betResolutionDateString, tokenTicker)
  };

  export class SolanaBetBlinkTool extends Tool {
    name = "solana_bet_blink_url";
    description = `Get the blink url for a bet. Input must be a JSON object with:
    - betTitle (string): Bet title, e.g., "Will Spain win?" (required)
    - betAmount (number): Bet amount, e.g., 1000 (required)
    - betResolutionDate (string): Date like "31st December, 2025" (required)
    - tokenTicker (string): Token ticker like "USDC" (required)`;
    // description = `Get the blink url for a given bet having betTitle, betAmount, betResolutionDate and tokenTicker.
  
    // Inputs( input is a JSON string ):
    // betTitle (required): string, the title of the bet, eg: "Will spain win the race?"
    // betAmount (required): number, the amount to be put on the bet, eg: 100
    // betResolutionDate (required): string, the date when the bet will be resolved, eg: "31st December, 2025"
    // tokenTicker (required): string, the ticker associated with a token, eg: "USDC"
    // `;
  
    constructor(private solanaKit: SolanaAgentKit) {
      super();
    }
  
    protected async _call(input: string): Promise<string> {
      try {
        input = input.trim();
        const parsedInput = JSON.parse(input);
        const params = parsedInput.input ? parsedInput.input : parsedInput;
  
        const blink = await this.solanaKit.getBetBlink(
          params.betTitle,
          Number(params.betAmount),
          params.betResolutionDate,
          params.tokenTicker
        );
  
        return JSON.stringify({
          status: "success",
          blink: blink,
          message: "Blink returned successfully"
        });
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        });
      }
    }
  }

  export function createExtendedSolanaTools(solanaKit: SolanaAgentKit) {
    const tools = createSolanaTools(solanaKit);
    const toolsWithBlinkToolAdded = [...tools, new SolanaBetBlinkTool(solanaKit)]

    return toolsWithBlinkToolAdded;
}

// const extendedACTIONS = {...ACTIONS, FETCH_BETTING_BLINK: fetchBettingBlink}


// export function createSolanaToolsExtendedTwo(
//   solanaAgentKit: SolanaAgentKit,
// ): Record<string, CoreTool> {
//   const tools: Record<string, CoreTool> = {};
//   const actionKeys = Object.keys(extendedACTIONS);

//   for (const key of actionKeys) {
//     const action = extendedACTIONS[key as keyof typeof extendedACTIONS];
//     tools[key] = tool({
//       // @ts-expect-error Value matches type however TS still shows error
//       id: action.name,
//       description: `
//       ${action.description}

//       Similes: ${action.similes.map(
//         (simile) => `
//         ${simile}
//       `,
//       )}
//       `.slice(0, 1023),
//       parameters: action.schema,
//       execute: async (params) =>
//         await executeAction(action, solanaAgentKit, params),
//     });
//   }

//   return tools;
// }
