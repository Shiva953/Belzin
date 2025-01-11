/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tool } from "langchain/tools";
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { get_bet_blink } from "@/tools/get_blink";

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
    description = `Get the blink url for a given bet having bet title, bet amount and bet resolution date.
  
    Inputs ( input is a JSON string ):
    betTitle: string, the title of the bet, eg: "Will spain win the race?" (required)
    betAmount: number, the amount to be put on the bet, eg: 100 (required)
    betResolutionDateString: string, the date when the bet will be resolved, eg: "31st December, 2025" (required)
    tokenTicker: string, the ticker associated with a token, eg: "USDC", "JUP"(required)`;
  
    constructor(private solanaKit: SolanaAgentKit) {
      super();
    }
  
    protected async _call(input: string): Promise<string> {
      try {
        const parsed = JSON.parse(input);
        const parsedInput = parsed.input || parsed;
        console.log("PARSED INPUT: ",parsedInput)
  
        const blink = await this.solanaKit.getBetBlink(
          parsedInput.betTitle,
          parsedInput.betAmount,
          parsedInput.betResolutionDateString,
          parsedInput.tokenTicker
        );
  
        return JSON.stringify({
          status: "success",
          blink: blink,
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
    // Add your new tool
    const toolsWithBlinkToolAdded = [...tools, new SolanaBetBlinkTool(solanaKit)]

    return toolsWithBlinkToolAdded;
}