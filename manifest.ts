import { Manifest } from "deno-slack-sdk/mod.ts";
import { GetReactorsDefinition } from "./functions/get_reactors.ts";
import { GreetingFunctionDefinition } from "./functions/greeting_function.ts";
import GreetingWorkflow from "./workflows/greeting_workflow.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "impromptu-network",
  description:
    "A sample that demonstrates using a function, workflow and trigger to send a greeting",
  icon: "assets/default_new_app_icon.png",
  workflows: [GreetingWorkflow],
    functions: [GetReactorsDefinition, GreetingFunctionDefinition],
  outgoingDomains: [],
  botScopes: ["commands", "chat:write", "chat:write.public", "reactions:read"],
});
