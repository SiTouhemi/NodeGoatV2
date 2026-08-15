const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const { createApp } = require("../server");

test("exposes a health endpoint for local checks", async () => {
  const app = await createApp();

  await new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      http.get({ host: "127.0.0.1", port, path: "/health" }, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk.toString();
        });
        res.on("end", () => {
          try {
            assert.equal(res.statusCode, 200);
            const payload = JSON.parse(body);
            assert.equal(payload.status, "ok");
            assert.equal(typeof payload.environment, "string");
            server.close(() => resolve());
          } catch (error) {
            server.close(() => reject(error));
          }
        });
      }).on("error", (error) => {
        server.close(() => reject(error));
      });
    });
  });
});
