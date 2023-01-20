import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in Workflows.
 * https://api.slack.com/future/functions/custom
 */
export const OneTwoFourIntroductionDefinition = DefineFunction({
  callback_id: "one_two_four_function",
  title: "1-2-4",
  description: "1-2-4 Exercise",
  source_file: "functions/one_two_four_introduction.ts",
  input_parameters: {
    properties: {
      prompt: {
        type: Schema.types.string,
        description: "Prompt for 1-2-4",
      },
    },
    required: ["prompt"],
  },
  output_parameters: {
    properties: {
      prompt: {
        type: Schema.types.string,
        description: "Prompt for 1-2-4 session",
      },
    },
    required: ["prompt"],
  },
});

export default SlackFunction(
  OneTwoFourIntroductionDefinition,
  ({ inputs }) => {
      const prompt = `@here Let's do a 1-2-4 exercise!  React to this message within the next 1 minute to join.  Think about your own answer to this prompt while you wait.\n\n> ${inputs.prompt}`;
      return { outputs: {prompt} };
  },
);
