import { Encoding } from ".";

const HIGH_WATER_MARK = 16 * 1024;

// tslint:disable-next-line:no-empty
function noop() {}

namespace WritableState {
  export interface Options {
    highWaterMark?: number;
    decodeStrings?: boolean;
    defaultEncoding?: Encoding;
  }

  export interface Item {
    data: Buffer;
    next?: Item;
  }
}

class WritableState {
  public highWaterMark: number;

  public encoding: Encoding;

  public chunks: Buffer[] = [];

  public head?: WritableState.Item;
  public tail?: WritableState.Item;

  public bytes = 0;

  public sent = 0;

  public writing = false;

  public corked = false;

  public ended = false;

  public ending = false;

  public callbacks: Array<(error?: Error) => void> = [];

  public get length() {
    return this.chunks.length;
  }

  constructor(options: WritableState.Options) {
    const {
      highWaterMark = HIGH_WATER_MARK,
      defaultEncoding = "utf8",
    } = options;

    this.highWaterMark = highWaterMark;
    this.encoding = defaultEncoding;
  }

  public push(chunk: Buffer, callback?: (error?: Error) => void) {
    if (chunk.length === 0) return this.bytes < this.highWaterMark;

    this.chunks.push(chunk);

    this.bytes += chunk.length;

    if (callback) this.callbacks.push(callback);

    return this.bytes < this.highWaterMark;
  }

  public merge(chunks: Buffer[], callback?: (error?: Error) => void) {
    if (chunks.length === 0) return this.bytes < this.highWaterMark;

    let bytes = 0;
    for (let i = chunks.length - 1; i >= 0; i--) bytes += chunks[i].length;

    this.chunks = this.chunks.concat(chunks);

    this.bytes += bytes;

    if (callback) this.callbacks.push(callback);

    return this.bytes < this.highWaterMark;
  }

  public consume() {
    const chunks = this.chunks;
    const callbacks = this.callbacks;

    this.sent += this.bytes;
    this.bytes = 0;
    this.chunks = [];
    this.callbacks = [];

    let callback;

    if (callbacks.length) {
      callback = (error?: Error) => {
        for (let i = callbacks.length - 1; i >= 0; i--) callbacks[i](error);
      };
    } else callback = noop;

    return { chunks, callback };
  }
}

export default WritableState;
