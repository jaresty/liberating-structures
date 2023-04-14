import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "../functions/get_reactors.ts";
import { InviteUsersToHuddleDefinition } from "../functions/invite_users_to_huddle.ts";
import { MatchUsersDefinition } from "../functions/match_users.ts";
import { OneTwoFourIntroductionDefinition } from "../functions/one_two_four_introduction.ts";
import { JoinAllUsersDefinition } from "../functions/join_all_users.ts";
import { DeleteMessageDefinition } from "../functions/delete_message_function.ts";

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
        name: "wait_time",
        title: "Wait Time",
        type: Schema.types.number,
        description: "How many minutes to wait for reactions before starting the activity.",
        default: 2,
      }],
      required: ["prompt", "wait_time"],
    },
  },
);

const sendIntroductoryMessageStep = OneTwoFourWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: OneTwoFourWorkflow.inputs.channel_id,
  message: "I'm about to send a message to the channel that was just now submitted as a prompt for a 1-2-4 activity." +
    "  React to this message with a slack emoji within the time limit to participate in the synchronous discussion " +
    " or respond in the thread later to keep it going. The 1-2-4 activity works like this:\n\n" +
    "1. I will post a prompt here.\n" +
    "2. Interested users can react to the prompt. (not this message)\n" +
    "3. When time is up, I will put participants into pairs to huddle and discuss.\n" +
    "4. After two minutes, I will put participants into groups of four to put together their ideas.\n" +
    "5. After four minutes, I will put all participants into a group to discuss outcomes from each group.\n" +
    "6. After five minutes, I will send a message to the thread to jot down notes from the discussion so folks who could not participate synchronously can follow up later.\n" +
    ":point_down: :point_down: :point_down: :point_down: :point_down:\n\n"
});

const greetingFunctionStep = OneTwoFourWorkflow.addStep(
  OneTwoFourIntroductionDefinition,
  {
    prompt: inputForm.outputs.fields.prompt,
    wait_time: inputForm.outputs.fields.wait_time,
  },
);

const sendMessageStep = OneTwoFourWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: OneTwoFourWorkflow.inputs.channel_id,
  message: greetingFunctionStep.outputs.prompt,
});

OneTwoFourWorkflow.addStep(
    Schema.slack.functions.Delay,
    {
        minutes_to_delay: inputForm.outputs.fields.wait_time,
    }
)

OneTwoFourWorkflow.addStep(
  DeleteMessageDefinition,
  {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    message_ts: sendIntroductoryMessageStep.outputs.message_context.message_ts
  },
);

OneTwoFourWorkflow.addStep(Schema.slack.functions.ReplyInThread, {
    channel_id: OneTwoFourWorkflow.inputs.channel_id,
    message_context: sendMessageStep.outputs.message_context,
    message: "1-2-4-All Exercise has begun.",
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

const allReactors = OneTwoFourWorkflow.addStep(JoinAllUsersDefinition, {
  users: getReactorsStep.outputs.users
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

OneTwoFourWorkflow.addStep(
  InviteUsersToHuddleDefinition, {
  channel_id: OneTwoFourWorkflow.inputs.channel_id,
  matches: allReactors.outputs.allUsers,
  prompt: inputForm.outputs.fields.prompt,
  instructions: "Ask, “What is one idea that stood out in your conversation?” Each group shares one important idea with all (repeat cycle as needed). 5 min."
})

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
