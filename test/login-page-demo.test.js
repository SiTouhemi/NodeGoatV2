const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const { createApp } = require("../server");

const httpRequest = (options, body) => new Promise((resolve, reject) => {
  const req = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: data
      });
    });
  });

  req.on("error", reject);
  if (body) {
    req.write(body);
  }
  req.end();
});

test("login page includes demo account guidance for quicker onboarding", async () => {
  const app = await createApp();

  await new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      http.get({ host: "127.0.0.1", port, path: "/login" }, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            assert.equal(res.statusCode, 200);
            assert.match(body, /Demo accounts/i);
            assert.match(body, /admin/i);
            assert.match(body, /Admin_123/i);
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

test("demo login route signs in the known admin account immediately", async () => {
  const app = await createApp();

  await new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      const port = server.address().port;
      try {
        const firstResponse = await httpRequest({
          host: "127.0.0.1",
          port,
          path: "/demo-login/admin",
          method: "GET",
          headers: {
            Accept: "text/html"
          }
        });

        assert.equal(firstResponse.statusCode, 302);
        assert.equal(firstResponse.headers.location, "/benefits");
        server.close(() => resolve());
      } catch (error) {
        server.close(() => reject(error));
      }
    });
  });
});
