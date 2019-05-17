const { Suite } = require("benchmark");
const { Writable } = require("stream");
const { Writable: FoxifyWritable } = require("..");

new Suite()
  .add("stream", () => {
    const writable = new Writable();
  })
  .add("@foxify/stream", () => {
    const writable = new FoxifyWritable();
  })
  .on("cycle", e => {
    console.log(e.target.toString());
  })
  .on("complete", function onComplete() {
    console.log("Fastest is %s", this.filter("fastest").map("name"));
  })
  .run({ async: true });
