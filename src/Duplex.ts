import { EventEmitter } from "@foxify/events";
import { Writable as NativeWritable } from "stream";
import { Encoding, implement, ReadableState, WritableState } from "./internals";
import Readable from "./Readable";
import Writable from "./Writable";

namespace Duplex {
  export interface Options extends Readable.Options, Writable.Options {
    allowHalfOpen?: boolean;
    readableHighWaterMark?: number;
    writableHighWaterMark?: number;
  }

  export interface Events extends Readable.Events, Writable.Events {}
}

interface Duplex {
  // Readable methods

  isPaused(): boolean;

  setEncoding(encoding: Encoding): this;

  pause(): this;

  resume(): this;

  destroy(error?: Error): this;

  pipe(
    destination: Writable<any> | NativeWritable,
    options?: { end?: boolean },
  ): Writable<any> | NativeWritable;

  unpipe(destination?: Writable<any> | NativeWritable): this;

  read(size?: number): string | Buffer | null;

  unshift(chunk: string | Buffer | Uint8Array): void;

  push(chunk: Buffer | Uint8Array | null): boolean;
  push(chunk: string, encoding: Encoding): boolean;

  // Writable methods

  setDefaultEncoding(encoding: Encoding): this;

  cork(): this;

  uncork(): this;

  write(chunk: string | Buffer | Uint8Array, callback?: () => void): boolean;
  write(chunk: string, encoding: Encoding, callback?: () => void): boolean;

  writev(chunks: Writable.Chunk[], callback?: () => void): boolean;

  end(callback?: () => void): this;
  end(chunk: string | Buffer | Uint8Array, callback?: () => void): this;
  end(chunk: string, encoding: Encoding, callback?: () => void): this;
}

@implement(Readable, [
  "readable",
  "readableHighWaterMark",
  "readableLength",
  "readableFlowing",
])
@implement(Writable, ["writable", "writableHighWaterMark", "writableLength"])
// @ts-ignore
class Duplex<Events = {}> extends EventEmitter<Duplex.Events & Events>
  implements Readable<any>, Writable<any> {
  public allowHalfOpen: boolean;

  protected _readableState: ReadableState;

  protected _writableState: WritableState;

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

  protected _read!: (size?: number) => void;

  protected _write!: (chunk: Buffer, callback: (error?: Error) => void) => void;

  protected _writev!: (
    chunks: Buffer[],
    callback: (error?: Error) => void,
  ) => void;

  protected _destroy!: (
    error: Error | undefined,
    callback: (error?: Error) => void,
  ) => void;

  protected _final?: (callback: (error?: Error) => void) => void;

  constructor(options: Duplex.Options = {}) {
    super();

    this._readableState = new ReadableState(options);

    this._writableState = new WritableState(options);

    const {
      allowHalfOpen = true,
      read,
      write,
      writev,
      destroy,
      final,
    } = options;

    this.allowHalfOpen = allowHalfOpen;

    if (read) this._read = read;

    if (write) this._write = write;

    if (writev) this._writev = writev;

    if (destroy) this._destroy = destroy;

    if (final) this._final = final;
  }
}

export default Duplex;
