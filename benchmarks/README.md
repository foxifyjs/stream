# Benchmarks

```bash
Starting benchmark writable-init.js

stream x 6,868,577 ops/sec ±0.55% (84 runs sampled)
@foxify/stream x 16,114,537 ops/sec ±1.03% (85 runs sampled)
Fastest is @foxify/stream

Starting benchmark readable-init.js

stream x 9,383,906 ops/sec ±0.63% (91 runs sampled)
@foxify/stream x 21,576,924 ops/sec ±0.38% (91 runs sampled)
Fastest is @foxify/stream

Starting benchmark readable-push-read.js

stream x 2,616,205 ops/sec ±4.77% (73 runs sampled)
@foxify/stream x 7,178,360 ops/sec ±2.58% (79 runs sampled)
Fastest is @foxify/stream

Starting benchmark writable-write.js

stream x 3,385,225 ops/sec ±5.04% (69 runs sampled)
@foxify/stream x 29,699,009 ops/sec ±2.83% (81 runs sampled)
Fastest is @foxify/stream

Starting benchmark readable-push-read-partial.js

stream x 4,211 ops/sec ±0.40% (89 runs sampled)
@foxify/stream x 4,199 ops/sec ±0.94% (86 runs sampled)
Fastest is stream,@foxify/stream

Starting benchmark duplex-init.js

stream x 4,067,127 ops/sec ±0.41% (89 runs sampled)
@foxify/stream x 11,110,275 ops/sec ±0.66% (87 runs sampled)
Fastest is @foxify/stream
```