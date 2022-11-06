# GOV.UK API

Node.js API for GOV.UK Content and Search APIs

[![GOVUK API latest npm version](https://img.shields.io/npm/v/@nickcolley/govuk.svg)](https://www.npmjs.com/package/@nickcolley/govuk)

## Getting started

```bash
npm install @nickcolley/govuk
```

```javascript
async function main() {
  const searchAPI = new SearchAPI();
  const result = await searchAPI.get("Register to vote");
  console.log(result);
}
main();
```

See ./examples for [full code examples](./examples/).
