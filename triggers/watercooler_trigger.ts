import { Trigger } from "deno-slack-api/types.ts";
import WatercoolerWorkflow from "../workflows/watercooler_workflow.ts";

/**
 * Triggers determine when Workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/future/triggers
 */
const watercoolerTrigger: Trigger<typeof WatercoolerWorkflow.definition> = {
    type: "shortcut",
    name: "Virtual Watercooler",
    description: "Visit the watercooler",
    workflow: "#/workflows/watercooler_workflow",
    inputs: {
        interactivity: {
            value: "{{data.interactivity}}",
        },
        channel_id: {
            value: "{{data.channel_id}}",
        },
    },
};

export default watercoolerTrigger;
