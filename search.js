import { URL, URLSearchParams } from "node:url";
import fetch from "node-fetch";
import retry from "async-retry";
import debug from "debug";
import PQueue from "p-queue";

const getStartValues = (total, count) => {
  if (!total || !count) {
    return [];
  }
  // Figure out how many times we need to hit the API.
  const iterationsNeeded = Math.ceil(total / count);
  // Fill an array with where we need to start from each time we hit it.
  // Allows us to query async
  return Array(iterationsNeeded)
    .fill(0)
    .map((_, index) => index * count);
};

const MAX_PER_PAGE = 1000;

export default class SearchAPI {
  constructor() {
    const { q, ...options } = this.#parseArguments(...arguments);
    this.defaultQuery = q;
    this.defaultOptions = options;
    if (this.defaultQuery) {
      debug("govuk:search")("Default search query:");
      debug("govuk:search")(this.defaultQuery);
    }
    if (this.defaultOptions) {
      debug("govuk:search")("Default search options:");
      debug("govuk:search")(this.defaultOptions);
    }

    // Search API doesnt seem to have a rate limit...
    // https://dataingovernment.blog.gov.uk/2016/05/26/use-the-search-api-to-get-useful-information-about-gov-uk-content/
    // https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html
    const queueOptions = {};
    debug("govuk:search")("Queue options:");
    debug("govuk:search")(queueOptions);
    this.queue = new PQueue(queueOptions);
  }

  #parseArguments(queryOrOptions, maybeOptions) {
    let options = {};
    // ("Register to vote", { count: 2 }) => query: "Register to vote", options: { count: 2 }
    if (typeof queryOrOptions === "string") {
      options = maybeOptions || {};
      options.q = queryOrOptions;
    }

    // ({ q: "Register to vote", count: 2 }) => query: "Register to vote", options: { count: 2 }
    if (typeof queryOrOptions === "object") {
      options = queryOrOptions;
    }

    if (
      typeof options.q === "undefined" &&
      typeof this.defaultQuery !== "undefined"
    ) {
      options.q = this.defaultQuery;
    }

    return {
      ...this.defaultOptions,
      ...options,
    };
  }

  async #get(options) {
    debug("govuk:search:get")("Search options:");
    debug("govuk:search:get")(options);
    if (Object.keys(options).length === 0) {
      throw new Error("No search query");
    }

    const { q, count, start, order, fields, ...otherOptions } = options;

    const baseUrl = new URL("https://www.gov.uk/api/search.json");
    const params = new URLSearchParams();
    if (q) {
      params.append("q", q);
    }
    // https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html#pagination
    if (count) {
      params.append("count", count);
    }
    if (start) {
      params.append("start", start);
    }
    if (order) {
      params.append("order", order);
    }
    // https://github.com/alphagov/search-api/blob/main/config/schema/field_definitions.json
    if (fields) {
      if (!(fields instanceof Array)) {
        throw new Error("Fields parameter must be an array");
      }
      fields.forEach((field) => {
        params.append("fields", field);
      });
    }
    // https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html#using-faceted-search-parameters
    Object.keys(otherOptions).forEach((key) => {
      if (
        key.startsWith("filter_") ||
        key.startsWith("reject_") ||
        key.startsWith("aggregate_")
      ) {
        params.append(key, otherOptions[key]);
      }
    });
    debug("govuk:search:get")("Search parameters:");
    debug("govuk:search:get")(params);
    baseUrl.search = params;
    debug("govuk:search:get")("Search URL:");
    debug("govuk:search:get")(String(baseUrl));
    // Sometimes GOV.UK Apis can be flakey when they're cold so retry if they fail.
    return await retry(async () => {
      return await this.queue.add(async () => {
        const response = await fetch(baseUrl);
        return await response.json();
      });
    });
  }

  async getAll() {
    const { count, ...options } = this.#parseArguments(...arguments);

    const perPage = typeof count === "undefined" ? MAX_PER_PAGE : count;
    debug("govuk:search:getAll")("Search options:");
    debug("govuk:search:getAll")(options);
    if (Object.keys(options).length === 0) {
      throw new Error("No search query");
    }
    debug("govuk:search:getAll")("Getting total results...");
    const total = await this.total(options);
    const startValues = getStartValues(total, perPage);
    debug("govuk:search:getAll")(`Total results found: ${total}`);
    debug("govuk:search:getAll")(`Per page: "${perPage}"`);
    debug("govuk:search:getAll")(
      `Paginate using ${startValues.length} request(s)`
    );
    // Paginate over results...
    const results = await Promise.all(
      startValues.map((start) =>
        this.get({
          ...options,
          count: perPage,
          start,
        })
      )
    );
    return results.flat();
  }

  async total() {
    const options = this.#parseArguments(...arguments);
    const response = await this.#get({
      ...options,
      count: 0,
    });
    return response.total || undefined;
  }

  async get() {
    const options = this.#parseArguments(...arguments);
    const response = await this.#get(options);
    return response.results || [];
  }
}
