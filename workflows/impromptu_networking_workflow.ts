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
    fields: {
      elements: [{
        name: "prompt",
        title: "Prompt",
        type: Schema.slack.types.rich_text,
        default: 'What big challenge do you bring to this gathering? What do you hope to get from and give to the world today?',
      }],
      required: ["prompt"],
    },
  },
);

const ImpromptuNetworkingFunctionStep = ImpromptuNetworkingWorkflow.addStep(
  ImpromptuNetworkingFunctionDefinition,
  {
    prompt: inputForm.outputs.fields.prompt,
  },
);

const sendMessageStep = ImpromptuNetworkingWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
  message: ImpromptuNetworkingFunctionStep.outputs.prompt,
});

ImpromptuNetworkingWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: 1,
    }
)

const getReactorsStep = ImpromptuNetworkingWorkflow.addStep(
    GetReactorsDefinition, {
    channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
    timestamp: sendMessageStep.outputs.message_ts,
});

for(let i=0;i < 3; i++) {
    let matchUsers = ImpromptuNetworkingWorkflow.addStep(MatchUsersDefinition, {
        users: getReactorsStep.outputs.users,
        // users: ['U04HP52TRLY'] // ,U027J95T3LG'], // getReactorsStep.outputs.users,
    })

    ImpromptuNetworkingWorkflow.addStep(
        InviteUsersToHuddleDefinition, {
        channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
        matches: matchUsers.outputs.matches,
        prompt: inputForm.outputs.fields.prompt,
    })

    if(i < 2) {
        ImpromptuNetworkingWorkflow.addStep(
            Schema.slack.functions.Delay,
            {
                minutes_to_delay: 3,
            }
        )
    }
}


export default ImpromptuNetworkingWorkflow;
