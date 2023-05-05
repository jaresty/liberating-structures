import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const JoinUsersDefinition = DefineFunction({
    callback_id: "join_users",
    title: "Join Users",
    description: "join an array of user ids into a comma-separated string",
    source_file: "functions/join_users.ts",
    input_parameters: {
        properties: {
            users: {
                type: Schema.types.array,
                items: {
                    type: Schema.slack.types.user_id,
                },
                description: "the users to join up",
            }
        },
        required: ["users"],
    },
    output_parameters: {
        properties: {
            joined_users: {
                type: Schema.types.array,
                description: "An array of strings of comma-separated user_ids",
                items: {
                    type: Schema.types.string,
                },
            },
        },
        required: ["joined_users"],
    }
})

export default SlackFunction(
    JoinUsersDefinition,
    ({ inputs }) => {
        if(inputs.users.length == 0) {
            return { outputs: { joined_users: [] }};
        }
        const joined_users = inputs.users.join(',');
        return { outputs: { joined_users: [joined_users] }};
    },
);
