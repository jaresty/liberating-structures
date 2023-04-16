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

export const matchUsers = (initialUsers: string[], randomGenerator=Math) => {
    const userIsGroupOfThree = (user: string) => user.match(/,.+,/)
    // Step 2
    let matches: string[][] = [];
    let groupsOfThree = initialUsers.filter(userIsGroupOfThree)
    if(groupsOfThree.length > 0) {
        matches.push(groupsOfThree)
    }
    console.log("matches",matches)
    console.log("init", initialUsers)
    let users = initialUsers.filter((user) => !userIsGroupOfThree(user))
    console.log("users", users)

    // Step 3
    users.sort(() => randomGenerator.random() - 0.5);
    console.log("Matching users")
    console.log(users)

    // Step 4
    let i = 0;
    if (users.length == 1) {
        matches.push([users[i]])
        i += 1;

    } else if (users.length % 2 === 1) {
        matches.push([users[i], users[i + 1], users[i + 2]]);
        i += 3;
    }
    while (i < users.length) {
        matches.push([users[i], users[i + 1]]);
        i += 2;
    }
    const result = matches.map((items) => items.join(','))

    console.log("result")
    console.log(result)
    return result
}

export default SlackFunction(
    MatchUsersDefinition,
    ({ inputs }) => {
        console.log(inputs);

        return { outputs: { matches: matchUsers(inputs.users) }};
    },
);
