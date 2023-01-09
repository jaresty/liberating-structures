import { Trigger } from "deno-slack-api/types.ts";
import GreetingWorkflow from "../workflows/greeting_workflow.ts";

/**
 * Triggers determine when Workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/future/triggers
 */
const scheduledImpromptuNetworkingTrigger: Trigger<typeof GreetingWorkflow.definition> = {
    type: 'scheduled',
    name: "Scheduled Impromptu Networking",
    description: "Start Impromptu Networking Session",
    workflow: "#/workflows/greeting_workflow",
    inputs: {
        interactivity: {
            value: "{{data.interactivity}}",
        },
        channel_id: {
            value: "C04HW22NWE9",
        }
    },
    schedule: {
        start_time: "2023-01-09T03:51:18Z",
        // occurrence_count: 3,
        frequency: { type: "once" },
    },
};

export default scheduledImpromptuNetworkingTrigger;
