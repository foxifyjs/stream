import { ReadableState, WritableState } from ".";
import { Readable, Writable } from "..";

function destroy<T extends Readable<any> | Writable<any>>(
  stream: T,
  error?: Error,
) {
  const wState = ((stream as any)._writableState || {}) as WritableState;
  const rState = ((stream as any)._readableState || {}) as ReadableState;

  if (wState.ending || wState.ended || rState.ended) return stream;

  wState.ending = true;

  (stream as any)._destroy(error, (err?: Error) => {
    rState.ended = true;
    wState.ended = true;
    wState.ending = false;

    if (err) stream.emit("error", err);

    stream.emit("close");
  });

  return stream;
}

export default destroy;
