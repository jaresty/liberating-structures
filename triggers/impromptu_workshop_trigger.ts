import { Trigger } from "deno-slack-api/types.ts";
import ImpromptuWorkshopWorkflow from "../workflows/impromptu_workshop_workflow.ts";

/**
 * Triggers determine when Workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/future/triggers
 */
const impromptuWorkshopTrigger: Trigger<typeof ImpromptuWorkshopWorkflow.definition> = {
  type: "shortcut",
  name: "Start Impromptu Workshop",
  description: "Start Impromptu Workshop Session",
  workflow: "#/workflows/impromptu_workshop_workflow",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel_id: {
      value: "{{data.channel_id}}",
    },
  },
};

export default impromptuWorkshopTrigger;
