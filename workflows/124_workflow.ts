import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "../functions/get_reactors.ts";
import { InviteUsersToHuddleDefinition } from "../functions/invite_users_to_huddle.ts";
import { MatchUsersDefinition } from "../functions/match_users.ts";
import { DeleteMessageDefinition } from "../functions/delete_message_function.ts";
import { OneTwoFourNotificationDefinition } from "../functions/one_two_four_notification.ts";
import { UpdateMessageDefinition } from "../functions/update_message_function.ts";

/**
 * A Workflow is a set of steps that are executed in order.
 * Each step in a Workflow is a function.
 * https://api.slack.com/future/workflows
 */
const OneTwoFourWorkflow = DefineWorkflow({
  callback_id: "onetwofour_workflow",
  title: "1-2-4-All Workflow",
  description: "Start 1-2-4-All",
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
    title: "Start 1-2-4-All",
    interactivity: OneTwoFourWorkflow.inputs.interactivity,
    submit_label: "Start 1-2-4-All",
    description: "Start a 1-2-4-All session. All users who react with a slack emoji to " +
      "this prompt will be grouped into pairs at random, then combined into groups of 4-7, " +
      "and finally into one large group to huddle and discuss the prompt. " +
      "This is based on the liberating structures 1-2-4-All exercise defined at " +
      "https://www.liberatingstructures.com/1-1-2-4-all/",
    fields: {
      elements: [{
        name: "prompt",
        title: "Prompt",
        long: true,
        type: Schema.types.string,
        description: "Ask a question in response to the presentation of an" +
          " issue, or about a problem to resolve or a proposal put forward (e.g., " +
          "What opportunities do YOU see for making progress on this challenge? How" +
          " would you handle this situation ? What ideas or actions do you " +
          " recommend?)"
      },
      {
        name: "delay",
        title: "Delay before posting",
        type: Schema.types.number,
        description: `How many minutes to delay after submission before posting the prompt. \
It's like sending a surprise conversation to your future self; or, if you aren't available then - to someone else.`,
        default: 0,
      },
      {
        name: "reaction_time",
        title: "Reaction Time",
        type: Schema.types.number,
        description: "How many minutes to wait for reactions before starting the activity.",
        default: 2,
      }],
      required: ["delay", "prompt", "reaction_time"],
    },
  },
);

const prepareIntroductoryMessage = OneTwoFourWorkflow.addStep(
  OneTwoFourNotificationDefinition,
  {
    prompt: inputForm.outputs.fields.prompt,
    reaction_time: inputForm.outputs.fields.reaction_time,
    delay: inputForm.outputs.fields.delay,
  },
);

const sendIntroductoryMessageStep = OneTwoFourWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: OneTwoFourWorkflow.inputs.channel_id,
  message: prepareIntroductoryMessage.outputs.prompt,
});

OneTwoFourWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: inputForm.outputs.fields.delay,
    }
)

const attributedPrompt = `From <@${OneTwoFourWorkflow.inputs.interactivity.interactor.id}>: ${inputForm.outputs.fields.prompt}`
const sendMessageStep = OneTwoFourWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: OneTwoFourWorkflow.inputs.channel_id,
  message: `${attributedPrompt}
> Within the next *${inputForm.outputs.fields.reaction_time} minute(s)*, \
react to this message with a Slack emoji to join in this one-two-four activity; \
or, follow up in the thread afterwards. (liberating-structures, one-two-four)"
`
});

OneTwoFourWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: inputForm.outputs.fields.reaction_time,
    }
)

OneTwoFourWorkflow.addStep(
  DeleteMessageDefinition,
  {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    message_ts: sendIntroductoryMessageStep.outputs.message_context.message_ts
  },
);

OneTwoFourWorkflow.addStep(
  UpdateMessageDefinition,
  {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    message_ts: sendMessageStep.outputs.message_context.message_ts,
    text: attributedPrompt
  }
)

OneTwoFourWorkflow.addStep(Schema.slack.functions.ReplyInThread, {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: "1-2-4-All Exercise has begun. If you missed the the opportunity to react this time - please join in the text discussion in the thread or feel free to post this prompt again.",
});

const getReactorsStep = OneTwoFourWorkflow.addStep(
    GetReactorsDefinition, {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    timestamp: sendMessageStep.outputs.message_context.message_ts,
});

// const getReactorsStep = {
//   outputs: {
//         users: ['U04HP52TRLY'] // ,U027J95T3LG'], // getReactorsStep.outputs.users,
//   }
// }

const pairUsers = OneTwoFourWorkflow.addStep(MatchUsersDefinition, {
    users: getReactorsStep.outputs.users,
})

OneTwoFourWorkflow.addStep(
  InviteUsersToHuddleDefinition, {
  channel_id: OneTwoFourWorkflow.inputs.channel_id,
  matches: pairUsers.outputs.matches,
  prompt: inputForm.outputs.fields.prompt,
  instructions: "Generate ideas in pairs, building on ideas from self-reflection. 2 min"
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
  instructions: "Share and develop ideas from your pair in foursomes (notice similarities and differences). 4 min."
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
    message: `Small group breakouts complete. Please start a huddle in the thread now by selecting the action under from the thread context menu above the thread. \
Ask, “What is one idea that stood out in your conversation?” Each group shares one important idea with all. 5 min.`
});

OneTwoFourWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: 5,
    }
)


OneTwoFourWorkflow.addStep(Schema.slack.functions.ReplyInThread, {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: "1-2-4 Exercise Complete.  Please share any takeaways here.",
});

export default OneTwoFourWorkflow;
