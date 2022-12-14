import { URL } from "node:url";
import test from "ava";
import esmock from "esmock";

async function suite() {
  const ContentAPI = await esmock("./content.js", {
    "async-retry": (passThrough) => passThrough(),
    "node-fetch": (baseUrl) => ({
      json: () => ({
        baseUrl,
      }),
    }),
  });

  test("should blow up if given nothing", async (assert) => {
    const api = new ContentAPI();
    await assert.throwsAsync(
      async () => {
        await api.get();
      },
      { instanceOf: Error, message: "No content item path" }
    );
  });

  test("should get content item if given path", async (assert) => {
    const api = new ContentAPI();
    const results = await api.get("register-to-vote");
    assert.deepEqual(results, {
      baseUrl: new URL("https://www.gov.uk/api/content/register-to-vote"),
    });
  });

  test("should get content item if given path with forwards slash", async (assert) => {
    const api = new ContentAPI();
    const results = await api.get("/register-to-vote");
    assert.deepEqual(results, {
      baseUrl: new URL("https://www.gov.uk/api/content/register-to-vote"),
    });
  });

  test("events", async (assert) => {
    const paths = [
      "/register-to-vote",
      "/guidance/keeping-a-pet-pig-or-micropig",
      "/guidance/equality-act-2010-guidance",
    ];
    assert.plan(paths.length);

    let count = 0;
    const api = new ContentAPI();

    paths.forEach((path) => api.get(path));
    return new Promise((resolve) => {
      api.on("data", (result) => {
        assert.deepEqual(result, {
          baseUrl: new URL("https://www.gov.uk/api/content" + paths[count]),
        });
        count++;
        if (count === paths.length) {
          resolve();
        }
      });
    });
  });
}
suite();
