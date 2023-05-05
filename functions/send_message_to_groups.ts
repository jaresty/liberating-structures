
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
                    type: Schema.types.string,
                },
                description: "groupings of users to send a message to",
            },
            instructions: {
                type: Schema.types.string,
                description: "instructions for this message",
            },
            channel_id: {
                type: Schema.slack.types.channel_id,
                description: "the channel of the original message"
            },
            message_ts: {
                type: Schema.types.string,
                description: "the timestamp of the original message"
            },
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
        if(inputs.matches.length == 0) {
            console.log("no participants");
            return {outputs: {prompt}}
        }
        await Promise.all(inputs.matches.map(async (userIds: string) => {
            console.log('userids', userIds)
            const conversation = await client.conversations.open({
                users: userIds
            })
            if(conversation.ok == false) {
                console.log(conversation);
                const result = await client.chat.postMessage({
                    channel: inputs.channel_id,
                    thread_ts: inputs.message_ts,
                    text: 'Encountered an error sending huddle invitations.  Please start a huddle in this thread instead.'
                });
                console.log(result);
                return
            }
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
