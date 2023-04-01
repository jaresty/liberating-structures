import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import ImpromptuNetworkingFunction from "./impromptu_networking_function.ts";

const { createContext } = SlackFunctionTester("greeting_function");

Deno.test("Impromptu Networking function test", async () => {
  const inputs = { message: "Welcome to the team!" };
  const { outputs } = await ImpromptuNetworkingFunction(createContext({ inputs }));
  assertEquals(
    outputs?.greeting.includes("Welcome to the team!"),
    true,
  );
});
