
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const DeleteMessageDefinition = DefineFunction({
    callback_id: "delete_message",
    title: "Delete Message",
    description: "Delete Message",
    source_file: "functions/delete_message_function.ts",
    input_parameters: {
        properties: {
            channel_id: {
                type: Schema.slack.types.channel_id,
                description: "the channel to invite in"
            },
            message_ts: {
                type: Schema.types.string,
                description: "the timestamp of the message to delete"
            },
        },
        required: ["message_ts", "channel_id"],
    },
    output_parameters: {
        properties: {},
        required: [],
    }
})

export default SlackFunction(
    DeleteMessageDefinition,
    async ({ inputs, client }) => {
        if(inputs.message_ts == "-1") {
            return { outputs: {} };
        }
        await client.chat.delete({
            channel: inputs.channel_id,
            ts: inputs.message_ts,
        });
        return { outputs: {} };
    },
);
