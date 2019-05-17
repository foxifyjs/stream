const { Suite } = require("benchmark");
const { Readable } = require("stream");
const { Readable: FoxifyReadable } = require("..");

new Suite()
  .add("stream", () => {
    const readable = new Readable();
  })
  .add("@foxify/stream", () => {
    const readable = new FoxifyReadable();
  })
  .on("cycle", e => {
    console.log(e.target.toString());
  })
  .on("complete", function onComplete() {
    console.log("Fastest is %s", this.filter("fastest").map("name"));
  })
  .run({ async: true });
