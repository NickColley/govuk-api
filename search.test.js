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
    const client = new SearchAPI("Register to vote");
    const results = await client.get();
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote"
    );
  });

  test("constructor › default options", async (assert) => {
    const client = new SearchAPI({ filter_format: "guide" });
    const results = await client.get();
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?filter_format=guide"
    );
  });

  test("get › should blow up if given nothing", async (assert) => {
    const client = new SearchAPI();
    await assert.throwsAsync(
      async () => {
        await client.get();
      },
      { instanceOf: Error, message: "No search query" }
    );
  });

  test("get › should search for something if given a string", async (assert) => {
    const client = new SearchAPI();
    const results = await client.get("Register to vote");
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote"
    );
  });

  test("get › should allow q parameter", async (assert) => {
    const client = new SearchAPI();
    const results = await client.get({ q: "Register to vote" });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote"
    );
  });

  test("get › should allow count parameter", async (assert) => {
    const client = new SearchAPI();
    const results = await client.get("Register to vote", { count: 50 });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote&count=50"
    );
  });

  test("get › should allow start parameter", async (assert) => {
    const client = new SearchAPI();
    const results = await client.get("Register to vote", { start: 50 });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote&start=50"
    );
  });

  test("get › should allow order parameter", async (assert) => {
    const client = new SearchAPI();
    const results = await client.get("Register to vote", { order: "asc" });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote&order=asc"
    );
  });

  test("get › should blow up if fields parameter is not an array", async (assert) => {
    const client = new SearchAPI();
    await assert.throwsAsync(
      async () => {
        await client.get("Register to vote", { fields: "string" });
      },
      { instanceOf: Error, message: "Fields parameter must be an array" }
    );
  });

  test("get › should allow fields parameter", async (assert) => {
    const client = new SearchAPI();
    const results = await client.get("Register to vote", {
      fields: ["title", "link"],
    });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?q=Register+to+vote&fields=title&fields=link"
    );
  });

  test("get › should allow faceted filter_ parameter", async (assert) => {
    const client = new SearchAPI();
    const results = await client.get({
      filter_format: "statistics_announcement",
    });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?filter_format=statistics_announcement"
    );
  });

  test("get › should allow faceted reject_ parameter", async (assert) => {
    const client = new SearchAPI();
    const results = await client.get({
      reject_format: "statistics_announcement",
    });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?reject_format=statistics_announcement"
    );
  });

  test("get › should allow faceted aggregate_ parameter", async (assert) => {
    const client = new SearchAPI();
    const results = await client.get({
      aggregate_format: "statistics_announcement",
    });
    assert.deepEqual(
      String(results),
      "https://www.gov.uk/api/search.json?aggregate_format=statistics_announcement"
    );
  });

  test("getAll › should blow up with no search query", async (assert) => {
    const client = new SearchAPI();
    await assert.throwsAsync(
      async () => {
        await client.getAll();
      },
      { instanceOf: Error, message: "No search query" }
    );
  });

  test("getAll › should no items if query matches no items", async (assert) => {
    const SearchAPIWithNoResults = await mockAPI((baseUrl) => ({
      total: 0,
      results: baseUrl,
    }));
    const client = new SearchAPIWithNoResults();
    const results = await client.getAll("Something that results no items");
    assert.deepEqual(results, []);
  });

  test("getAll › should return all items matching search query", async (assert) => {
    const client = new SearchAPI();
    const results = await client.getAll("Micro pigs");
    assert.deepEqual(
      results.map((result) => String(result)),
      [
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=1000",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=1000&start=1000",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=1000&start=2000",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=1000&start=3000",
        "https://www.gov.uk/api/search.json?q=Micro+pigs&count=1000&start=4000",
      ]
    );
  });

  test("total › should total for items", async (assert) => {
    const SearchAPIWithACustomTotal = await mockAPI((baseUrl) => ({
      total: 1234,
      results: baseUrl,
    }));
    const client = new SearchAPIWithACustomTotal();
    const results = await client.total("Micro pigs");
    assert.is(results, 1234);
  });
}
suite();
