export { default as Pipe } from "./Pipe";
export { default as ReadableState } from "./ReadableState";
export { default as WritableState } from "./WritableState";
export { default as destroy } from "./destroy";
export {
  default as ERR_METHOD_NOT_IMPLEMENTED,
} from "./ERR_METHOD_NOT_IMPLEMENTED";

export function implement(baseCtor: any, excludes: string[]) {
  return (derivedCtor: any) => {
    // tslint:disable-next-line:ter-arrow-parens
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      if (excludes.includes(name)) return;

      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  };
}

export function toBuffer(
  chunk: Buffer | Uint8Array | string,
  encoding?: Encoding,
) {
  if (typeof chunk === "string") return Buffer.from(chunk, encoding);

  if (!Buffer.isBuffer(chunk)) {
    return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  }

  return chunk;
}

export type Encoding =
  | "ascii"
  | "utf8"
  | "utf-8"
  | "utf16le"
  | "ucs2"
  | "ucs-2"
  | "base64"
  | "latin1"
  | "binary"
  | "hex";
