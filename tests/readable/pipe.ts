import { Readable, Writable } from "../../src";

it("Should pipe", done => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.from("Hello World!");

  const writable = new Writable({
    write(chunk, callback) {
      expect(chunk).toEqual(buffer);

      callback();
    },
  });

  writable.once("end" as any, () => done());

  writable.once("pipe", r => {
    expect(r).toBeInstanceOf(Readable);
  });

  expect(readable.pipe(writable)).toBeInstanceOf(Writable);
  expect((readable as any)._readableState.pipes.length).toBe(1);
  expect(readable.push(buffer)).toBe(true);
  expect(readable.push(null)).toBe(false);
});

it("Should pipe without emitting 'end' event", done => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.from("Hello World!");

  const writable = new Writable({
    write(chunk, callback) {
      expect(chunk).toEqual(buffer);

      callback();
      done();
    },
  });

  writable.once("pipe", r => {
    expect(r).toBeInstanceOf(Readable);
  });

  expect(
    readable.pipe(
      writable,
      { end: false },
    ),
  ).toBeInstanceOf(Writable);
  expect((readable as any)._readableState.pipes.length).toBe(1);
  expect(readable.push(buffer)).toBe(true);
  expect(readable.push(null)).toBe(false);
});

it("Should unpipe", done => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.from("Hello World!");

  const writable = new Writable({
    write(chunk, callback) {
      expect(chunk).toEqual(buffer);

      callback();
    },
  });

  writable.once("pipe", r => {
    expect(r).toBeInstanceOf(Readable);
  });

  writable.once("unpipe", r => {
    expect(r).toBeInstanceOf(Readable);

    done();
  });

  expect(readable.pipe(writable)).toBeInstanceOf(Writable);
  expect((readable as any)._readableState.pipes.length).toBe(1);
  expect(readable.push(buffer)).toBe(true);
  expect(readable.unpipe(writable)).toBeInstanceOf(Readable);
  expect((readable as any)._readableState.pipes.length).toBe(0);
});

it("Should unpipe all", done => {
  const readable = new Readable({
    read() {},
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.from("Hello World!");

  const writable = new Writable({
    write(chunk, callback) {
      expect(chunk).toEqual(buffer);

      callback();
    },
  });

  writable.once("pipe", r => {
    expect(r).toBeInstanceOf(Readable);
  });

  writable.once("unpipe", r => {
    expect(r).toBeInstanceOf(Readable);

    done();
  });

  expect(readable.pipe(writable)).toBeInstanceOf(Writable);
  expect((readable as any)._readableState.pipes.length).toBe(1);
  expect(readable.push(buffer)).toBe(true);
  expect(readable.unpipe()).toBeInstanceOf(Readable);
  expect((readable as any)._readableState.pipes.length).toBe(0);
});
