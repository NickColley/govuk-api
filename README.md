# GOV.UK JavaScript API

JavaScript API for GOV.UK Content and Search APIs.

[![GOVUK API latest npm version](https://img.shields.io/npm/v/@nickcolley/govuk.svg?v=2)](https://www.npmjs.com/package/@nickcolley/govuk)

## Contents

- [Getting started](#getting-started)
- [Examples](#examples)
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

## Examples

- [Streaming content items to json file](./examples/streaming-content-to-json/index.js)
- [Client-side browser Employment Tribunal Decision search](https://hello-govuk-api.glitch.me/) ([source](https://glitch.com/edit/#!/hello-govuk-api))

## Content API

Implements the [GOV.UK Content API](https://content-api.publishing.service.gov.uk).

### get(path)

Get a content item.

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

## Search API

Implements the [GOV.UK Search API](https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html).

[Use the search API to get useful information about GOV.UK content](https://dataingovernment.blog.gov.uk/2016/05/26/use-the-search-api-to-get-useful-information-about-gov-uk-content/)

### constructor(queryOrOptions, [options])

Set the default query and options for all other calls to `get`, `getAll` and `total` methods

| Parameter      | Type                                                    | Required |
| -------------- | ------------------------------------------------------- | -------- |
| queryOrOptions | <code>string</code> \| [<code>Options</code>](#options) | true     |
| [options]      | [<code>Options</code>](#options)                        | false    |

#### Getting data from resolved promise

```javascript
import { SearchAPI } from "@nickcolley/govuk";
const api = new SearchAPI("Micro pig", { count: 10 });
const searchResults = await api.get();
console.log(searchResults);
```

### get(queryOrOptions, [options])

Get first page of search items for a query

| Parameter      | Type                                                    | Required |
| -------------- | ------------------------------------------------------- | -------- |
| queryOrOptions | <code>string</code> \| [<code>Options</code>](#options) | true     |
| [options]      | [<code>Options</code>](#options)                        | false    |

#### Getting data from resolved promise

```javascript
import { SearchAPI } from "@nickcolley/govuk";
const api = new SearchAPI();
const searchResults = await api.get("Micro pig");
console.log(searchResults);
```

#### Getting data from event

```javascript
import { SearchAPI } from "@nickcolley/govuk";
const api = new SearchAPI();
api.on("data", (searchResults) => {
  console.log(searchResults);
});
api.get("Micro pig");
```

### getAll(queryOrOptions, [options])

Get all pages of search items for a query.

| Parameter      | Type                                                    | Required | Description               |
| -------------- | ------------------------------------------------------- | -------- | ------------------------- |
| queryOrOptions | <code>string</code> \| [<code>Options</code>](#options) | true     |
| [options]      | [<code>Options</code>](#options)                        | false    |
| options.total  | number                                                  | false    | maximum amount of results |

#### Getting data from resolved promise

```javascript
import { SearchAPI } from "@nickcolley/govuk";
const api = new SearchAPI();
const searchResults = await api.getAll("Micro pig");
console.log(searchResults);
```

#### Getting data from event

```javascript
import { SearchAPI } from "@nickcolley/govuk";
const api = new SearchAPI();
api.on("data", (searchResults) => {
  console.log(searchResults);
});
api.getAll("Micro pig");
```

### total(queryOrOptions, [options])

Get total amount of search items for a query.

| Parameter      | Type                                                    | Required |
| -------------- | ------------------------------------------------------- | -------- |
| queryOrOptions | <code>string</code> \| [<code>Options</code>](#options) | true     |
| [options]      | [<code>Options</code>](#options)                        | false    |

#### Getting total from resolved promise

```javascript
import { SearchAPI } from "@nickcolley/govuk";
const api = new SearchAPI();
const totalResults = await api.total("Micro pig");
console.log(totalResults);
```

### Options

[You can use any options available in the Search API](https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html).

| Name | Type                | Description  |
| ---- | ------------------- | ------------ |
| q    | <code>string</code> | search query |

#### [Pagination options](https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html#pagination)

| Name  | Type                | Description                 |
| ----- | ------------------- | --------------------------- |
| start | <code>number</code> | position to start           |
| count | <code>number</code> | number of results to return |
| order | <code>string</code> | sort order                  |

#### [Field options](https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html#returning-specific-document-fields)

| Name   | Type               | Description                         |
| ------ | ------------------ | ----------------------------------- |
| fields | <code>Array</code> | properties to return in search item |

#### [Faceted options](https://docs.publishing.service.gov.uk/repos/search-api/public-api/faceted-search)

| Name               | Type                | Description           |
| ------------------ | ------------------- | --------------------- |
| filter\_[field]    | <code>string</code> | field to filter by    |
| aggregate\_[field] | <code>string</code> | field to aggregate by |
| reject\_[field]    | <code>string</code> | field to reject by    |
