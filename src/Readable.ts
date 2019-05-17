import { EventEmitter } from "@foxify/events";
import { Writable as NativeWritable } from "stream";
import {
  destroy as doDestroy,
  Encoding,
  ERR_METHOD_NOT_IMPLEMENTED,
  Pipe,
  ReadableState,
  toBuffer,
  WritableState,
} from "./internals";
import Writable from "./Writable";

function pipe(state: ReadableState, buffer: Buffer) {
  const pipes = state.pipes;

  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].destination.write(buffer);
  }
}

function consume(readable: Readable<any>, buffer: Buffer, encoding?: Encoding) {
  let data: Buffer | string;

  if (!encoding) data = buffer;
  else data = buffer.toString(encoding);

  readable.emit("data", data);
  pipe(
    (readable as any)._readableState,
    buffer,
  );

  return data;
}

function onEventAdded(
  stream: Readable<any>,
  state: ReadableState,
  event: keyof Readable.Events,
) {
  if (state.flowing === null) {
    if (event === "data") stream.resume();
    else if (event === "readable") {
      state.flowing = false;

      stream.read(0);
    }
  }

  return stream;
}

namespace Readable {
  export interface Options {
    highWaterMark?: number;
    encoding?: Encoding;
    read?: (size?: number) => void;
    destroy?: (
      error: Error | undefined,
      callback: (error?: Error) => void,
    ) => void;
  }

  export interface Events {
    data: (data: Buffer | string) => void;
    close: () => void;
    end: () => void;
    readable: () => void;
    pause: () => void;
    resume: () => void;
  }
}

class Readable<Events = {}> extends EventEmitter<Readable.Events & Events> {
  public static [Symbol.hasInstance](instance: any) {
    return instance && instance._readableState instanceof ReadableState;
  }

  protected _readableState: ReadableState;

  public get readable() {
    return !this._readableState.ended;
  }

  public get readableHighWaterMark() {
    return this._readableState.highWaterMark;
  }

  public get readableLength() {
    return this._readableState.bytes;
  }

  public get readableFlowing() {
    return this._readableState.flowing;
  }

  constructor(options: Readable.Options = {}) {
    super();

    this._readableState = new ReadableState(options);

    const { destroy, read } = options;

    if (destroy) this._destroy = destroy;

    if (read) this._read = read;
  }

  public isPaused() {
    return this._readableState.flowing === false;
  }

  public setEncoding(encoding: Encoding) {
    this._readableState.encoding = encoding;

    return this;
  }

  public pause() {
    const state = this._readableState;

    if (state.flowing !== false) {
      state.flowing = false;

      this.emit("pause");
    }

    return this;
  }

  public resume() {
    const state = this._readableState;

    if (state.flowing !== true) {
      state.flowing = true;

      this.emit("resume");

      const bytes = state.bytes;

      if (bytes) {
        const buffer = state.concat();

        consume(this, buffer, state.encoding);
      }

      this.read(0);
    }

    return this;
  }

  public destroy(error?: Error) {
    return doDestroy(this, error);
  }

  public pipe(
    destination: Writable<any> | NativeWritable,
    options: { end?: boolean } = {},
  ) {
    const state = this._readableState;
    const { end = true } = options;

    const dest = new Pipe(destination as Writable, () =>
      (destination as NativeWritable).emit("end"),
    );

    state.pipes.push(dest);

    if (end) this.once("end", dest.listener);

    (destination as Writable).emit("pipe", this);

    this.resume();

    return destination;
  }

  public unpipe(destination?: Writable<any> | NativeWritable) {
    const state = this._readableState;
    const pipes = [...state.pipes];

    if (destination === undefined) {
      state.pipes = [];

      for (let i = pipes.length - 1; i >= 0; i--) {
        // tslint:disable-next-line:no-shadowed-variable
        const { destination: dest, listener } = pipes[i];

        this.removeListener("end", listener);

        dest.emit("unpipe", this);
      }

      return this;
    }

    let index = pipes.length - 1;
    for (; index >= 0; index--) {
      if (pipes[index].destination === destination) break;
    }

    if (index < 0) return this;

    let dest: Pipe;
    if (index === 0) dest = pipes.shift()!;
    else dest = pipes.splice(index, 1)[0];

    state.pipes = pipes;

    this.removeListener("end", dest.listener);

    dest.destination.emit("unpipe", this);

    return this;
  }

