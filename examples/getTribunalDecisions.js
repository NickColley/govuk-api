import * as os from "node:os";
import { createWriteStream } from "node:fs";
import JSONStream from "JSONStream";

import { ContentAPI, SearchAPI } from "../index.js";

async function main() {
  const query = "Potato";
  console.log(`Getting tribunal decisions for query "${query}"...`);
  console.time("Finished");

  const filter_format = "employment_tribunal_decision";
  const fields = ["title", "link"];
  const searchAPI = new SearchAPI({ fields, filter_format });

  const total = await searchAPI.total(query);
  console.log(`Found ${total} items, getting results...`);
  const searchItems = await searchAPI.getAll(query);

  const contentApi = new ContentAPI();

  // Schedule each request...
  searchItems.forEach((result) => contentApi.get(result.link));

  const jsonStream = JSONStream.stringify("[", ",\n", "]" + os.EOL);
  const filePath = "examples/data.json";
  const writeableStream = createWriteStream(filePath);
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
      process.nextTick(() => {
        jsonStream.end();
      });
    }
  });
}
main();
