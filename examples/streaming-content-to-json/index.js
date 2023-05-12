import { createWriteStream } from "node:fs";
import { ContentAPI, SearchAPI } from "govuk";
import JSONTransform from "./json-transform.js";

const query = "Potato";
console.log(`Getting tribunal decisions for query "${query}"...`);
console.time("Finished");

const format = "employment_tribunal_decision";
const fields = ["title", "link"];
const searchAPI = new SearchAPI({ fields, filter: { format } });

const total = await searchAPI.total(query);
console.log(`Found ${total} items, getting results...`);
const searchItems = await searchAPI.getAll(query);

const contentApi = new ContentAPI();

// Schedule each request...
searchItems.forEach((result) => contentApi.get(result.link));

const filePath = "data.json";
const writeableStream = createWriteStream(filePath);
const jsonStream = new JSONTransform();
jsonStream.pipe(writeableStream).on("finish", () => {
  console.log(`Wrote results to "${filePath}".`);
  console.timeEnd("Finished");
});

let count = 0;
contentApi.on("data", (contentItem) => {
  jsonStream.write(contentItem);
  count++;
  console.log(`${count}: "${contentItem.title}"`);
  if (count === total) {
    jsonStream.end();
  }
});
