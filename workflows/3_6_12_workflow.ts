import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "../functions/get_reactors.ts";
import { SendMessageToGroupsDefinition } from "../functions/send_message_to_groups.ts";
import { MatchUsersDefinition } from "../functions/match_users.ts";
import { DeleteMessageDefinition } from "../functions/delete_message_function.ts";
import { ThreeSixTwelveNotificationDefinition } from "../functions/three_six_twelve_notification.ts";
import { UpdateMessageDefinition } from "../functions/update_message_function.ts";
import { SendMessageIfDelayedDefinition } from "../functions/send_message_if_delayed.ts";
import { DisplayUsersDefinition } from "../functions/display_users.ts";

/**
 * A Workflow is a set of steps that are executed in order.
 * Each step in a Workflow is a function.
 * https://api.slack.com/future/workflows
 */
const ThreeSixTwelveWorkflow = DefineWorkflow({
  callback_id: "threesixtwelve_workflow",
  title: "3-6-12 Workflow",
  description: "Start 3-6-12",
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
const inputForm = ThreeSixTwelveWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Start 3-6-12",
    interactivity: ThreeSixTwelveWorkflow.inputs.interactivity,
    submit_label: "Start 3-6-12",
    description:
      "Start a 3-6-12 session. All users who react with a slack emoji to " +
      "this prompt will be grouped into pairs at random, then combined into groups of 4-7, " +
      "and finally into one large group to huddle and discuss the prompt. ",
    fields: {
      elements: [
        {
          name: "prompt",
          title: "Prompt",
          long: true,
          type: Schema.types.string,
          description:
            "Ask a question in response to the presentation of an" +
            " issue, or about a problem to resolve or a proposal put forward (e.g., " +
            "What opportunities do YOU see for making progress on this challenge? How" +
            " would you handle this situation ? What ideas or actions do you " +
            " recommend?)",
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
          description:
            "How many minutes to wait for reactions before starting the activity.",
          default: 2,
        },
      ],
      required: ["delay", "prompt", "reaction_time"],
    },
  },
);

const prepareIntroductoryMessage = ThreeSixTwelveWorkflow.addStep(
  ThreeSixTwelveNotificationDefinition,
  {
    prompt: inputForm.outputs.fields.prompt,
    reaction_time: inputForm.outputs.fields.reaction_time,
    delay: inputForm.outputs.fields.delay,
  },
);

const sendIntroductoryMessageStep = ThreeSixTwelveWorkflow.addStep(
  SendMessageIfDelayedDefinition,
  {
    channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
    message: prepareIntroductoryMessage.outputs.prompt,
    delay: inputForm.outputs.fields.delay,
  },
);

ThreeSixTwelveWorkflow.addStep(Schema.slack.functions.Delay, {
  minutes_to_delay: inputForm.outputs.fields.delay,
});

const attributedPrompt = `> ${inputForm.outputs.fields.prompt}
- <@${ThreeSixTwelveWorkflow.inputs.interactivity.interactor.id}>`;
const sendMessageStep = ThreeSixTwelveWorkflow.addStep(
  Schema.slack.functions.SendMessage,
  {
    channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
    message: `${attributedPrompt}


_Within the next *${inputForm.outputs.fields.reaction_time} minute(s)*, \
react to this message with a Slack emoji to join in this three-six-twelve activity; \
or, follow up in the thread afterwards. (liberating-structures)_"
`,
  },
);

const firstReply = ThreeSixTwelveWorkflow.addStep(
  Schema.slack.functions.ReplyInThread,
  {
    channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: `While you wait for the 3-6-12 Exercise to begin, please answer the prompt on your own in this thread.`,
  },
);

ThreeSixTwelveWorkflow.addStep(Schema.slack.functions.Delay, {
  minutes_to_delay: inputForm.outputs.fields.reaction_time,
});

ThreeSixTwelveWorkflow.addStep(DeleteMessageDefinition, {
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_ts: sendIntroductoryMessageStep.outputs.ts,
});

ThreeSixTwelveWorkflow.addStep(UpdateMessageDefinition, {
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_ts: sendMessageStep.outputs.message_context.message_ts,
  text: attributedPrompt,
});

const getReactorsStep = ThreeSixTwelveWorkflow.addStep(GetReactorsDefinition, {
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  timestamp: sendMessageStep.outputs.message_context.message_ts,
});

const displayUsers = ThreeSixTwelveWorkflow.addStep(DisplayUsersDefinition, {
  users: getReactorsStep.outputs.users,
});

