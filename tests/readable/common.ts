import { Readable } from "../../src";

it("Should satisfy the defaults", () => {
  const readable = new Readable();

  expect(readable.readable).toBe(true);
  expect(readable.readableHighWaterMark).toBe(16 * 1024);
  expect(readable.readableLength).toBe(0);
  expect(readable.readableFlowing).toBe(null);
  expect(readable.isPaused()).toBe(false);
});
