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
        type: Schema.slack.types.rich_text,
        description: "Prompt for networking",
      },
    },
    required: ["prompt"],
  },
  output_parameters: {
    properties: {
      prompt: {
        type: Schema.slack.types.rich_text,
        description: "Prompt for networking session",
      },
    },
    required: ["prompt"],
  },
});

export default SlackFunction(
  ImpromptuNetworkingFunctionDefinition,
  ({ inputs }) => {
      const prompt = `@here Let's do some impromptu networking!  React to this prompt within the next 1 minute to join.  It will only take about 10 minutes, and you can meet a few new people.  The prompt we will use is this.\n\n> ${inputs.prompt}`;
      return { outputs: {prompt} };
  },
);
