# GOV.UK API Client

JavaScript API client for GOV.UK Content and Search APIs.

[![GOVUK API latest npm version](https://img.shields.io/npm/v/govuk-api.svg?v=2)](https://www.npmjs.com/package/govuk-api)

## Contents

- [Getting started](#getting-started)
- [Examples](#examples)
- [Content API](#content-api)
- [Search API](#search-api)

## Getting started

### Node

```bash
npm init mjs -y # initialise module-ready package.json
npm install govuk-api
```

```javascript
// index.js;
import { SearchAPI, ContentAPI } from "govuk-api";

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

```html
<!-- index.html -->
<script type="module">
  import { SearchAPI, ContentAPI } from "https://unpkg.com/govuk-api";

  const searchApi = new SearchAPI();
  const contentApi = new ContentAPI();

  const results = await searchApi.get("Keeping a pet pig");
  // Find the first result that is closest...
  const searchItem = results.find((item) => item.title.includes("micropig"));
  const contentItem = await contentApi.get(searchItem.link);

  console.log(contentItem);
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
import { ContentAPI } from "govuk-api";
const api = new ContentAPI();
const contentItem = await api.get("Register-to-vote");
console.log(contentItem);
```

#### Getting data from event

```javascript
import { ContentAPI } from "govuk-api";
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

| Parameter      | Type                              | Required |
| -------------- | --------------------------------- | -------- |
| queryOrOptions | `string` \| [`Options`](#options) | true     |
| [options]      | [`Options`](#options)             | false    |

#### Getting data from resolved promise

```javascript
import { SearchAPI } from "govuk-api";
const api = new SearchAPI("Micro pig", { count: 10 });
const searchResults = await api.get();
console.log(searchResults);
```

### get(queryOrOptions, [options])

Get first page of search items for a query

| Parameter      | Type                              | Required |
| -------------- | --------------------------------- | -------- |
| queryOrOptions | `string` \| [`Options`](#options) | true     |
| [options]      | [`Options`](#options)             | false    |

#### Getting data from resolved promise

```javascript
import { SearchAPI } from "govuk-api";
const api = new SearchAPI();
const searchResults = await api.get("Micro pig");
console.log(searchResults);
```

#### Getting data from event

```javascript
import { SearchAPI } from "govuk-api";
const api = new SearchAPI();
api.on("data", (searchResults) => {
  console.log(searchResults);
});
api.get("Micro pig");
```

### getAll(queryOrOptions, [options])

Get all pages of search items for a query.

| Parameter      | Type                              | Required | Description               |
| -------------- | --------------------------------- | -------- | ------------------------- |
| queryOrOptions | `string` \| [`Options`](#options) | true     |
| [options]      | [`Options`](#options)             | false    |
| options.total  | number                            | false    | maximum amount of results |

#### Getting data from resolved promise

```javascript
import { SearchAPI } from "govuk-api";
const api = new SearchAPI();
const searchResults = await api.getAll("Micro pig");
console.log(searchResults);
```

#### Getting data from event

```javascript
import { SearchAPI } from "govuk-api";
const api = new SearchAPI();
api.on("data", (searchResults) => {
  console.log(searchResults);
});
api.getAll("Micro pig");
```

### info(path)

Get metadata for a content item.

| Parameter | Type     | Required | Description                                                                                                  |
| --------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| path      | `string` | true     | The path to the content on GOV.UK e.g for `https://www.gov.uk/register-to-vote` you’d use `register-to-vote` |

#### Getting info from resolved promise

```javascript
import { SearchAPI } from "govuk-api";
const api = new SearchAPI();
const contentInfo = await api.info("register-to-vote");
console.log(contentInfo);
```

### total(queryOrOptions, [options])

Get total amount of search items for a query.

| Parameter      | Type                              | Required |
| -------------- | --------------------------------- | -------- |
| queryOrOptions | `string` \| [`Options`](#options) | true     |
| [options]      | [`Options`](#options)             | false    |

#### Getting total from resolved promise

```javascript
import { SearchAPI } from "govuk-api";
const api = new SearchAPI();
const totalResults = await api.total("Micro pig");
console.log(totalResults);
```

### facets(field)

Get facets for a field.

| Parameter | Type     | Required |
| --------- | -------- | -------- |
| field     | `string` | true     |

#### Getting facets from resolved promise

```javascript
import { SearchAPI } from "govuk-api";
const api = new SearchAPI();
const facets = await api.facets("formats");
console.log(facets);
```

### Options

[You can use any options available in the Search API](https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html).

| Name | Type     | Description  |
| ---- | -------- | ------------ |
| q    | `string` | search query |

#### [Pagination options](https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html#pagination)

| Name  | Type     | Description                 |
| ----- | -------- | --------------------------- |
| start | `number` | position to start           |
| count | `number` | number of results to return |
| order | `string` | sort order                  |

#### [Field options](https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html#returning-specific-document-fields)

| Name   | Type    | Description                         |
| ------ | ------- | ----------------------------------- |
| fields | `Array` | properties to return in search item |

#### [Faceted options](https://docs.publishing.service.gov.uk/repos/search-api/public-api/faceted-search)

| Name              | Type     | Description           |
| ----------------- | -------- | --------------------- |
| filter.[field]    | `string` | field to filter by    |
| aggregate.[field] | `string` | field to aggregate by |
| reject.[field]    | `string` | field to reject by    |
| facet.[field]     | `string` | group by field        |
