import { Encoding, Pipe } from ".";

const EMPTY = Buffer.alloc(0);
const HIGH_WATER_MARK = 16 * 1024;

namespace ReadableState {
  export interface Options {
    highWaterMark?: number;
    encoding?: Encoding;
  }

  export interface Item {
    data: Buffer;
    next?: Item;
  }
}

class ReadableState {
  public highWaterMark: number;

  public head?: ReadableState.Item;
  public tail?: ReadableState.Item;

  public length = 0;

  public bytes = 0;

  public consumed = 0;

  public pipes: Pipe[] = [];

  public reading = false;

  public ended = false;

  public flowing: boolean | null = null;

  public encoding?: Encoding;

  constructor(options: ReadableState.Options) {
    const { highWaterMark = HIGH_WATER_MARK, encoding } = options;

    this.highWaterMark = highWaterMark;
    this.encoding = encoding;
  }

  public push(chunk: Buffer) {
    const entry = { data: chunk };

    if (this.length > 0) this.tail!.next = entry;
    else this.head = entry;

    this.tail = entry;

    ++this.length;

    this.bytes += chunk.length;
  }

  public unshift(chunk: Buffer) {
    if (chunk.length === 0) return;

    const entry = { data: chunk, next: this.head };

    if (this.length === 0) this.tail = entry;
    this.head = entry;

    ++this.length;

    this.bytes += chunk.length;
    this.consumed -= chunk.length;
  }

  public shift() {
    if (this.length === 0) return;

    const chunk = this.head!.data;

    if (this.length === 1) this.head = this.tail = undefined;
    else this.head = this.head!.next;

    --this.length;

    this.bytes -= chunk.length;
    this.consumed += chunk.length;

    return chunk;
  }

  public concat() {
    if (this.length === 1) return this.shift()!;

    const ret = Buffer.allocUnsafe(this.bytes);

    let i = 0;
    let chunk = this.head;

    while (chunk) {
      chunk.data.copy(ret, i);

      i += chunk.data.length;

      chunk = chunk.next;
    }

    this.consumed += this.bytes;
    this.bytes = this.length = 0;
    this.head = this.tail = undefined;

    return ret;
  }

  public consume(size: number) {
    let chunk = this.head!.data;

    if (size < chunk.length) {
      this.head!.data = chunk.slice(size);

      this.bytes -= size;
      this.consumed += size;

      return chunk.slice(0, size);
    }

    chunk = this.shift()!;

    if (size === chunk.length) return chunk;

    const ret = Buffer.allocUnsafe(size);
    const length = size;

    chunk.copy(ret);
    size -= chunk.length;

    // tslint:disable-next-line:no-conditional-assignment
    while (size && (chunk = this.shift()!)) {
      chunk.copy(ret, length - size, 0, size);

      if (size === chunk.length) return ret;

      if (size > chunk.length) {
        size -= chunk.length;

        continue;
      }

      this.unshift(chunk.slice(size));

      return ret;
    }

    return ret;
  }
}

export default ReadableState;
