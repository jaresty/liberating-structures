import { Trigger } from "deno-slack-api/types.ts";
import ThreeSixTwelveWorkflow from "../workflows/3_6_12_workflow.ts";

/**
 * Triggers determine when Workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/future/triggers
 */
const threesixtwelveTrigger: Trigger<typeof ThreeSixTwelveWorkflow.definition> =
  {
    type: "shortcut",
    name: "Three Six Twelve Session",
    description: "Start Three Six Twelve Session",
    workflow: "#/workflows/threesixtwelve_workflow",
    inputs: {
      interactivity: {
        value: "{{data.interactivity}}",
      },
      channel_id: {
        value: "{{data.channel_id}}",
      },
    },
  };

export default threesixtwelveTrigger;
