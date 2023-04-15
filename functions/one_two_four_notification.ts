import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in Workflows.
 * https://api.slack.com/future/functions/custom
 */
export const OneTwoFourNotificationDefinition = DefineFunction({
  callback_id: "one_two_four_notification",
  title: "1-2-4 Notification",
  description: "1-2-4 Notification",
  source_file: "functions/one_two_four_notification.ts",
  input_parameters: {
    properties: {
      prompt: {
        type: Schema.types.string,
        description: "Prompt for 1-2-4-All",
      },
      delay: {
        type: Schema.types.number,
        description: "How many minutes to delay before sending the prompt",
      },
      reaction_time: {
        type: Schema.types.number,
        description: "How many minutes to wait for reactions",
      }
    },
    required: ["prompt", "delay"],
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
  OneTwoFourNotificationDefinition,
  ({ inputs }) => {
    let whenPromptWillBeSent = `I will be sending a prompt to the channel in *${inputs.delay} minute(s)*.`
    if (inputs.delay === 0) {
      whenPromptWillBeSent = "I am about to send a prompt to the channel."
    }
    const prompt = ":one::two::four:\n\n" +
      whenPromptWillBeSent +
      " The prompt was just submitted by someone in this channel.\n\n" +
      ` _Use a slack emoji to react to the message I will send_ within *${inputs.reaction_time} minutes* ` +
      "of it being sent to join in a one-two-four synchronous discussion; or, follow up in the thread afterwards.\n\n" +
      "The activity works like this:\n\n" +
      "1. I will post a prompt here.\n" +
      "2. Interested users can react to the prompt. (not this message)\n" +
      "3. When time is up, I will put participants into pairs to huddle and discuss.\n" +
      "4. After two minutes, I will put participants into groups of four to put together their ideas.\n" +
      "5. After four minutes, I will ask all participants to huddle in a thread to discuss outcomes from each group.\n" +
      "6. After five minutes, I will send a message to the thread to jot down notes from the discussion so folks who could not participate synchronously can follow up later.\n" +
      ":hourglass: :hourglass: :hourglass: :hourglass: :hourglass: \n"
    return { outputs: { prompt } };
  },
);
