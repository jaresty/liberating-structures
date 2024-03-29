import { Manifest } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "./functions/get_reactors.ts";
import { ImpromptuNetworkingNotificationDefinition } from "./functions/impromptu_networking_notification.ts";
import OneTwoFourWorkflow from "./workflows/124_workflow.ts";
import ThreeSixTwelveWorkflow from "./workflows/3_6_12_workflow.ts";
import ImpromptuNetworkingWorkflow from "./workflows/impromptu_networking_workflow.ts";
import { DeleteMessageDefinition } from "./functions/delete_message_function.ts";
import { UpdateMessageDefinition } from "./functions/update_message_function.ts";
import { SendMessageIfDelayedDefinition } from "./functions/send_message_if_delayed.ts";
import WatercoolerWorkflow from "./workflows/watercooler_workflow.ts";
import { SendMessageToGroupsDefinition } from "./functions/send_message_to_groups.ts";
import ImpromptuWorkshopWorkflow from "./workflows/impromptu_workshop_workflow.ts";
import { JoinUsersDefinition } from "./functions/join_users.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "LiberatedPaws",
  description:
    "Enable everyone to speak! A bot to facilitate inclusive community-driven discussions for groups of 4+.",
  icon: "assets/kitty.png",
  workflows: [
    ImpromptuNetworkingWorkflow,
    OneTwoFourWorkflow,
    ThreeSixTwelveWorkflow,
    WatercoolerWorkflow,
    ImpromptuWorkshopWorkflow,
  ],
  functions: [
    GetReactorsDefinition,
    DeleteMessageDefinition,
    UpdateMessageDefinition,
    SendMessageToGroupsDefinition,
    SendMessageIfDelayedDefinition,
    JoinUsersDefinition,
    ImpromptuNetworkingNotificationDefinition,
  ],
  outgoingDomains: [],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "reactions:read",
    "groups:write",
    "mpim:write",
    "im:write",
    "users:read",
  ],
});
