import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in Workflows.
 * https://api.slack.com/future/functions/custom
 */
export const GreetingFunctionDefinition = DefineFunction({
  callback_id: "greeting_function",
  title: "Impromptu Networking",
  description: "Impromptu Networking",
  source_file: "functions/greeting_function.ts",
  input_parameters: {
    properties: {
      prompt: {
        type: Schema.types.string,
        description: "Prompt for networking",
      },
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
    required: ["greeting"],
  },
});

export default SlackFunction(
  GreetingFunctionDefinition,
  ({ inputs }) => {
      const prompt = `@here Let's do some impromptu networking!  React to this prompt within the next 1 minute to join.  It will only take about 10 minutes, and you can meet a few new people.  The prompt we will use is this.\n\n> ${inputs.prompt}`;
      return { outputs: {prompt} };
  },
);
