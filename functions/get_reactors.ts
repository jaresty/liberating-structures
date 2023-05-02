import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const GetReactorsDefinition = DefineFunction({
    callback_id: "get_reactors",
    title: "Get Reactors",
    description: "Get the unique list of users who have reacted to a message",
    source_file: "functions/get_reactors.ts",
    input_parameters: {
        properties: {
            channel_id: {
                type: Schema.slack.types.channel_id,
                description: "The channel_id where the message is",
            },
            timestamp: {
                type: Schema.types.string,
                description: "The timestamp of the message",
            }
        },
        required: ["channel_id", "timestamp"],
    },
    output_parameters: {
        properties: {
            users: {
                type: Schema.types.array,
                items: {
                    type: Schema.slack.types.user_id,
                },
                description: "An array of user_ids",
            },
        },
        required: ["users"],
    }
})

export default SlackFunction(
    GetReactorsDefinition,
    async ({ inputs, client }) => {
        console.log(inputs);
        const response = await client.reactions.get({ channel: inputs.channel_id, timestamp: inputs.timestamp, full: true })
        console.log(response);
        // Create a Set to store the unique user IDs
        const userSet = new Set<string>();
        if(response.ok === false) {
            console.log(response);
            return {outputs: {users: []}};
        }
        const reactions = response.message.reactions;
        if(reactions === undefined) {
            return {outputs:  {users: []}};
        }
        console.log(reactions);
        // Iterate over the reactions
        for (const reaction of reactions) {
            const users = reaction.users;

            // Add each user ID to the Set
            for (const user of users) {
                userSet.add(user);
            }
        }
        let users = Array.from(userSet);
        console.log(users);
        if(users.length == 1) {
            users = []; // no point in networking if only one respondent
        }
        return { outputs: { users } };
    },
);
