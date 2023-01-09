import { Manifest } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "./functions/get_reactors.ts";
import { GreetingFunctionDefinition } from "./functions/greeting_function.ts";
import OneTwoFourWorkflow from "./workflows/124_workflow.ts";
import GreetingWorkflow from "./workflows/greeting_workflow.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "liberating-structures",
  description:
    "A simple liberating structures bot for collaboration",
  icon: "assets/default_new_app_icon.png",
    workflows: [GreetingWorkflow, OneTwoFourWorkflow],
    functions: [GetReactorsDefinition, GreetingFunctionDefinition],
  outgoingDomains: [],
  botScopes: [
      "commands",
      "chat:write",
      "chat:write.public",
      "reactions:read",
      "groups:write",
      "mpim:write",
      "im:write",
  ],
});
