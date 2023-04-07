import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "../functions/get_reactors.ts";
import { InviteUsersToHuddleDefinition } from "../functions/invite_users_to_huddle.ts";
import { MatchUsersDefinition } from "../functions/match_users.ts";
import { OneTwoFourIntroductionDefinition } from "../functions/one_two_four_introduction.ts";

/**
 * A Workflow is a set of steps that are executed in order.
 * Each step in a Workflow is a function.
 * https://api.slack.com/future/workflows
 */
const OneTwoFourWorkflow = DefineWorkflow({
  callback_id: "onetwofour_workflow",
  title: "124 Workflow",
  description: "Start 1-2-4",
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
const inputForm = OneTwoFourWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Start 1-2-4",
    interactivity: OneTwoFourWorkflow.inputs.interactivity,
    submit_label: "Start 1-2-4",
    fields: {
      elements: [{
        name: "prompt",
        title: "Prompt",
        long: true,
        type: Schema.types.string,
      }],
      required: ["prompt"],
    },
  },
);

const greetingFunctionStep = OneTwoFourWorkflow.addStep(
  OneTwoFourIntroductionDefinition,
  {
    prompt: inputForm.outputs.fields.prompt,
  },
);

const sendMessageStep = OneTwoFourWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: OneTwoFourWorkflow.inputs.channel_id,
  message: greetingFunctionStep.outputs.prompt,
});

OneTwoFourWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: 1,
    }
)

OneTwoFourWorkflow.addStep(Schema.slack.functions.ReplyInThread, {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: "1-2-4 Exercise has begun.",
});

const getReactorsStep = OneTwoFourWorkflow.addStep(
    GetReactorsDefinition, {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    timestamp: sendMessageStep.outputs.message_context.message_ts,
});

const pairUsers = OneTwoFourWorkflow.addStep(MatchUsersDefinition, {
    users: getReactorsStep.outputs.users,
})

OneTwoFourWorkflow.addStep(
    InviteUsersToHuddleDefinition, {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    matches: pairUsers.outputs.matches,
    prompt: inputForm.outputs.fields.prompt,
})

OneTwoFourWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: 2,
    }
)

const groupUsers = OneTwoFourWorkflow.addStep(MatchUsersDefinition, {
    users: pairUsers.outputs.matches,
})

OneTwoFourWorkflow.addStep(
    InviteUsersToHuddleDefinition, {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    matches: groupUsers.outputs.matches,
    prompt: inputForm.outputs.fields.prompt,
})

OneTwoFourWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: 4,
    }
)

OneTwoFourWorkflow.addStep(Schema.slack.functions.ReplyInThread, {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: "1-2-4 Exercise Complete.  Please share any takeaways here.",
});

export default OneTwoFourWorkflow;
