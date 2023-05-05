import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "../functions/get_reactors.ts";
import { SendMessageToGroupsDefinition } from "../functions/send_message_to_groups.ts";
import { DeleteMessageDefinition } from "../functions/delete_message_function.ts";
import { UpdateMessageDefinition } from "../functions/update_message_function.ts";
import { SendMessageIfDelayedDefinition } from "../functions/send_message_if_delayed.ts";
import { ImpromptuWorkshopNotificationDefinition } from "../functions/impromptu_workshop_notification.ts";
import { JoinUsersDefinition } from "../functions/join_users.ts";

/**
 * A Workflow is a set of steps that are executed in order.
 * Each step in a Workflow is a function.
 * https://api.slack.com/future/workflows
 */
const ImpromptuWorkshopWorkflow = DefineWorkflow({
  callback_id: "impromptu_workshop_workflow",
  title: "Impromptu Workshop",
  description: "Start Impromptu Workshop",
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
const inputForm = ImpromptuWorkshopWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Start Workshop Session",
    interactivity: ImpromptuWorkshopWorkflow.inputs.interactivity,
    submit_label: "Start Workshop",
    description: "Start an Impromptu Workshop session. All users who react with a slack emoji to this prompt will sent an invitation" +
      " to join a slack huddle.",
    fields: {
      elements: [
        {
          name: "prompt",
          title: "Prompt",
          long: true,
          type: Schema.types.string,
          description: 'What will we discuss?'
        },
        {
          name: "delay",
          title: "Delay before posting",
          type: Schema.types.number,
          description: "How many minutes to delay after submission before posting the prompt. It's like sending a surprise conversation to your future self!",
          default: 0,
        },
        {
          name: "reaction_time",
          title: "Reaction Time",
          type: Schema.types.number,
          description: "How many minutes to wait for reactions before starting the activity.",
          default: 2,
        }
      ],
      required: ["prompt", "delay", "reaction_time",],
    },
  },
);

const rounds = 1;

const prepareIntroductoryMessage = ImpromptuWorkshopWorkflow.addStep(
  ImpromptuWorkshopNotificationDefinition,
  {
    prompt: inputForm.outputs.fields.prompt,
    reaction_time: inputForm.outputs.fields.reaction_time,
    delay: inputForm.outputs.fields.delay,
  },
);

const sendIntroductoryMessageStep = ImpromptuWorkshopWorkflow.addStep(
  SendMessageIfDelayedDefinition,
  {
    channel_id: ImpromptuWorkshopWorkflow.inputs.channel_id,
    message: prepareIntroductoryMessage.outputs.prompt,
    delay: inputForm.outputs.fields.delay,
  }
);

ImpromptuWorkshopWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: inputForm.outputs.fields.delay,
    }
)

const attributedPrompt = `> ${inputForm.outputs.fields.prompt}
 - <@${ImpromptuWorkshopWorkflow.inputs.interactivity.interactor.id}> `
const sendMessageStep = ImpromptuWorkshopWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: ImpromptuWorkshopWorkflow.inputs.channel_id,
  message: `${attributedPrompt}


_Within * ${inputForm.outputs.fields.reaction_time} minute(s)* \
react to this prompt with a Slack emoji to join our impromptu workshop._
`});

ImpromptuWorkshopWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: inputForm.outputs.fields.reaction_time,
    }
)

ImpromptuWorkshopWorkflow.addStep(
  DeleteMessageDefinition,
  {
    channel_id: ImpromptuWorkshopWorkflow.inputs.channel_id,
    message_ts: sendIntroductoryMessageStep.outputs.ts
  },
);

ImpromptuWorkshopWorkflow.addStep(
  UpdateMessageDefinition,
  {
    channel_id: ImpromptuWorkshopWorkflow.inputs.channel_id,
    message_ts: sendMessageStep.outputs.message_context.message_ts,
    text: attributedPrompt
  }
)

ImpromptuWorkshopWorkflow.addStep(Schema.slack.functions.ReplyInThread, {
    channel_id: ImpromptuWorkshopWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: "Workshop has started. If you missed the the opportunity to react this time - please join in the text discussion in the thread or feel free to post this prompt again.",
});

const getReactorsStep = ImpromptuWorkshopWorkflow.addStep(
    GetReactorsDefinition, {
    channel_id: ImpromptuWorkshopWorkflow.inputs.channel_id,
    timestamp: sendMessageStep.outputs.message_context.message_ts,
});
let joinUsers = ImpromptuWorkshopWorkflow.addStep(JoinUsersDefinition, {
  users: getReactorsStep.outputs.users,
  // users: ['U04HP52TRLY'] // ,U027J95T3LG'], // getReactorsStep.outputs.users,
})

ImpromptuWorkshopWorkflow.addStep(
  SendMessageToGroupsDefinition, {
  matches: joinUsers.outputs.joined_users,
  instructions: `> ${inputForm.outputs.fields.prompt}

_Please join this huddle to participate in this impromptu workshop_`
})

export default ImpromptuWorkshopWorkflow;
