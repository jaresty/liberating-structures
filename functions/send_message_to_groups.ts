
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const SendMessageToGroupsDefinition = DefineFunction({
    callback_id: "send_message_to_groups_of_users",
    title: "Send message to groups of users",
    description: "send message to groups of users",
    source_file: "functions/send_message_to_groups.ts",
    input_parameters: {
        properties: {
            matches: {
                type: Schema.types.array,
                items: {
                    type: Schema.slack.types.user_id,
                },
                description: "groupings of users to send a message to",
            },
            instructions: {
                type: Schema.types.string,
                description: "instructions for this message",
            }
        },
        required: ["matches", "instructions"],
    },
    output_parameters: {
        properties: {},
        required: [],
    }
})

export default SlackFunction(
    SendMessageToGroupsDefinition,
    async ({ inputs, client }) => {
        await Promise.all(inputs.matches.map(async (userIds: string) => {
            const conversation = await client.conversations.open({
                users: userIds
            })
            // Get the conversation ID of the huddle
            const conversationId = conversation.channel.id;
            client.chat.postMessage({
                channel: conversationId,
                text: inputs.instructions,
            });
        }));
        return { outputs: { prompt } };
    },
);
