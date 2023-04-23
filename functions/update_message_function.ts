import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const UpdateMessageDefinition = DefineFunction({
    callback_id: "update_message",
    title: "Update Message",
    description: "Update Message",
    source_file: "functions/update_message_function.ts",
    input_parameters: {
        properties: {
            channel_id: {
                type: Schema.slack.types.channel_id,
                description: "the channel to invite in"
            },
            message_ts: {
                type: Schema.types.string,
                description: "the timestamp of the message to update"
            },
            text: {
                type: Schema.types.string,
                description: "the text to update the message"
            }
        },
        required: ["message_ts", "channel_id", "text"],
    },
    output_parameters: {
        properties: {},
        required: [],
    }
})

export default SlackFunction(
    UpdateMessageDefinition,
    async ({ inputs, client }) => {
        const result = await client.chat.update({
            channel: inputs.channel_id,
            ts: inputs.message_ts,
            text: inputs.text,
            blocks: []
        });
        console.log('update', result)
        return { outputs: {} };
    },
);
