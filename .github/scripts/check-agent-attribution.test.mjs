import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateAttribution } from "./check-agent-attribution.mjs";

describe("validateAttribution", () => {
  it("accepts an exact footer at the end of an AI submission", () => {
    assert.equal(
      validateAttribution(
        "Summary\n\nAgent provider: OpenAI\nAgent model: gpt-5.6-sol\nAgent harness: Codex",
      ).valid,
      true,
    );
  });

  it("accepts GitHub bodies with CRLF line endings", () => {
    assert.equal(
      validateAttribution(
        "Summary\r\n\r\nAgent provider: OpenAI\r\nAgent model: gpt-5.6-sol\r\nAgent harness: Codex\r\n",
      ).valid,
      true,
    );
  });

  it("rejects missing, partial, misplaced, and placeholder footers", () => {
    assert.equal(validateAttribution("Summary only").valid, false);
    assert.equal(
      validateAttribution("Agent provider: OpenAI\nAgent model: gpt-5.6-sol")
        .valid,
      false,
    );
    assert.equal(
      validateAttribution(
        "Agent provider: OpenAI\nAgent model: gpt-5.6-sol\nAgent harness: Codex\nMore text",
      ).valid,
      false,
    );
    assert.equal(
      validateAttribution(
        "Agent provider: <provider>\nAgent model: <model>\nAgent harness: <harness>",
      ).valid,
      false,
    );
  });

  it("accepts explicit human declarations", () => {
    assert.equal(validateAttribution("AI assistance: no\n").valid, true);
    assert.equal(
      validateAttribution("### Agent attribution\n\nNot AI-generated\n").valid,
      true,
    );
  });
});
