
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
    async ({ inputs, client, token, team_id }) => {
        inputs.matches.forEach(async (userIds: string) => {
            const userNames = await Promise.all(userIds.split(',').map(async (userId) => {
                const result = await client.users.info({ user: userId })
                return `<@${result.user.name}>`
            }))
            const usersToNotify = userNames.join(' ')
            const conversationResponse = await client.conversations.open({
                users: userIds,
            })
            if (conversationResponse.ok != true) {
                console.log('Failed to open group DM')
                console.log(conversationResponse.ok)
                console.log(JSON.stringify(conversationResponse, undefined, 2))

                return { outputs: { prompt } };
            }
            const groupMessageResponse = await client.chat.postMessage({
                channel: conversationResponse.channel.id,
                text: `Hey there ${usersToNotify}! You are invited to join a huddle: ` +
                    '. We will be discussing this prompt:\n\n' +
                    `> ${inputs.prompt}\n\n` +
                    'Click the "Huddle" button to start the group discussion.'
            })
            if (groupMessageResponse.ok != true) {
                console.log('group message failed')
                console.log(JSON.stringify(groupMessageResponse, undefined, 2))

                return { outputs: { prompt } };
            }
            // console.log(JSON.stringify(groupMessageResponse, undefined, 2))
            const groupDmLink = `https://app.slack.com/client/${team_id}/${conversationResponse.channel.id}/${groupMessageResponse.ts}`;
            console.log("group message success")
            const postMessageResponse = await client.chat.postMessage({
                channel: inputs.channel_id,
                text: `Hey there ${usersToNotify}! You are invited to join a huddle in this thread.: ` +
                    '. We will be discussing this prompt:\n\n' +
                    `> ${inputs.prompt}\n\n` +
                    `Follow <${groupDmLink}|this link> and start a huddle with your group to join.`
            });
            if (postMessageResponse.ok != true) {
                console.log("postmessage failed")
                console.log(JSON.stringify(postMessageResponse, undefined, 2))
                return { outputs: { prompt } };
            }
            console.log('postmessage success')
        });

        return { outputs: { prompt } };
    },
);
