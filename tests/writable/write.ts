import { Writable } from "../../src";

it("Should emit '._write()' is not implemented error", done => {
  const writable = new Writable({
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer = Buffer.from("Hello World!");

  writable.once("error", error => {
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('The "_write()" method is not implemented');

    done();
  });

  writable.write(buffer);
});

it("Should emit '._writev()' is not implemented error", done => {
  const writable = new Writable({
    destroy(error, callback) {
      callback(error);
    },
  });

  const buffer1 = Buffer.from("Hello");
  const buffer2 = Buffer.from(" World!");

  writable.once("error", error => {
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('The "_writev()" method is not implemented');

    done();
  });

  writable.writev([{ chunk: buffer1 }, { chunk: buffer2 }]);
});

it("Should write one buffer", done => {
  const buffer = Buffer.from("Hello World!");

  const writable = new Writable({
    write(chunk, callback) {
      expect(chunk).toEqual(buffer);

      callback();
    },
  });

  expect(writable.write(buffer, done)).toBe(true);
});

it("Should write one string", done => {
  const string = "Hello World!";

  const writable = new Writable({
    write(chunk, callback) {
      expect(chunk).toEqual(Buffer.from(string));

      callback();
    },
  });

  expect(writable.write(string, done)).toBe(true);
});

it("Should write more than one buffer", done => {
  const buffer1 = Buffer.from("Hello");
  const buffer2 = Buffer.from(" World!");

  const writable = new Writable({
    writev(chunks, callback) {
      expect(chunks).toEqual([buffer1, buffer2]);

      callback();
    },
  });

  expect(
    writable.writev(
      [
        { chunk: buffer1 },
        { chunk: buffer2.toString("ascii"), encoding: "ascii" },
      ],
      done,
    ),
  ).toBe(true);
});

it("Should write after being uncorked", done => {
  const buffer1 = Buffer.from("Hello");
  const buffer2 = Buffer.from(" World!");

  const writable = new Writable({
    writev(chunks, callback) {
      expect(chunks).toEqual([buffer1, buffer2]);

      callback();
    },
  });

  expect((writable as any)._writableState.corked).toBe(false);

  writable.cork();

  expect((writable as any)._writableState.corked).toBe(true);

  expect(writable.writev([{ chunk: buffer1 }, { chunk: buffer2 }], done)).toBe(
    true,
  );

  writable.uncork();

  expect((writable as any)._writableState.corked).toBe(false);
});

it("Should writev after being uncorked", done => {
  const buffer1 = Buffer.from("Hello");
  const buffer2 = Buffer.from(" World!");

  const writable = new Writable({
    writev(chunks, callback) {
      expect(chunks).toEqual([buffer1, buffer2]);

      callback();
    },
  });

  expect((writable as any)._writableState.corked).toBe(false);

  writable.cork();

  expect((writable as any)._writableState.corked).toBe(true);

  expect(writable.write(buffer1)).toBe(true);
  expect(writable.write(buffer2, done)).toBe(true);

  writable.uncork();

  expect((writable as any)._writableState.corked).toBe(false);
});

it("Should emit an error when trying to write after or while ending", done => {
  const buffer = Buffer.from("Hello World!");

  const writable = new Writable({
    write(chunk, callback) {
      callback();
    },
    destroy(error, callback) {
      callback(error);
    },
  });

  writable.once("finish", () => {
    expect(
      writable.write(buffer, error => {
        expect(error).toBeInstanceOf(Error);
        expect(error!.message).toBe("Can't write while or after ending!");

        done();
      }),
    ).toBe(false);
  });

  expect(writable.end()).toBeInstanceOf(Writable);
});

it("Should emit an error when trying to writev after or while ending", done => {
  const buffer = Buffer.from("Hello World!");

  const writable = new Writable({
    writev(chunks, callback) {
      callback();
    },
    destroy(error, callback) {
      callback(error);
    },
  });

  writable.once("finish", () => {
    expect(
      writable.writev([{ chunk: buffer }], error => {
        expect(error).toBeInstanceOf(Error);
        expect(error!.message).toBe("Can't write while or after ending!");

        done();
      }),
    ).toBe(false);
  });

  expect(writable.end()).toBeInstanceOf(Writable);
});
