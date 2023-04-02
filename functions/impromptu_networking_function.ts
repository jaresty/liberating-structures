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
      }
    },
    required: ["prompt"],
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
    const outputText = inputs.prompt + "\n\n" +
      "\n>React to this prompt within the next one minute to join our impromptu networking session." +
      "  It will only take about 10 minutes, and you can meet a few new people.";
    return { outputs: { prompt: outputText } };
  },
);