  public read(size?: number): string | Buffer | null {
    const state = this._readableState;

    if (size === 0) {
      if (!state.reading && !state.ended) {
        this._read(state.highWaterMark);
      }

      return null;
    }

    if (state.flowing === null) state.flowing = false;

    const bytes = state.bytes;

    if (bytes === 0) return null;

    if (size === undefined || bytes === size || (bytes < size && state.ended)) {
      // tslint:disable-next-line:no-shadowed-variable
      const buffer = state.concat();

      this._read(state.highWaterMark);

      return consume(this, buffer, state.encoding);
    }

    if (bytes < size) return null;

    const buffer = state.consume(size);

    this._read(state.highWaterMark - (bytes - size));

    return consume(this, buffer, state.encoding);
  }

  public unshift(chunk: string | Buffer | Uint8Array) {
    const state = this._readableState;

    state.unshift(toBuffer(chunk, state.encoding));

    return state.bytes < state.highWaterMark;
  }

  public push(chunk: Buffer | Uint8Array | null): boolean;
  public push(chunk: string, encoding?: Encoding): boolean;
  public push(chunk: string | Buffer | Uint8Array | null, encoding?: Encoding) {
    const state = this._readableState;

    if (state.ended) {
      this.emit("error", new Error("stream.push() after EOF"));

      return false;
    }

    if (chunk === null) {
      if (
        (this as any)._writableState instanceof WritableState &&
        !(this as any).allowHalfOpen
      ) {
        this.destroy();
      } else {
        state.ended = true;
      }

      this.emit("end");

      return false;
    }

    if (!chunk.length) return state.bytes < state.highWaterMark;

    chunk = toBuffer(chunk, encoding || state.encoding);

    if (state.flowing === true) {
      consume(this, chunk as Buffer, state.encoding);

      state.consumed += chunk!.length;

      this.read(0);

      return true;
    }

    state.push(chunk as Buffer);

    if (state.flowing === false) this.emit("readable");

    return state.bytes < state.highWaterMark;
  }

  public addListener(
    event: "error",
    listener: (error: Error) => void,
    context?: any,
  ): this;
  public addListener<K extends EventEmitter.Event<Readable.Events & Events>>(
    event: K,
    listener: EventEmitter.Listener<Readable.Events & Events, K>,
    context?: any,
  ): this;
  public addListener(
    event: any,
    listener: EventEmitter.DefaultListener,
    context?: any,
  ) {
    super.addListener(event, listener, context);

    return onEventAdded(this, this._readableState, event);
  }

  public once(
    event: "error",
    listener: (error: Error) => void,
    context?: any,
  ): this;
  public once<K extends EventEmitter.Event<Readable.Events & Events>>(
    event: K,
    listener: EventEmitter.Listener<Readable.Events & Events, K>,
    context?: any,
  ): this;
  public once(
    event: any,
    listener: EventEmitter.DefaultListener,
    context?: any,
  ) {
    super.once(event, listener, context);

    return onEventAdded(this, this._readableState, event);
  }

  public prependListener(
    event: "error",
    listener: (error: Error) => void,
    context?: any,
  ): this;
  public prependListener<
    K extends EventEmitter.Event<Readable.Events & Events>
  >(
    event: K,
    listener: EventEmitter.Listener<Readable.Events & Events, K>,
    context?: any,
  ): this;
  public prependListener(
    event: any,
    listener: EventEmitter.DefaultListener,
    context?: any,
  ) {
    super.prependListener(event, listener, context);

    return onEventAdded(this, this._readableState, event);
  }

  public prependOnceListener(
    event: "error",
    listener: (error: Error) => void,
    context?: any,
  ): this;
  public prependOnceListener<
    K extends EventEmitter.Event<Readable.Events & Events>
  >(
    event: K,
    listener: EventEmitter.Listener<Readable.Events & Events, K>,
    context?: any,
  ): this;
  public prependOnceListener(
    event: any,
    listener: EventEmitter.DefaultListener,
    context?: any,
  ) {
    super.prependOnceListener(event, listener, context);

    return onEventAdded(this, this._readableState, event);
  }

  // TODO: implement
  // public [Symbol.asyncIterator]() {
  //   return {
  //     next: () => {
  //       return {
  //         done: true,
  //       };
  //     },
  //   };
  // }

  protected _read(size?: number) {
    this.destroy(new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
  }

  protected _destroy(
    error: Error | undefined,
    callback: (error?: Error) => void,
  ) {
    this.destroy(new ERR_METHOD_NOT_IMPLEMENTED("_destroy()"));
  }
}

export default Readable;
