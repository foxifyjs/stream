const { Suite } = require("benchmark");
const { Writable } = require("stream");
const { Writable: FoxifyWritable } = require("..");

const buffer = Buffer.alloc(1024 * 1024);

const writable = new Writable({
  write(chunk, encoding, callback) {
    callback();
  },
});
const foxifyWritable = new FoxifyWritable({
  write(chunk, callback) {
    callback();
  },
});

new Suite()
  .add("stream", () => {
    writable.write(buffer);
  })
  .add("@foxify/stream", () => {
    foxifyWritable.write(buffer);
  })
  .on("cycle", e => {
    console.log(e.target.toString());
  })
  .on("complete", function onComplete() {
    console.log("Fastest is %s", this.filter("fastest").map("name"));
  })
  .run({ async: true });
