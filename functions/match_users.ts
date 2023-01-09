import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const MatchUsersDefinition = DefineFunction({
    callback_id: "match_users",
    title: "Match Users",
    description: "form a random grouping of users",
    source_file: "functions/match_users.ts",
    input_parameters: {
        properties: {
            users: {
                type: Schema.types.array,
                items: {
                    type: Schema.slack.types.user_id,
                },
                description: "the users to match up",
            }
        },
        required: ["users"],
    },
    output_parameters: {
        properties: {
            matches: {
                type: Schema.types.array,
                description: "An array of strings of comma-separated user_ids",
                items: {
                    type: Schema.types.string,
                },
            },
        },
        required: ["matches"],
    }
})

export default SlackFunction(
    MatchUsersDefinition,
    ({ inputs }) => {
        console.log(inputs);
        let users: string[] = inputs.users;
        // Step 2
        let matches: string[][] = [];

        // Step 3
        inputs.users.sort(() => Math.random() - 0.5);

        // Step 4
        let i = 0;
        if (inputs.users.length == 1) {
            matches.push([users[i]])
            i += 1;

        } else if (inputs.users.length % 2 === 1) {
            matches.push([users[i], users[i + 1], users[i + 2]]);
            i += 3;
        }
        while (i < inputs.users.length) {
            matches.push([users[i], users[i + 1]]);
            console.log(matches);
            i += 2;
        }
        const result = {matches: matches.map((items) => items.join(','))};

        return { outputs: result };
    },
);