ThreeSixTwelveWorkflow.addStep(Schema.slack.functions.ReplyInThread, {
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_context: sendMessageStep.outputs.message_context,
  message: `Participants: ${displayUsers.outputs.display_users}`,
});

ThreeSixTwelveWorkflow.addStep(UpdateMessageDefinition, {
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_ts: firstReply.outputs.message_context.message_ts,
  text: `3-6-12 Exercise has begun. \
If you missed the the opportunity to react this time - \
please join in the text discussion in the thread or feel free to post this prompt again. \
Participants - please any takeaways in this thread as you go.`,
});

const pairUsers = ThreeSixTwelveWorkflow.addStep(MatchUsersDefinition, {
  users: getReactorsStep.outputs.users,
});

ThreeSixTwelveWorkflow.addStep(SendMessageToGroupsDefinition, {
  matches: pairUsers.outputs.matches,
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_ts: firstReply.outputs.message_context.message_ts,
  instructions: `> ${inputForm.outputs.fields.prompt}

_Hey there! You are invited to join this huddle to discuss. Please leave any existing huddles and click "Join Huddle" to join a huddle with your pair(s). Generate ideas in pairs, building on ideas from self-reflection. 2 min_`,
});

const pairTimeMessage = ThreeSixTwelveWorkflow.addStep(
  Schema.slack.functions.ReplyInThread,
  {
    channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: `Pair discussions started. These will last 6 minutes.`,
  },
);

ThreeSixTwelveWorkflow.addStep(Schema.slack.functions.Delay, {
  minutes_to_delay: 6,
});

ThreeSixTwelveWorkflow.addStep(DeleteMessageDefinition, {
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_ts: pairTimeMessage.outputs.message_context.message_ts,
});

ThreeSixTwelveWorkflow.addStep(SendMessageToGroupsDefinition, {
  matches: pairUsers.outputs.matches,
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_ts: firstReply.outputs.message_context.message_ts,
  instructions: `_Pair discussions complete. Look for an invitation to a small group huddle._`,
});

const groupUsers = ThreeSixTwelveWorkflow.addStep(MatchUsersDefinition, {
  users: pairUsers.outputs.matches,
});

ThreeSixTwelveWorkflow.addStep(SendMessageToGroupsDefinition, {
  matches: groupUsers.outputs.matches,
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_ts: firstReply.outputs.message_context.message_ts,
  instructions: `> ${inputForm.outputs.fields.prompt}

_Hey there! You are invited to join this huddle to discuss. Please leave any existing huddles and click "Join Huddle" to join a huddle with your group. Share and develop ideas from your pair in foursomes (notice similarities and differences). 4 min._`,
});

const smallGroupTimeMessage = ThreeSixTwelveWorkflow.addStep(
  Schema.slack.functions.ReplyInThread,
  {
    channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: `Small group discussions started. These will last 12 minutes.`,
  },
);

ThreeSixTwelveWorkflow.addStep(Schema.slack.functions.Delay, {
  minutes_to_delay: 12,
});

ThreeSixTwelveWorkflow.addStep(DeleteMessageDefinition, {
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_ts: smallGroupTimeMessage.outputs.message_context.message_ts,
});

ThreeSixTwelveWorkflow.addStep(SendMessageToGroupsDefinition, {
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_ts: firstReply.outputs.message_context.message_ts,
  matches: groupUsers.outputs.matches,
  instructions: `_Small group discussions complete. Please return to the original channel to start a huddle in the thread there._`,
});

const allBreakoutMessage = ThreeSixTwelveWorkflow.addStep(
  Schema.slack.functions.ReplyInThread,
  {
    channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: `Small group breakouts complete.`,
  },
);

ThreeSixTwelveWorkflow.addStep(Schema.slack.functions.Delay, {
  minutes_to_delay: 5,
});

ThreeSixTwelveWorkflow.addStep(DeleteMessageDefinition, {
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_ts: allBreakoutMessage.outputs.message_context.message_ts,
});

ThreeSixTwelveWorkflow.addStep(UpdateMessageDefinition, {
  channel_id: ThreeSixTwelveWorkflow.inputs.channel_id,
  message_ts: firstReply.outputs.message_context.message_ts,
  text: "3-6-12 Exercise Complete.  Please share any takeaways here, respond to the prompt asynchronously, or start this activity over by submitting it again.",
});

export default ThreeSixTwelveWorkflow;
