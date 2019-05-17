import { EventEmitter } from "@foxify/events";
import {
  destroy as doDestroy,
  Encoding,
  ERR_METHOD_NOT_IMPLEMENTED,
  toBuffer,
  WritableState,
} from "./internals";
import Readable from "./Readable";

function finish(stream: Writable<any>, state: WritableState) {
  state.ending = false;
  state.ended = true;

  stream.emit("finish");

  stream.destroy();
}

function finishMaybe(stream: Writable<any>, state: WritableState): void {
  if (!state.ending || state.length || state.writing || state.ended) return;

  if (typeof (stream as any)._final !== "function") {
    return finish(stream, state);
  }

  (stream as any)._final((err?: Error) => {
    if (err) return stream.destroy(err);

    finish(stream, state);
  });
}

function onWriteError(
  stream: Writable<any>,
  callback: (error?: Error) => void,
  err: Error,
) {
  callback(err);

  stream.emit("error", err);

  finishMaybe(stream, (stream as any)._writableState);
}

function onWrite(
  stream: Writable<any>,
  // tslint:disable-next-line:no-empty
  callback: (error?: Error) => void = () => {},
  err?: Error,
) {
  (stream as any)._writableState.writing = false;

  if (err) return onWriteError(stream, callback, err);

  doWrite(stream);

  callback();
}

function doWrite(stream: Writable<any>) {
  const state = (stream as any)._writableState as WritableState;
  const length = state.length;

  if (!length) {
    if (!state.ending && !state.ended) stream.emit("drain");

    return finishMaybe(stream, state);
  }

  if (state.writing || state.corked || state.ended) return;

  state.writing = true;

  const { chunks, callback } = state.consume();

  if (length === 1) {
    return (stream as any)._write(chunks[0], (err?: Error) =>
      onWrite(stream, callback, err),
    );
  }

  return (stream as any)._writev(chunks, (err?: Error) =>
    onWrite(stream, callback, err),
  );
}

namespace Writable {
  export interface Options {
    highWaterMark?: number;
    defaultEncoding?: Encoding;
    write?: (chunk: Buffer, callback: (error?: Error) => void) => void;
    writev?: (chunks: Buffer[], callback: (error?: Error) => void) => void;
    destroy?: (
      error: Error | undefined,
      callback: (error?: Error) => void,
    ) => void;
    final?: (callback: (error?: Error) => void) => void;
  }

  export interface Chunk {
    chunk: string | Buffer | Uint8Array;
    encoding?: Encoding;
  }

  export interface Events {
    close: () => void;
    drain: () => void;
    finish: () => void;
    pipe: (src: Readable<any>) => void;
    unpipe: (src: Readable<any>) => void;
  }
}

class Writable<Events = {}> extends EventEmitter<Writable.Events & Events> {
  public static [Symbol.hasInstance](instance: any) {
    return instance && instance._writableState instanceof WritableState;
  }

  protected _writableState: WritableState;

  public get writable() {
    const { ended, ending } = this._writableState;

    return !(ended || ending);
  }

  public get writableHighWaterMark() {
    return this._writableState.highWaterMark;
  }

  public get writableLength() {
    return this._writableState.bytes;
  }

  protected _final?: (callback: (error?: Error) => void) => void;

  constructor(options: Writable.Options = {}) {
    super();

    this._writableState = new WritableState(options);

    const { destroy, write, writev, final } = options;

    if (destroy) this._destroy = destroy;

    if (write) this._write = write;

    if (writev) this._writev = writev;

    if (final) this._final = final;
  }

  public setDefaultEncoding(encoding: Encoding) {
    this._writableState.encoding = encoding;

    return this;
  }

  public cork() {
    this._writableState.corked = true;

    return this;
  }

  public uncork() {
    this._writableState.corked = false;

    doWrite(this);

    return this;
  }

  public destroy(error?: Error): this {
    return doDestroy(this, error);
  }

  public write(
    chunk: string | Buffer | Uint8Array,
    callback?: (error?: Error) => void,
  ): boolean;
  public write(
    chunk: string,
    encoding: Encoding,
    callback?: (error?: Error) => void,
  ): boolean;
  public write(
    chunk: string | Buffer | Uint8Array,
    encoding?: Encoding | (() => void),
    callback?: (error?: Error) => void,
  ) {
    const state = this._writableState;

    if (typeof encoding === "function") {
      callback = encoding;
      encoding = undefined;
    }

    if (state.ending || state.ended) {
      const err = new Error("Can't write while or after ending!");

      if (callback) this.once("error", callback);

      this.emit("error", err);

      return false;
    }

    chunk = toBuffer(chunk, encoding || state.encoding);

    if (state.writing || state.corked) {
      return state.push(chunk as Buffer, callback);
    }

    state.writing = true;

    this._write(chunk as Buffer, (err?: Error) => onWrite(this, callback, err));

    return true;
  }

  public writev(chunks: Writable.Chunk[], callback?: (error?: Error) => void) {
    const state = this._writableState;

    if (state.ending || state.ended) {
      const err = new Error("Can't write while or after ending!");

      if (callback) this.once("error", callback);

      this.emit("error", err);

      return false;
    }

    const buffers: Buffer[] = [];
    for (let i = chunks.length - 1; i >= 0; i--) {
      const { chunk, encoding = state.encoding } = chunks[i];

      buffers[i] = toBuffer(chunk, encoding);
    }

    if (state.writing || state.corked) return state.merge(buffers, callback);

    state.writing = true;

    this._writev(buffers, (err?: Error) => onWrite(this, callback, err));

    return true;
  }

  public end(callback?: (error?: Error) => void): this;
  public end(
    chunk: string | Buffer | Uint8Array,
    callback?: (error?: Error) => void,
  ): this;
  public end(
    chunk: string,
    encoding: Encoding,
    callback?: (error?: Error) => void,
  ): this;
  public end(
    chunk?: string | Buffer | Uint8Array | (() => void),
    encoding?: Encoding | (() => void),
    callback?: (error?: Error) => void,
  ) {
    if (typeof chunk === "function") {
      callback = chunk;
      chunk = undefined;
    } else if (typeof encoding === "function") {
      callback = encoding;
      encoding = undefined;
    }

    const state = this._writableState;

    if (state.ending || state.ended) {
      const err = new Error(`Can't write while or after ending!`);

      if (callback) this.once("error", callback);

      this.emit("error", err);

      return this;
    }

    state.ending = true;

    if (callback) this.once("finish", callback as () => void);

    if (chunk) {
      this.write(chunk as any, encoding as Encoding);

      return this;
    }

    if (state.corked) this.uncork();

    finishMaybe(this, state);

    return this;
  }

  protected _write(chunk: Buffer, callback: (error?: Error) => void) {
    this.destroy(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
  }

  protected _writev(chunks: Buffer[], callback: (error?: Error) => void) {
    this.destroy(new ERR_METHOD_NOT_IMPLEMENTED("_writev()"));
  }

  protected _destroy(
    error: Error | undefined,
    callback: (error?: Error) => void,
  ) {
    this.destroy(new ERR_METHOD_NOT_IMPLEMENTED("_destroy()"));
  }
}

export default Writable;
