import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in Workflows.
 * https://api.slack.com/future/functions/custom
 */
export const ImpromptuNetworkingFunctionDefinition = DefineFunction({
  callback_id: "impromptu_networking_function",
  title: "Impromptu Networking",
  description: "Impromptu Networking",
  source_file: "functions/impromptu_networking_function.ts",
  input_parameters: {
    properties: {
      prompt: {
        type: Schema.types.string,
        description: "Prompt for networking",
      },
      wait_time: {
        type: Schema.types.number,
        description: "How many minutes to wait for reactions",
      },
      rounds: {
        type: Schema.types.number,
        description: "How many rounds of networking will be done",
      }
    },
    required: ["prompt", "wait_time", "rounds"],
  },
  output_parameters: {
    properties: {
      prompt: {
        type: Schema.types.string,
        description: "Prompt for networking session",
      },
    },
    required: ["prompt"],
  },
});

export default SlackFunction(
  ImpromptuNetworkingFunctionDefinition,
  ({ inputs }) => {
    const outputText = "_" + inputs.prompt + "_\n\n" +
      "> Within *" +
      inputs.wait_time +
      " minute(s)* react to this prompt to join our impromptu networking session. (liberating-structures, impromptu-networking)"
    return { outputs: { prompt: outputText } };
  },
);
