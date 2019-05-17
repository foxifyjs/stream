import { Readable } from "../../src";

it("Should push 'Hello World' to the readable stream", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.from("Hello World");

  expect(readable.push(buffer)).toBe(true);
  expect(readable.readableLength).toBe(buffer.length);
  expect(readable.read()).toEqual(buffer);
});

it("Should return false when pushing more than the readableHighWaterMark", () => {
  const readableHighWaterMark = 1024;

  const readable = new Readable({
    highWaterMark: readableHighWaterMark,
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.allocUnsafe(readableHighWaterMark);

  expect(readable.push(buffer)).toBe(false);
  expect(readable.readableLength).toBe(readableHighWaterMark);
  expect(readable.read()).toEqual(buffer);
});

it("Should push nothing if an empty buffer is passed as an argument", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.allocUnsafe(0);

  expect(readable.push(buffer)).toBe(true);
  expect(readable.readableLength).toBe(0);
  expect(readable.read()).toBe(null);
});

it("Should be able to push multiple time before reading", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer1 = Buffer.allocUnsafe(10);
  const buffer2 = Buffer.allocUnsafe(25);

  expect(readable.push(buffer1)).toBe(true);
  expect(readable.push(buffer2)).toBe(true);
  expect(readable.readableLength).toBe(buffer1.length + buffer2.length);
  expect(readable.read()).toEqual(Buffer.concat([buffer1, buffer2]));
});

it("Should be able to push string", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const string = "Hello World!";

  expect(readable.push(string)).toBe(true);
  expect(readable.readableLength).toBe(Buffer.byteLength(string));
  expect(readable.read()).toEqual(Buffer.from(string));
});

it("Should be able to push Uint8Array", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const arr = Uint8Array.from(
    "Hello World!".split("").map(c => c.charCodeAt(0)),
  );

  expect(readable.push(arr)).toBe(true);
  expect(readable.readableLength).toBe(Buffer.byteLength(arr));
  expect(readable.read()).toEqual(Buffer.from(arr));
});

it("Should pause", done => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  expect(readable.readableFlowing).toBe(null);

  readable.once("pause", () => {
    expect(readable.readableFlowing).toBe(false);

    done();
  });

  readable.pause();
});

it("Should do nothing when paused again", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  expect(readable.readableFlowing).toBe(null);

  readable.pause();

  expect(readable.readableFlowing).toBe(false);

  readable.pause();

  expect(readable.readableFlowing).toBe(false);
});

it("Should resume", () => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  expect(readable.readableFlowing).toBe(null);

  readable.resume();

  expect(readable.readableFlowing).toBe(true);
});

it("Should do nothing when resumed again", done => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.from("Hello World");

  readable.once("resume", () => {
    expect(readable.readableFlowing).toBe(true);
  });

  expect(readable.readableFlowing).toBe(null);

  expect(readable.push(buffer)).toBe(true);

  expect(readable.readableFlowing).toBe(null);

  readable.once("data", data => {
    expect(data).toEqual(buffer);

    done();
  });

  readable.resume();
});

it("Should emit 'readable' event when pushed in paused mode", done => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.from("Hello World");

  readable.once("readable", () => {
    expect(readable.read()).toEqual(buffer);

    done();
  });

  expect(readable.readableFlowing).toBe(false);
  expect(readable.push(buffer)).toBe(true);
});

it("Should emit 'data' event when pushed in flowing mode", done => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.from("Hello World");

  readable.once("data", data => {
    expect(data).toEqual(buffer);

    done();
  });

  expect(readable.readableFlowing).toBe(true);
  expect(readable.push(buffer)).toBe(true);
});

it("Should end when pushed null", done => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  readable.once("error", error => {
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("stream.push() after EOF");

    done();
  });

  expect(readable.push(null)).toBe(false);
  expect(readable.readable).toBe(false);
  expect(readable.read(0)).toBe(null);
  expect(readable.read()).toBe(null);
  expect(readable.push(null)).toBe(false);
});
