import EventEmitter from "eventemitter3";
import fetch from "node-fetch";
import retry from "async-retry";
import debug from "debug";
import throttledQueue from "throttled-queue";

// https://content-api.publishing.service.gov.uk/#rate-limiting
// API says only 10 requests per second so batch requests using a queue system to avoid this.
// Global throttle between instances, to avoid multiple clients from sending too many requests.
const requestsPerInterval = 10;
const secondsBetweenIntervals = 1;
const throttle = throttledQueue(
  requestsPerInterval,
  secondsBetweenIntervals * 1000,
  true
);

/**
 * ContentAPI
 * @constructor
 */
export default class ContentAPI extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * Get a content item
   * @param {string} path - path for content item
   * @fires ContentAPI#data content item json
   * @returns {Promise} content item json
   */
  async get(path) {
    if (!path) {
      throw new Error("No content item path");
    }
    let trimmedPath = path;
    if (path.startsWith("/")) {
      trimmedPath = path.substring(1);
    }
    const baseUrl = new URL(`https://www.gov.uk/api/content/${trimmedPath}`);

    // Sometimes GOV.UK Apis can be flakey when they're cold so retry if they fail.
    return throttle(() =>
      retry(async () => {
        debug("govuk:content:get")("Getting content item:", baseUrl.pathname);
        const response = await fetch(baseUrl);
        const json = await response.json();
        this.emit("data", json);
        return json;
      })
    );
  }
}
