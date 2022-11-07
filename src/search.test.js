import test from "ava";
import esmock from "esmock";

function mockAPI(jsonFunction) {
  return esmock("./search.js", {
    "async-retry": (passThrough) => passThrough(),
    "node-fetch": (baseUrl) => ({
      json: () => jsonFunction(baseUrl),
    }),
  });
}

async function suite() {
  const SearchAPI = await mockAPI((baseUrl) => ({
    total: 5000,
    results: baseUrl,
  }));

  test("constructor › default query", async (assert) => {
    const api = new SearchAPI("Register to vote");
    const results = await api.get();
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote"
    );
  });

  test("constructor › default options", async (assert) => {
    const api = new SearchAPI({ filter_format: "guide" });
    const results = await api.get();
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?filter_format=guide"
    );
  });

  test("get › should blow up if given nothing", async (assert) => {
    const api = new SearchAPI();
    await assert.throwsAsync(
      async () => {
        await api.get();
      },
      { instanceOf: Error, message: "No search query" }
    );
  });

  test("get › should search for something if given a string", async (assert) => {
    const api = new SearchAPI();
    const results = await api.get("Register to vote");
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote"
    );
  });

  test("get › should allow q parameter", async (assert) => {
    const api = new SearchAPI();
    const results = await api.get({ q: "Register to vote" });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote"
    );
  });

  test("get › should allow count parameter", async (assert) => {
    const api = new SearchAPI();
    const results = await api.get("Register to vote", { count: 50 });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote&count=50"
    );
  });

  test("get › should allow start parameter", async (assert) => {
    const api = new SearchAPI();
    const results = await api.get("Register to vote", { start: 50 });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote&start=50"
    );
  });

  test("get › should allow order parameter", async (assert) => {
    const api = new SearchAPI();
    const results = await api.get("Register to vote", { order: "asc" });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote&order=asc"
    );
  });

  test("get › should blow up if fields parameter is not an array", async (assert) => {
    const api = new SearchAPI();
    await assert.throwsAsync(
      async () => {
        await api.get("Register to vote", { fields: "string" });
      },
      { instanceOf: Error, message: "Fields parameter must be an array" }
    );
  });

  test("get › should allow fields parameter", async (assert) => {
    const api = new SearchAPI();
    const results = await api.get("Register to vote", {
      fields: ["title", "link"],
    });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote&fields=title&fields=link"
    );
  });

  test("get › should allow faceted filter_ parameter", async (assert) => {
    const api = new SearchAPI();
    const results = await api.get({
      filter_format: "statistics_announcement",
    });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?filter_format=statistics_announcement"
    );
  });

  test("get › should allow faceted reject_ parameter", async (assert) => {
    const api = new SearchAPI();
    const results = await api.get({
      reject_format: "statistics_announcement",
    });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?reject_format=statistics_announcement"
    );
  });

  test("get › should return empty results if falsey results", async (assert) => {
    const SearchAPIWithFalseyResults = await mockAPI(() => ({}));
    const api = new SearchAPIWithFalseyResults();
    const results = await api.get({
      aggregate_format: "statistics_announcement",
    });
    assert.deepEqual(results, []);
  });

  test("get › should allow faceted aggregate_ parameter", async (assert) => {
    const api = new SearchAPI();
    const results = await api.get({
      aggregate_format: "statistics_announcement",
    });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?aggregate_format=statistics_announcement"
    );
  });

  test("get › should allow grouped facets", async (assert) => {
    const api = new SearchAPI();
    const results = await api.get({
      facet_organisations: 1000,
      count: 0,
    });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?count=0&facet_organisations=1000"
    );
  });

  test("getAll › should blow up with no search query", async (assert) => {
    const api = new SearchAPI();
    await assert.throwsAsync(
      async () => {
        await api.getAll();
      },
      { instanceOf: Error, message: "No search query" }
    );
  });

  test("getAll › should no items if query matches no items", async (assert) => {
    const SearchAPIWithNoResults = await mockAPI((baseUrl) => ({
      total: 0,
      results: baseUrl,
    }));
    const api = new SearchAPIWithNoResults();
    const results = await api.getAll("Something that results no items");
    assert.deepEqual(results, []);
  });

  test("getAll › should return all items matching search query", async (assert) => {
    const api = new SearchAPI();
    const results = await api.getAll("Micro pigs");
    assert.deepEqual(
      results.map((result) => String(result)),
      [
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=1000&start=0",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=1000&start=1000",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=1000&start=2000",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=1000&start=3000",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=1000&start=4000",
      ]
    );
  });

  test("getAll › should use different count", async (assert) => {
    const api = new SearchAPI({ count: 990 });
    const results = await api.getAll("Micro pigs");
    assert.deepEqual(
      results.map((result) => String(result)),
      [
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=990&start=0",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=990&start=990",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=990&start=1980",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=990&start=2970",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=990&start=3960",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=990&start=4950",
      ]
    );
  });

  test("total › should total for items", async (assert) => {
    const SearchAPIWithACustomTotal = await mockAPI((baseUrl) => ({
      total: 1234,
      results: baseUrl,
    }));
    const api = new SearchAPIWithACustomTotal();
    const result = await api.total("Micro pigs");
    assert.is(result, 1234);
  });

  test("info › should show info for item", async (assert) => {
    const SearchAPIWithSingleResult = await mockAPI((baseUrl) => ({
      total: 1,
      results: [baseUrl],
    }));
    const api = new SearchAPIWithSingleResult();
    const result = await api.info("register-to-vote");
    assert.deepEqual(
      String(result),
      "https://www.gov.uk/api/search.json?count=1&filter_link=%2Fregister-to-vote"
    );
  });

  test("info › should show info for item with path with forward slash", async (assert) => {
    const SearchAPIWithSingleResult = await mockAPI((baseUrl) => ({
      total: 1,
      results: [baseUrl],
    }));
    const api = new SearchAPIWithSingleResult();
    const result = await api.info("/register-to-vote");
    assert.deepEqual(
      String(result),
      "https://www.gov.uk/api/search.json?count=1&filter_link=%2Fregister-to-vote"
    );
  });

  test("facets › should show facets available for field", async (assert) => {
    const SearchAPIWithSingleResult = await mockAPI((baseUrl) => ({
      total: 1,
      facets: {
        format: {
          options: [baseUrl],
        },
      },
    }));
    const api = new SearchAPIWithSingleResult();
    const result = await api.facets("format");
    assert.deepEqual(
      String(result),
      "https://www.gov.uk/api/search.json?count=0&facet_format=10000"
    );
  });

  test("events", async (assert) => {
    const queries = ["Register to vote", "Micro pig", "Equality Act 2010"];
    assert.plan(queries.length);

    let count = 0;
    const api = new SearchAPI();
    queries.forEach((query) => api.get(query));
    return new Promise((resolve) => {
      api.on("data", (result) => {
        assert.deepEqual(
          String(result.href),
          "https://www.gov.uk/api/search.json?" +
            new URLSearchParams({ q: queries[count] })
        );
        count++;
        if (count === 3) {
          resolve();
        }
      });
    });
  });
}
suite();
