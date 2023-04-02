import { Trigger } from "deno-slack-api/types.ts";
import ImpromptuNetworkingWorkflow from "../workflows/impromptu_networking_workflow.ts";

/**
 * Triggers determine when Workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/future/triggers
 */
const impromptuNetworkingTrigger: Trigger<typeof ImpromptuNetworkingWorkflow.definition> = {
  type: "shortcut",
  name: "Start Impromptu Networking",
  description: "Start Impromptu Networking Session",
  workflow: "#/workflows/impromptu_networking_workflow",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel_id: {
      value: "{{data.channel_id}}",
    },
  },
};

export default impromptuNetworkingTrigger;
