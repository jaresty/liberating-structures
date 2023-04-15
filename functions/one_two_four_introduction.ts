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
        description: "Prompt for 1-2-4-All",
      },
      reaction_time: {
        type: Schema.types.number,
        description: "How many minutes to wait for reactions",
      }
    },
    required: ["prompt", "reaction_time"],
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
    const prompt = inputs.prompt + "\n" +
      "> Within the next *" +
      inputs.reaction_time +
      " minute(s)*, react to this message to join in this one-two-four activity; or, follow up in the thread afterwards. (liberating-structures, one-two-four)"
    return { outputs: { prompt } };
  },
);
