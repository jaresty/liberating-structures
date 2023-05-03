import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const SendMessageIfDelayedDefinition = DefineFunction({
    callback_id: "send_message_if_delayed",
    title: "Send message if delayed",
    description: "Get the unique list of users who have reacted to a message",
    source_file: "functions/send_message_if_delayed.ts",
    input_parameters: {
        properties: {
            channel_id: {
                type: Schema.slack.types.channel_id,
                description: "The channel_id where the message is",
            },
            message: {
                type: Schema.types.string,
                description: "The message to send",
            },
            delay: {
                type: Schema.types.number,
                description: "The delay that was set"
            }
        },
        required: ["channel_id", "message", "delay"],
    },
    output_parameters: {
        properties: {
            ts: {
                type: Schema.types.string,
                description: "The timestamp of the message"
            }
        },
        required: ["ts"],
    }
})

export default SlackFunction(
    SendMessageIfDelayedDefinition,
    async ({ inputs, client }) => {
        if(inputs.delay > 0) {
            const result = await client.chat.postMessage({ channel: inputs.channel_id, text: inputs.message });
            return {
                outputs: {
                    ts: result.message.ts
                }
            }
        }
        return { outputs: { ts: "-1" } };
    },
);
