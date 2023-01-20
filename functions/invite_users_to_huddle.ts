
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
                description: "groupings of users to match in a huddle",
            },
            prompt: {
                type: Schema.types.string,
                description: "Prompt to send",
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
        inputs.matches.forEach(async (userIds: string) => {
            const userNames = await Promise.all(userIds.split(',').map(async (userId) => {
                const result = await client.users.info({user: userId})
                return `<@${result.user.name}>`
            }))
            const usersToNotify = userNames.join(' ')
            const postMessageResponse = client.chat.postMessage({
                channel: inputs.channel_id,
                text: `Hey there ${usersToNotify}! You are invited to join a huddle in this thread.: ` +
                    '. We will be discussing this prompt:\n\n' +
                    `> ${inputs.prompt}\n\n` +
                    'Click "Start Huddle in Thread" under the menu to the right on this message to join.'
            });
        });

        return { outputs: {prompt} };
    },
);
