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
    let whenPromptWillBeSent = `to the channel in *${inputs.delay} minute(s)*.`
    if (inputs.delay === 0) {
      whenPromptWillBeSent = "to the channel now."
    }
    const prompt = `:one::two::four:

A one-two-four-all activity will be posted ${whenPromptWillBeSent}. This activity involves Slack \
huddles in pairs, in small groups, and in the thread. React with a slack emoji within the time \
limit to join the synchronous discussion or follow up later. Participants will \
discuss and share ideas in huddles and then in a thread, with notes sent after \
the activity.

<https://raw.githubusercontent.com/jaresty/liberating-structures/main/assets/reaction-demo.gif|demo>
`
    return { outputs: { prompt } };
  },
);
