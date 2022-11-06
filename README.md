# GOV.UK API

Node.js API for GOV.UK Content and Search APIs.

[![GOVUK API latest npm version](https://img.shields.io/npm/v/@nickcolley/govuk.svg?v=2)](https://www.npmjs.com/package/@nickcolley/govuk)

## Getting started

```bash
npm install @nickcolley/govuk
```

```javascript
// index.mjs;
import { SearchAPI } from "@nickcolley/govuk";

(async () => {
  const api = new SearchAPI();
  const results = await api.get("Potato");
  results.map((result) => console.log(result.title));
})();
```

```bash
node index.mjs
```

Check out the [full code examples](./examples/).

## CommonJS

```javascript
// index.cjs;
(async () => {
  const { SearchAPI } = await import("@nickcolley/govuk");
  const api = new SearchAPI();
  const results = await api.get("Potato");
  results.map((result) => console.log(result.title));
})();
```
