import { Trigger } from "deno-slack-api/types.ts";
import GreetingWorkflow from "../workflows/greeting_workflow.ts";

/**
 * Triggers determine when Workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/future/triggers
 */
const greetingTrigger: Trigger<typeof GreetingWorkflow.definition> = {
  type: "shortcut",
  name: "Start Impromptu Networking",
  description: "Start Impromptu Networking Session",
  workflow: "#/workflows/greeting_workflow",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel_id: {
      value: "{{data.channel_id}}",
    },
  },
};

export default greetingTrigger;
