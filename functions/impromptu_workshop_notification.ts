import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in Workflows.
 * https://api.slack.com/future/functions/custom
 */
export const ImpromptuWorkshopNotificationDefinition = DefineFunction({
  callback_id: "impromptu_workshop_notification",
  title: "Impromptu Workshop Notification",
  description: "Impromptu Workshop Notification",
  source_file: "functions/impromptu_workshop_notification.ts",
  input_parameters: {
    properties: {
      prompt: {
        type: Schema.types.string,
        description: "Prompt for impromptu workshop",
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
        description: "networking workshop notification",
      },
    },
    required: ["prompt"],
  },
});

export default SlackFunction(
  ImpromptuWorkshopNotificationDefinition,
  ({ inputs }) => {
    const postTime = Date.now() + 60000 * inputs.delay
    const timeView = ` at <!date^${Math.floor(postTime/1000)}^{time_secs}|${new Date(postTime)}>`
    let whenPromptWillBeSent = `in *${inputs.delay} minute(s)*${timeView}`
    if (inputs.delay === 0) {
      whenPromptWillBeSent = "to the channel now"
    }
    const prompt = `A prompt for impromptu workshop will be sent ${whenPromptWillBeSent}. \
Use a slack emoji to react to the prompt to join the activity within a set time limit. \
Interested users will be invited to join in the workshop in a slack huddle.
`

    return { outputs: { prompt } };
  },
);
