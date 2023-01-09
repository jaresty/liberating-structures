import { Trigger } from "deno-slack-api/types.ts";
import OneTwoFourWorkflow from "../workflows/124_workflow.ts";

/**
 * Triggers determine when Workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/future/triggers
 */
const onetwofourTrigger: Trigger<typeof OneTwoFourWorkflow.definition> = {
    type: "shortcut",
    name: "One Two Four Session",
    description: "Start One Two Four Session",
    workflow: "#/workflows/onetwofour_workflow",
    inputs: {
        interactivity: {
            value: "{{data.interactivity}}",
        },
        channel_id: {
            value: "{{data.channel_id}}",
        },
    },
};

export default onetwofourTrigger;
