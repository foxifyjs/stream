const { Suite } = require("benchmark");
const { Duplex } = require("stream");
const { Duplex: FoxifyDuplex } = require("..");

new Suite()
  .add("stream", () => {
    const duplex = new Duplex();
  })
  .add("@foxify/stream", () => {
    const duplex = new FoxifyDuplex();
  })
  .on("cycle", e => {
    console.log(e.target.toString());
  })
  .on("complete", function onComplete() {
    console.log("Fastest is %s", this.filter("fastest").map("name"));
  })
  .run({ async: true });
