import { Readable } from "../../src";

it("Should emit '._read()' is not implemented error", done => {
  const readable = new Readable({
    destroy(error, callback) {
      callback(error);
    },
  });

  readable.once("error", error => {
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('The "_read()" method is not implemented');

    done();
  });

  readable.read(0);
});

it("Should return Null", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  expect(readable.read()).toBe(null);
});

it("Should read (consume) only the given bytes from the readable stream", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.allocUnsafe(readable.readableHighWaterMark);

  expect(readable.push(buffer)).toBe(false);
  expect(readable.read(1024)).toEqual(buffer.slice(0, 1024));
  expect(readable.read()).toEqual(buffer.slice(1024));
});

it("Should read (consume) only the given bytes from the readable stream", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer1 = Buffer.allocUnsafe(1024);
  const buffer2 = Buffer.allocUnsafe(1024);

  expect(readable.push(buffer1)).toBe(true);
  expect(readable.push(buffer2)).toBe(true);
  expect(readable.read(1024 + 1)).toEqual(Buffer.concat([buffer1, buffer2], 1024+1));
  expect(readable.read()).toEqual(buffer2.slice(1));
});

it("Should read (consume) null if the given bytes is bigger than readable bytes in the active readable stream", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.allocUnsafe(1024);

  expect(readable.push(buffer)).toBe(true);
  expect(readable.read(1024 + 1)).toBe(null);
});

it("Should read (consume) every bytes if the given bytes is bigger than readable bytes in the ended readable stream", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.allocUnsafe(1024);

  expect(readable.push(buffer)).toBe(true);
  expect(readable.push(null)).toBe(false);
  expect(readable.read(0)).toBe(null);
  expect(readable.read(1024 + 1)).toEqual(buffer);
});

it("Should read (consume) from the readable stream according to the given encoding 1", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
    encoding: "utf8",
  });

  const buffer = Buffer.from("Foo Bar", "utf8");

  expect(readable.push(buffer)).toBe(true);
  expect(readable.read()).toEqual(buffer.toString("utf8"));
});

it("Should read (consume) from the readable stream according to the given encoding 2", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.from("Foo Bar", "utf8");

  readable.setEncoding("utf8");

  expect(readable.push(buffer)).toBe(true);
  expect(readable.read()).toEqual(buffer.toString("utf8"));
});
