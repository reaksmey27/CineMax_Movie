import assert from "node:assert/strict";
import test from "node:test";
import { meetsPasswordRequirements } from "../src/utils/passwordRequirements.js";

test("new passwords must meet every requirement", () => {
  for (const value of ["", "Ab1!", "abcdefgh1!", "ABCDEFGH1!", "Abcdefgh!", "Abcdefgh1", "Abcdefg1 "]) {
    assert.equal(meetsPasswordRequirements(value), false, value);
  }
  assert.equal(meetsPasswordRequirements("Abcdef1!"), true);
  assert.equal(meetsPasswordRequirements("A longer password 123!"), true);
});
