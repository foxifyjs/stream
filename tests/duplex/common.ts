import { Duplex, Readable, Writable } from "../../src";

it("Should satisfy the defaults", () => {
  const duplex = new Duplex();

  expect(duplex.readable).toBe(true);
  expect(duplex.writable).toBe(true);
  expect(duplex.readableHighWaterMark).toBe(16 * 1024);
  expect(duplex.writableHighWaterMark).toBe(16 * 1024);
  expect(duplex.readableLength).toBe(0);
  expect(duplex.writableLength).toBe(0);
  expect(duplex.readableFlowing).toBe(null);
  expect(duplex.isPaused()).toBe(false);
  expect((duplex as any)._writableState.corked).toBe(false);
  expect((duplex as any)._writableState.encoding).toBe("utf8");
});

it("Should be instance of Readable", () => {
  const duplex = new Duplex();

  expect(duplex).toBeInstanceOf(Readable);
});

it("Should be instance of Writable", () => {
  const duplex = new Duplex();

  expect(duplex).toBeInstanceOf(Writable);
});

it("Should override _read, _write, _writev, _destroy, _final", () => {
  function read() {}
  function write(chunk: Buffer, callback: (error?: Error) => void) {
    callback();
  }
  function writev(chunk: Buffer[], callback: (error?: Error) => void) {
    callback();
  }
  function destroy(error: Error | undefined, callback: (error?: Error) => void) {
    callback(error);
  }
  function final(callback: (error?: Error) => void) {
    callback();
  }

  const duplex = new Duplex({
    read,
    write,
    writev,
    destroy,
    final,
  });

  expect((duplex as any)._read).toEqual(read);
  expect((duplex as any)._write).toEqual(write);
  expect((duplex as any)._writev).toEqual(writev);
  expect((duplex as any)._destroy).toEqual(destroy);
  expect((duplex as any)._final).toEqual(final);
});
