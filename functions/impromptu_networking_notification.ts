import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in Workflows.
 * https://api.slack.com/future/functions/custom
 */
export const ImpromptuNetworkingNotificationDefinition = DefineFunction({
  callback_id: "impromptu_networking_notification",
  title: "Impromptu Networking Notification",
  description: "Impromptu Networking Notification",
  source_file: "functions/impromptu_networking_notification.ts",
  input_parameters: {
    properties: {
      prompt: {
        type: Schema.types.string,
        description: "Prompt for impromptu networking",
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
  ImpromptuNetworkingNotificationDefinition,
  ({ inputs }) => {
    let whenPromptWillBeSent = `I will be sending a prompt to the channel in *${inputs.delay} minute(s)*.`
    if (inputs.delay === 0) {
      whenPromptWillBeSent = "I am about to send a prompt to the channel."
    }
    const prompt = whenPromptWillBeSent +
      " The prompt was just submitted by someone in this channel.\n\n" +
      ` _Use a slack emoji to react to the message I will send_ within *${inputs.reaction_time} minutes* ` +
      "of it being sent to join in an impromptu networking activity.\n\n" +
      " The activity works like this:\n\n" +
      "1. I will post a prompt here.\n" +
      "2. Interested users can react to the prompt. (not this message)\n" +
      "3. When time is up, I will put participants into pairs to huddle and discuss for a five minute huddle.\n" +
      "4. When time is up, I will put participants into pairs again to huddle and discuss for another five minute huddle.\n" +
      "5. That's it!\n\n" +
      ":hourglass: :hourglass: :hourglass: :hourglass: :hourglass: \n"
    return { outputs: { prompt } };
  },
);
