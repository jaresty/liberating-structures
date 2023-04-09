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
      wait_time: {
        type: Schema.types.number,
        description: "How many minutes to wait for reactions",
      }
    },
    required: ["prompt", "wait_time"],
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
      "> Don't miss out on the opportunity to participate in a 1-2-4-All exercise!" +
      " Simply react to this message within the next " +
      inputs.wait_time +
      " minute(s) to join in." +
      " The activity will take about 15 minutes." +
      " While you wait, take a moment to think about your response to the prompt." +
      " This activity is based on the liberating-structures approach, which encourages creative thinking and collaboration." +
      " It's a fun and engaging way to explore new ideas. Join us now! (liberating-structures, one-two-four)"
    return { outputs: { prompt } };
  },
);
