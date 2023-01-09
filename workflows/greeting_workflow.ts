import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "../functions/get_reactors.ts";
import { GreetingFunctionDefinition } from "../functions/greeting_function.ts";
import { InviteUsersToHuddleDefinition } from "../functions/invite_users_to_huddle.ts";
import { MatchUsersDefinition } from "../functions/match_users.ts";

/**
 * A Workflow is a set of steps that are executed in order.
 * Each step in a Workflow is a function.
 * https://api.slack.com/future/workflows
 */
const GreetingWorkflow = DefineWorkflow({
  callback_id: "greeting_workflow",
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
const inputForm = GreetingWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Start Networking Session",
    interactivity: GreetingWorkflow.inputs.interactivity,
    submit_label: "Start Networking",
    fields: {
      elements: [{
        name: "prompt",
        title: "Prompt",
        type: Schema.types.string,
      }],
      // {
      //     name: "rounds",
      //     title: "Number of rounds",
      //     type: Schema.types.number,
      //     default: 1,
      // }],
      required: ["prompt"], // , "rounds"],
    },
  },
);

const greetingFunctionStep = GreetingWorkflow.addStep(
  GreetingFunctionDefinition,
  {
    prompt: inputForm.outputs.fields.prompt,
  },
);

const sendMessageStep = GreetingWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: GreetingWorkflow.inputs.channel_id,
  message: greetingFunctionStep.outputs.prompt,
});

const waitForReactions = GreetingWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: 1,
    }
)

const getReactorsStep = GreetingWorkflow.addStep(
    GetReactorsDefinition, {
    channel_id: GreetingWorkflow.inputs.channel_id,
    timestamp: sendMessageStep.outputs.message_ts,
});

const matchUsers = GreetingWorkflow.addStep(MatchUsersDefinition, {
    users: getReactorsStep.outputs.users,
    // users: ['U04HP52TRLY'] // ,U027J95T3LG'], // getReactorsStep.outputs.users,
})

const inviteUsersToHuddlesStep = GreetingWorkflow.addStep(
    InviteUsersToHuddleDefinition, {
        matches: matchUsers.outputs.matches,
        prompt: inputForm.outputs.fields.prompt,
    }
)

export default GreetingWorkflow;
