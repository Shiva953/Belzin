/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Tool } from "langchain/tools";
// import { SolanaAgentKit } from "solana-agent-kit";

// export class BettingBlinkTool extends Tool {
//   name = "Get the betting blink for given (bet amount, bet title, resolving source)";
//   description = "Returns a blink in which you can bet";

//   constructor(private solanaKit: SolanaAgentKit) {
//     super();
//   }

//   protected async _call(input: string): Promise<string> {
//     try {
//       const result = await this.solanaKit.getBettingBlink(input);
//       return JSON.stringify({
//         status: "success",
//         message: "Custom tool executed successfully",
//         data: result,
//       });
//     } catch (error: any) {
//       return JSON.stringify({
//         status: "error",
//         message: error.message,
//         code: error.code || "UNKNOWN_ERROR",
//       });
//     }
//   }
// }