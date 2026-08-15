const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const { createApp } = require("../server");

test("challenge dashboard redirects to login when no session exists", async () => {
  const app = await createApp();

  await new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      http.get({ host: "127.0.0.1", port, path: "/challenges" }, (res) => {
        try {
          assert.equal(res.statusCode, 302);
          assert.equal(res.headers.location, "/login");
          server.close(() => resolve());
        } catch (error) {
          server.close(() => reject(error));
        }
      }).on("error", (error) => {
        server.close(() => reject(error));
      });
    });
  });
});
