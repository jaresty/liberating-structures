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
      }
    },
    required: ["prompt", "wait_time"],
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
      "> Act fast and react to this prompt within the next " +
      inputs.wait_time +
      " minute(s) to be a part of our impromptu networking session." +
      " It's a quick and easy 15-minute activity, and you'll get the chance to meet some new people." +
      " Based on the liberating-structures approach, this session encourages spontaneous interactions and fosters new connections." +
      " Don't miss out on this opportunity to expand your network and socialize with like-minded individuals. (liberating-structures, impromptu-networking)"
    return { outputs: { prompt: outputText } };
  },
);
