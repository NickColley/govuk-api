# GOV.UK API

Node.js API for GOV.UK Content and Search APIs.

[![GOVUK API latest npm version](https://img.shields.io/npm/v/@nickcolley/govuk.svg?v=2)](https://www.npmjs.com/package/@nickcolley/govuk)

## Getting started

### Node

```bash
npm install @nickcolley/govuk
```

```javascript
// index.mjs;
import { SearchAPI, ContentAPI } from "@nickcolley/govuk";

async function main() {
  const searchApi = new SearchAPI();
  const contentApi = new ContentAPI();

  const results = await searchApi.get("Keeping a pet pig");
  // Find the first result that is closest...
  const searchItem = results.find((item) => item.title.includes("micropig"));
  const contentItem = await contentApi.get(searchItem.link);

  console.log(contentItem);
}
main();
```

```bash
node index.mjs
```

### Browser

> ContentAPI does not work in the browser because [CORS headers are not set correctly](https://github.com/NickColley/govuk/issues/1).

```html
<!-- index.html -->
<script type="module">
  import { SearchAPI } from "https://unpkg.com/@nickcolley/govuk";
  const api = new SearchAPI();
  const results = await api.get("Potato");
  document.write(
    results
      .map((item) => `<a href="https://gov.uk${item.link}">${item.title}</a>`)
      .join("<br>")
  );
</script>
```

Check out the [full code examples](./examples/).
