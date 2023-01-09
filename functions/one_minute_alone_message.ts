import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in Workflows.
 * https://api.slack.com/future/functions/custom
 */
export const OneTwoFourOneMinuteAlone = DefineFunction({
  callback_id: "one_minute_alone_message",
  title: "1-2-4 One Minute Alone",
  description: "1-2-4 One Minute Alone",
  source_file: "functions/one_minute_alone_message.ts",
  input_parameters: {
    properties: {
      prompt: {
        type: Schema.types.string,
        description: "Prompt for 1-2-4",
      },
        participants: {
            type: Schema.types.array,
            items: {
                type: Schema.slack.types.user_id,
            },
            description: "The participants in the exercise",
        }
    },
    required: ["prompt"],
  },
  output_parameters: {
      properties: {},
      required: [],
  },
});

export default SlackFunction(
  OneTwoFourOneMinuteAlone,
  ({ inputs, client }) => {
      console.log(inputs);
      (inputs.participants || []).forEach((user: string) => {
          console.log("Sending message to " + user);
          client.chat.postMessage({
              channel: user,
              text: "Hey there!  Thanks for joining this 1-2-4 session. Please spend the next 1-minute thinking about this prompt:\n\n" +
                  `> ${inputs.prompt}`
          });
      })
      return { outputs: {prompt} };
  },
);
