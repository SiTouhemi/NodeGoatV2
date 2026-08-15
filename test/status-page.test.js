const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const { createApp } = require("../server");

test("status page exposes runtime details for local operators", async () => {
  const app = await createApp();

  await new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      http.get({ host: "127.0.0.1", port, path: "/status" }, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            assert.equal(res.statusCode, 200);
            assert.match(body, /Runtime status/i);
            assert.match(body, /Demo accounts/i);
            assert.match(body, /Health/i);
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
