import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

/**
 * A Workflow is a set of steps that are executed in order.
 * Each step in a Workflow is a function.
 * https://api.slack.com/future/workflows
 */
const WatercoolerWorkflow = DefineWorkflow({
  callback_id: "watercooler_workflow",
  title: "Watercooler",
  description: "Start Watercooler",
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
const inputForm = WatercoolerWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Start Watercooler",
    interactivity: WatercoolerWorkflow.inputs.interactivity,
    submit_label: "Start Watercooler",
    description: "Start a Watercooler session. The prompt you choose will be sent to the channel and you can" +
      " start a hang out at the virtual 'watercooler'.",
    fields: {
      elements: [
        {
          name: "prompt",
          title: "Prompt",
          long: true,
          type: Schema.types.string,
          description: 'What will we discuss?'
        }
      ],
      required: ["prompt"],
    },
  },
);

const attributedPrompt = `From <@${WatercoolerWorkflow.inputs.interactivity.interactor.id}>: ${inputForm.outputs.fields.prompt}`
const sendMessageStep = WatercoolerWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: WatercoolerWorkflow.inputs.channel_id,
  message: `:droplet::droplet::droplet::droplet::droplet:
Virtual Watercooler

${attributedPrompt}`,
});

WatercoolerWorkflow.addStep(Schema.slack.functions.ReplyInThread, {
    channel_id: WatercoolerWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: `Please use the action menu at the top right of the thread to 'Start Huddle in Thread' and wait to see who joins you. \
If your huddle grows to size 4+, you might want to kick off a 1-2-4 or impromptu networking to break out with the group.`,
});

export default WatercoolerWorkflow;
