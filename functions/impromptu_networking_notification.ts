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
    let whenPromptWillBeSent = `I will send it to the channel in *${inputs.delay} minute(s)*.`
    if (inputs.delay === 0) {
      whenPromptWillBeSent = "I am sending it to the channel now."
    }
    const prompt = `:knot::knot::knot::knot::knot:
A prompt for impromptu networking was just submitted. ${whenPromptWillBeSent}

_Use a slack emoji to react_ to the message I send,
_within ${inputs.reaction_time} minutes_
to join in the impromptu networking activity.

The activity works like this:

1. I will post the prompt.
2. Interested users can react to that message. (not this one)
3. When time is up, I will put participants into pairs to huddle and discuss for a five minute huddle.
4. When time is up, I will put participants into pairs again to huddle and discuss for another five minute huddle.
5. That's it!

:hourglass: :hourglass: :hourglass: :hourglass: :hourglass:
`

    return { outputs: { prompt } };
  },
);
