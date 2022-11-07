# GOV.UK JavaScript API

JavaScript API for GOV.UK Content and Search APIs.

[![GOVUK API latest npm version](https://img.shields.io/npm/v/@nickcolley/govuk.svg?v=2)](https://www.npmjs.com/package/@nickcolley/govuk)

## Contents

- [Getting started](#getting-started)
- [Content API](#content-api)
- [Search API](#search-api)

## Getting started

### Node

```bash
npm init mjs -y # initialise module-ready package.json
npm install @nickcolley/govuk
```

```javascript
// index.js;
import { SearchAPI, ContentAPI } from "@nickcolley/govuk";

const searchApi = new SearchAPI();
const contentApi = new ContentAPI();

const results = await searchApi.get("Keeping a pet pig");
// Find the first result that is closest...
const searchItem = results.find((item) => item.title.includes("micropig"));
const contentItem = await contentApi.get(searchItem.link);

console.log(contentItem);
```

```bash
node index.js
```

### Browser

> ContentAPI does not work in the browser because [CORS headers are not set correctly](https://github.com/alphagov/content-store/issues/1006).

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

## Search API

[TODO]

## Content API

### get(path)

| Parameter | Type   | Required | Description                                                                                                  |
| --------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| path      | string | true     | The path to the content on GOV.UK e.g for `https://www.gov.uk/register-to-vote` you’d use `register-to-vote` |

Returns a [content item](https://content-api.publishing.service.gov.uk/reference.html#contentitem) from a promise or emitted by the 'data' event.

#### Getting data from resolved promise

```javascript
import { ContentAPI } from "@nickcolley/govuk";
const api = new ContentAPI();
const contentItem = await api.get("Register-to-vote");
console.log(contentItem);
```

#### Getting data from event

```javascript
import { ContentAPI } from "@nickcolley/govuk";
const api = new ContentAPI();
api.on("data", (contentItem) => {
  console.log(contentItem);
});
api.get("Register-to-vote");
```
