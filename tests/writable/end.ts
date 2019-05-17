import { Writable } from "../../src";

it("Should end", done => {
  const writable = new Writable({
    destroy(error, callback) {
      callback(error);
    },
  });

  expect(writable.end(done)).toBeInstanceOf(Writable);
});

it("Should emit an error when trying to end after or while ending", done => {
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
      writable.end(buffer, error => {
        expect(error).toBeInstanceOf(Error);
        expect(error!.message).toBe("Can't write while or after ending!");

        done();
      }),
    ).toBeInstanceOf(Writable);
  });

  expect(writable.end()).toBeInstanceOf(Writable);
});
