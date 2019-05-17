const { Suite } = require("benchmark");
const { Readable } = require("stream");
const { Readable: FoxifyReadable } = require("..");

const buffer = Buffer.alloc(1024 * 1024);

function read() {
}

const readable = new Readable({ read });
const foxifyReadable = new FoxifyReadable({ read });

new Suite()
  .add("stream", () => {
    readable.push(buffer);
    readable.read();
  })
  .add("@foxify/stream", () => {
    foxifyReadable.push(buffer);
    foxifyReadable.read();
  })
  .on("cycle", e => {
    console.log(e.target.toString());
  })
  .on("complete", function onComplete() {
    console.log("Fastest is %s", this.filter("fastest").map("name"));
  })
  .run({ async: true });
