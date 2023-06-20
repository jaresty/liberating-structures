import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const DisplayUsersDefinition = DefineFunction({
    callback_id: "display_users",
    title: "Display Users",
    description: "display an array of user ids",
    source_file: "functions/display_users.ts",
    input_parameters: {
        properties: {
            users: {
                type: Schema.types.array,
                items: {
                    type: Schema.slack.types.user_id,
                },
                description: "the users to display",
            }
        },
        required: ["users"],
    },
    output_parameters: {
        properties: {
            display_users: {
                type: Schema.types.string,
                description: "A string of the user IDs to display",
            },
        },
        required: ["display_users"],
    }
})

export default SlackFunction(
    DisplayUsersDefinition,
    ({ inputs }) => {
        if(inputs.users.length == 0) {
            return { outputs: { display_users: "" }};
        }
        const display_users = inputs.users.map((user_id) => `<@${user_id}>`).join(',');
        return { outputs: { display_users }};
    },
);
