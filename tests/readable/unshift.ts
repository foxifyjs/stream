import { Readable } from "../../src";

it("Should unshift 'Hello' to the readable stream", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const world = Buffer.from(" World");
  const hello = Buffer.from("Hello");

  expect(readable.push(world)).toBe(true);
  expect(readable.unshift(hello)).toBe(true);
  expect(readable.readableLength).toBe(hello.length + world.length);
  expect(readable.read()).toEqual(Buffer.concat([hello, world]));
});

it("Should unshift 'Hello' to an empty readable stream", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.from("Hello");

  expect(readable.unshift(buffer)).toBe(true);
  expect(readable.readableLength).toBe(buffer.length);
  expect(readable.read()).toEqual(buffer);
});

it("Should unshift nothing if an empty buffer is passed as an argument", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.allocUnsafe(0);

  expect(readable.unshift(buffer)).toBe(true);
  expect(readable.readableLength).toBe(0);
  expect(readable.read()).toBe(null);
});
