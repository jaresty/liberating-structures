import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const JoinAllUsersDefinition = DefineFunction({
    callback_id: "join_all_users",
    title: "Join All Users",
    description: "join all users into one group",
    source_file: "functions/join_all_users.ts",
    input_parameters: {
        properties: {
            users: {
                type: Schema.types.array,
                items: {
                    type: Schema.slack.types.user_id,
                },
                description: "an array of user ids to join",
            }
        },
        required: ["users"],
    },
    output_parameters: {
        properties: {
            allUsers: {
                type: Schema.types.array,
                description: "An array of strings of comma-separated user_ids",
                items: {
                    type: Schema.types.string,
                },
            },
        },
        required: ["allUsers"],
    }
})

export default SlackFunction(
    JoinAllUsersDefinition,
    ({ inputs }) => {
        const allUsers: string[] = [];
        if(inputs.users.length > 0) {
            allUsers.push(inputs.users.join(','))
        }
        console.log("allUsers", allUsers)
        return { outputs: {allUsers}}
    },
);
