import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "../functions/get_reactors.ts";
import { SendMessageToGroupsDefinition } from "../functions/send_message_to_groups.ts";
import { MatchUsersDefinition } from "../functions/match_users.ts";
import { DeleteMessageDefinition } from "../functions/delete_message_function.ts";
import { UpdateMessageDefinition } from "../functions/update_message_function.ts";
import { SendMessageIfDelayedDefinition } from "../functions/send_message_if_delayed.ts";
import { ImpromptuNetworkingNotificationDefinition } from "../functions/impromptu_networking_notification.ts";

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
      " into pairs at random and given 5 minutes to discuss.  The practice is based on the " +
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

const prepareIntroductoryMessage = ImpromptuNetworkingWorkflow.addStep(
  ImpromptuNetworkingNotificationDefinition,
  {
    prompt: inputForm.outputs.fields.prompt,
    reaction_time: inputForm.outputs.fields.reaction_time,
    delay: inputForm.outputs.fields.delay,
  },
);

const sendIntroductoryMessageStep = ImpromptuNetworkingWorkflow.addStep(
  SendMessageIfDelayedDefinition,
  {
    channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
    message: prepareIntroductoryMessage.outputs.prompt,
    delay: inputForm.outputs.fields.delay,
  }
);

ImpromptuNetworkingWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: inputForm.outputs.fields.delay,
    }
)

const attributedPrompt = `> ${inputForm.outputs.fields.prompt}
 - <@${ImpromptuNetworkingWorkflow.inputs.interactivity.interactor.id}> `
const sendMessageStep = ImpromptuNetworkingWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
  message: `${attributedPrompt}


_Within * ${inputForm.outputs.fields.reaction_time} minute(s)* \
react to this prompt with a Slack emoji to join our impromptu networking session. (liberating-structures, impromptu-networking)_
:knot::knot::knot:
`});

ImpromptuNetworkingWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: inputForm.outputs.fields.reaction_time,
    }
)

ImpromptuNetworkingWorkflow.addStep(
  DeleteMessageDefinition,
  {
    channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
    message_ts: sendIntroductoryMessageStep.outputs.ts
  },
);

ImpromptuNetworkingWorkflow.addStep(
  UpdateMessageDefinition,
  {
    channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
    message_ts: sendMessageStep.outputs.message_context.message_ts,
    text: attributedPrompt
  }
)

ImpromptuNetworkingWorkflow.addStep(Schema.slack.functions.ReplyInThread, {
    channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: "Networking has started. If you missed the the opportunity to react this time - please join in the text discussion in the thread or feel free to post this prompt again.",
});

const getReactorsStep = ImpromptuNetworkingWorkflow.addStep(
    GetReactorsDefinition, {
    channel_id: ImpromptuNetworkingWorkflow.inputs.channel_id,
    timestamp: sendMessageStep.outputs.message_context.message_ts,
});

for(let i=0;i < rounds; i++) {
    let matchUsers = ImpromptuNetworkingWorkflow.addStep(MatchUsersDefinition, {
        users: getReactorsStep.outputs.users,
        // users: ['U04HP52TRLY'] // ,U027J95T3LG'], // getReactorsStep.outputs.users,
    })

  ImpromptuNetworkingWorkflow.addStep(
    SendMessageToGroupsDefinition, {
    matches: matchUsers.outputs.matches,
    instructions: `> ${inputForm.outputs.fields.prompt}

_In each round, 2 minutes per person to answer the questions. 5 min. per round_`
  })

  ImpromptuNetworkingWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
      minutes_to_delay: 5,
    }
  )

  ImpromptuNetworkingWorkflow.addStep(
    SendMessageToGroupsDefinition, {
    matches: matchUsers.outputs.matches,
    instructions: `Networking complete. Thank you for participating!`
  })
}


export default ImpromptuNetworkingWorkflow;
