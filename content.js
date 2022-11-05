import { URL } from "node:url";
import fetch from "node-fetch";
import retry from "async-retry";
import debug from "debug";
import PQueue from "p-queue";

export default class ContentAPI {
  constructor() {
    // https://content-api.publishing.service.gov.uk/#rate-limiting
    // API says only 10 requests per second so batch requests using a queue system to avoid this.

    const queueOptions = { interval: 1000, intervalCap: 10 };
    debug("govuk:content")("Queue options:");
    debug("govuk:content")(queueOptions);
    this.queue = new PQueue(queueOptions);
  }

  // Search API doesnt seem to have a rate limit...
  // https://dataingovernment.blog.gov.uk/2016/05/26/use-the-search-api-to-get-useful-information-about-gov-uk-content/
  // https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html
  async get(path) {
    if (!path) {
      throw new Error("No content item path");
    }
    let trimmedPath = path;
    if (path.startsWith("/")) {
      trimmedPath = path.substring(1);
    }
    const baseUrl = new URL(`https://www.gov.uk/api/content/${trimmedPath}`);

    debug("govuk:content:get")("Getting content item:", baseUrl.pathname);
    // Sometimes GOV.UK Apis can be flakey when they're cold so retry if they fail.
    return await retry(async () => {
      return await this.queue.add(async () => {
        const response = await fetch(baseUrl);
        return await response.json();
      });
    });
  }
}
