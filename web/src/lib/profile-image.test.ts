import { describe, expect, it } from "vitest";
import { PROFILE_IMAGE_PIXELS, squareCrop } from "./profile-image";

describe("squareCrop", () => {
  it("centers the crop on the longer side", () => {
    expect(squareCrop(400, 300)).toEqual({ x: 50, y: 0, size: 300 });
    expect(squareCrop(300, 401)).toEqual({ x: 0, y: 51, size: 300 });
    expect(squareCrop(200, 200)).toEqual({ x: 0, y: 0, size: 200 });
  });

  it("targets twice the largest display size", () => {
    expect(PROFILE_IMAGE_PIXELS).toBe(300);
  });
});
