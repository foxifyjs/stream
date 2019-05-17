# Stream <!-- omit in toc -->

`@foxify/stream` is a high performance Stream alternative for Node.js and browser that has been optimized to be faster than the native version, (why not?!).

[![NPM Version](https://img.shields.io/npm/v/@foxify/stream.svg)](https://www.npmjs.com/package/@foxify/stream)
[![TypeScript Version](https://img.shields.io/npm/types/@foxify/stream.svg)](https://www.typescriptlang.org)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@foxify/stream.svg)](https://www.npmjs.com/package/@foxify/stream)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@foxify/stream.svg)](https://www.npmjs.com/package/@foxify/stream)
[![Tested With Jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![Pull Requests](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](https://github.com/foxifyjs/stream/pulls)
[![License](https://img.shields.io/github/license/foxifyjs/stream.svg)](https://github.com/foxifyjs/stream/blob/master/LICENSE)
[![Build Status](https://api.travis-ci.com/foxifyjs/stream.svg?branch=master)](https://travis-ci.com/foxifyjs/stream)
[![Coverage Status](https://codecov.io/gh/foxifyjs/stream/branch/master/graph/badge.svg)](https://codecov.io/gh/foxifyjs/stream)
[![Package Quality](http://npm.packagequality.com/shield/%40foxify%2Fodin.svg)](http://packagequality.com/#?package=@foxify/stream)
[![Dependencies Status](https://david-dm.org/foxifyjs/stream.svg)](https://david-dm.org/foxifyjs/stream)
[![NPM Total Downloads](https://img.shields.io/npm/dt/@foxify/stream.svg)](https://www.npmjs.com/package/@foxify/stream)
[![NPM Monthly Downloads](https://img.shields.io/npm/dm/@foxify/stream.svg)](https://www.npmjs.com/package/@foxify/stream)
[![Open Issues](https://img.shields.io/github/issues-raw/foxifyjs/stream.svg)](https://github.com/foxifyjs/stream/issues?q=is%3Aopen+is%3Aissue)
[![Closed Issues](https://img.shields.io/github/issues-closed-raw/foxifyjs/stream.svg)](https://github.com/foxifyjs/stream/issues?q=is%3Aissue+is%3Aclosed)
[![known vulnerabilities](https://snyk.io/test/github/foxifyjs/stream/badge.svg?targetFile=package.json)](https://snyk.io/test/github/foxifyjs/stream?targetFile=package.json)
[![Github Stars](https://img.shields.io/github/stars/foxifyjs/stream.svg?style=social)](https://github.com/foxifyjs/stream)
[![Github Forks](https://img.shields.io/github/forks/foxifyjs/stream.svg?style=social&label=Fork)](https://github.com/foxifyjs/stream)

This module is API compatible with the Stream that ships by default with Node.js but there are some slight differences:

- Uses [`@foxify/events`](https://github.com/foxifyjs/events) as the EventEmitter.
- The `emitClose` option is not available.

## Table of Contents <!-- omit in toc -->

- [Installation](#installation)
- [Usage](#usage)
- [Benchmarks](#benchmarks)
- [Versioning](#versioning)
- [Authors](#authors)
- [License](#license)

## Installation

```bash
npm i @foxify/events
```

## Usage

```js
const { EventEmitter } = require("@foxify/events");
```

For the API documentation, please follow the official Node.js [documentation](https://nodejs.org/api/stream.html).

## Benchmarks

```bash
npm run benchmarks
```

## Versioning

We use [SemVer](http://semver.org) for versioning. For the versions available, see the [tags on this repository](https://github.com/foxifyjs/stream/tags).

## Authors

- **Ardalan Amini** - *Core Maintainer* - [@ardalanamini](https://github.com/ardalanamini)

See also the list of [contributors](https://github.com/foxifyjs/stream/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details