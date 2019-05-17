import { Writable } from "../../src";

it("Should satisfy the defaults", () => {
  const writable = new Writable();

  expect(writable.writable).toBe(true);
  expect(writable.writableHighWaterMark).toBe(16 * 1024);
  expect(writable.writableLength).toBe(0);
  expect((writable as any)._writableState.corked).toBe(false);
  expect((writable as any)._writableState.encoding).toBe("utf8");
});

it("Should override the encoding", () => {
  const writable = new Writable();

  expect((writable as any)._writableState.encoding).toBe("utf8");
  expect(writable.setDefaultEncoding("ascii")).toBeInstanceOf(Writable);
  expect((writable as any)._writableState.encoding).toBe("ascii");
});
