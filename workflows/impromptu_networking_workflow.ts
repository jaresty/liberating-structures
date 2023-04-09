import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "../functions/get_reactors.ts";
import { ImpromptuNetworkingFunctionDefinition } from "../functions/impromptu_networking_function.ts";
import { InviteUsersToHuddleDefinition } from "../functions/invite_users_to_huddle.ts";
import { MatchUsersDefinition } from "../functions/match_users.ts";

/**
 * A Workflow is a set of steps that are executed in order.
 * Each step in a Workflow is a function.
 * https://api.slack.com/future/workflows
 */
const ImpromptuNetworkingWorkflow = DefineWorkflow({
  callback_id: "impromptu_networking_workflow",
  title: "Impromptu Networking",
  description: "Start Impromptu Networking",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity"],
  },
});

/**
 * For collecting input from users, we recommend the
 * built-in OpenForm function as a first step.
 * https://api.slack.com/future/functions#open-a-form
 */
const inputForm = ImpromptuNetworkingWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Start Networking Session",
    interactivity: ImpromptuNetworkingWorkflow.inputs.interactivity,
    submit_label: "Start Networking",
    description: "Start an Impromptu Networking session. All users who react with a slack emoji to this prompt will be grouped" +
      " into pairs at random and given 5 minutes to discuss; pairs will be swapped three times.  The practice is based on the " +
      "liberating structures 'Impromptu Networking' exercise defined at https://www.liberatingstructures.com/2-impromptu-networking/",
    fields: {
      elements: [
        {
          name: "prompt",
          title: "Prompt",
          long: true,
          type: Schema.types.string,
          description: 'What will we discuss? Works well with one challenge question and one give-and-take question. ' +
            'Example: "What big challenge do you bring to this gathering ? What do you hope to get from and give to the world today?"'
        },
        {
          name: "wait_time",
          title: "Wait Time",
          type: Schema.types.number,
          description: "How many minutes to wait for reactions before starting the activity.",
          default: 2,
        },
        {
          name: "rounds",
          title: "Rounds",
          type: Schema.types.number,
          description: "Number of rounds of networking to do",
          default: 2,
        },
      ],
      required: ["prompt", "wait_time"],
    },
  },
);

const ImpromptuNetworkingFunctionStep = ImpromptuNetworkingWorkflow.addStep(
  ImpromptuNetworkingFunctionDefinition,
  {
    prompt: inputForm.outputs.fields.prompt,
    wait_time: inputForm.outputs.fields.wait_time,
    rounds: inputForm.outputs.fields.rounds,
  },
);

const sendMessageStep = ImpromptuNetworkingWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
  message: ImpromptuNetworkingFunctionStep.outputs.prompt,
});

ImpromptuNetworkingWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: inputForm.outputs.fields.wait_time,
    }
)

ImpromptuNetworkingWorkflow.addStep(Schema.slack.functions.ReplyInThread, {
    channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: "Networking has started.",
});

const getReactorsStep = ImpromptuNetworkingWorkflow.addStep(
    GetReactorsDefinition, {
    channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
    timestamp: sendMessageStep.outputs.message_context.message_ts,
});

for(let i=0;i < inputForm.outputs.fields.rounds; i++) {
    let matchUsers = ImpromptuNetworkingWorkflow.addStep(MatchUsersDefinition, {
        users: getReactorsStep.outputs.users,
        // users: ['U04HP52TRLY'] // ,U027J95T3LG'], // getReactorsStep.outputs.users,
    })

  ImpromptuNetworkingWorkflow.addStep(
    InviteUsersToHuddleDefinition, {
    channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
    matches: matchUsers.outputs.matches,
    prompt: inputForm.outputs.fields.prompt,
    instructions: "In each round, 2 minutes per person to answer the questions. 5 min. per round"
  })

    if(i+1 < inputForm.outputs.fields.rounds) {
        ImpromptuNetworkingWorkflow.addStep(
            Schema.slack.functions.Delay,
            {
                minutes_to_delay: 5,
            }
        )
    }
}


export default ImpromptuNetworkingWorkflow;
