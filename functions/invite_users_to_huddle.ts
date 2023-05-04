
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const InviteUsersToHuddleDefinition = DefineFunction({
    callback_id: "invite_users_to_huddle",
    title: "Invite Users to Huddle",
    description: "invite grouped users to huddles",
    source_file: "functions/invite_users_to_huddle.ts",
    input_parameters: {
        properties: {
            channel_id: {
                type: Schema.slack.types.channel_id,
                description: "the channel to invite in"
            },
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
        required: ["matches", "channel_id"],
    },
    output_parameters: {
        properties: {},
        required: [],
    }
})

export default SlackFunction(
    InviteUsersToHuddleDefinition,
    async ({ inputs, client }) => {
        await Promise.all(inputs.matches.map(async (userIds: string) => {
            const conversation = await client.conversations.open({
                users: userIds
            })
            // Get the conversation ID of the huddle
            const conversationId = conversation.channel.id;
            client.chat.postMessage({
                channel: conversationId,
                text: `> ${inputs.prompt}

_${inputs.instructions}_`
            });
        }));
        return { outputs: { prompt } };
    },
);
