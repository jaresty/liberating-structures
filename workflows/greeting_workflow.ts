import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "../functions/get_reactors.ts";
import { GreetingFunctionDefinition } from "../functions/greeting_function.ts";

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
      required: ["prompt"],
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

const sendReactions = GreetingWorkflow.addStep(MatchUsers, {
    channel_id: GreetingWorkflow.inputs.channel_id,
    participants: getReactorsStep.outputs.users,
})

export default GreetingWorkflow;
