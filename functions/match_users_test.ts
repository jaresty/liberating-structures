import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import { matchUsers } from "./match_users.ts";

const { createContext } = SlackFunctionTester("match_users_tester");
const fakeRandom = { random: () => 1 } as Math

Deno.test("Impromptu Networking function test", async () => {
  const users = ["abc", "def"]

  const result = matchUsers(users, fakeRandom)

  assertEquals(
    result,
    ["abc,def"]
  );
});

Deno.test("Impromptu Networking function test", async () => {
  const users = ["abc", "def", "ghi"]

  const result = matchUsers(users, fakeRandom)

  assertEquals(
    result,
    ["abc,def,ghi"]
  );
});

Deno.test("Impromptu Networking function test", async () => {
  const users = ["abc", "def", "ghi", "jkl"]

  const result = matchUsers(users, fakeRandom)

  assertEquals(
    result,
    ["abc,def","ghi,jkl"]
  );
});

Deno.test("Impromptu Networking function test", async () => {
  const users = ["abc,def", "ghi,jkl"]

  const result = matchUsers(users, fakeRandom)

  assertEquals(
    result,
    ["abc,def,ghi,jkl"]
  );
});

Deno.test("Impromptu Networking function test", async () => {
  const users = ["abc","def","ghi","jkl","mno"]

  const result = matchUsers(users, fakeRandom)

  assertEquals(
    result,
    ["abc,def,ghi","jkl,mno"]
  );
});

Deno.test("Impromptu Networking function test", async () => {
  const users = ["abc,def,ghi","jkl,mno"]

  const result = matchUsers(users, fakeRandom)

  assertEquals(
    result,
    ["abc,def,ghi","jkl,mno"]
  );
});

Deno.test("Impromptu Networking function test", async () => {
  const users = ["abc,def,ghi","jkl,mno","pqr"]

  const result = matchUsers(users, fakeRandom)

  assertEquals(
    result,
    ["abc,def,ghi","jkl,mno,pqr"]
  );
});

Deno.test("Impromptu Networking function test", async () => {
  const users = ["abc,def,ghi","jkl,mno","pqr","stu"]

  const result = matchUsers(users, fakeRandom)

  assertEquals(
    result,
    ["abc,def,ghi","jkl,mno,pqr,stu"]
  );
});
