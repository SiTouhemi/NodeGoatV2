"use strict";

require("dotenv").config();

const express = require("express");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const session = require("express-session");
// const csrf = require('csurf');
const consolidate = require("consolidate"); // Templating library adapter for Express
const swig = require("swig");
// const helmet = require("helmet");
const MongoClient = require("mongodb").MongoClient; // Driver for connecting to MongoDB
const http = require("http");
const marked = require("marked");
//const nosniff = require('dont-sniff-mimetype');
const routes = require("./app/routes");
const { port, db, cookieSecret } = require("./config/config"); // Application config properties
const { startMongoMemoryIfNeeded } = require("./lib/mongo-bootstrap");
/*
// Fix for A6-Sensitive Data Exposure
// Load keys for establishing secure HTTPS connection
const fs = require("fs");
const https = require("https");
const path = require("path");
const httpsOptions = {
    key: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.key")),
    cert: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.crt"))
};
*/

const createApp = async () => {
    const app = express();
    let mongoServer = null;

    try {
        const bootstrap = await startMongoMemoryIfNeeded({ uri: db });
        mongoServer = bootstrap.server;

        const mongoClient = await MongoClient.connect(bootstrap.uri);
        const mongoDb = mongoClient.db();

        const seedDemoData = async () => {
            const usersCol = mongoDb.collection("users");
            const userCount = await usersCol.countDocuments({});

            if (userCount > 0) {
                return;
            }

            const demoUsers = [
                {
                    _id: 1,
                    userName: "admin",
                    firstName: "Node Goat",
                    lastName: "Admin",
                    password: "Admin_123",
                    isAdmin: true
                },
                {
                    _id: 2,
                    userName: "user1",
                    firstName: "John",
                    lastName: "Doe",
                    benefitStartDate: "2030-01-10",
                    password: "User1_123"
                },
                {
                    _id: 3,
                    userName: "user2",
                    firstName: "Will",
                    lastName: "Smith",
                    benefitStartDate: "2025-11-30",
                    password: "User2_123"
                }
            ];

            const demoAllocations = [
                { userId: 1, stocks: 34, funds: 21, bonds: 45 },
                { userId: 2, stocks: 28, funds: 32, bonds: 40 },
                { userId: 3, stocks: 18, funds: 24, bonds: 58 }
            ];

            await mongoDb.collection("counters").insertOne({ _id: "userId", seq: 3 });
            await usersCol.insertMany(demoUsers);
            await mongoDb.collection("allocations").insertMany(demoAllocations);
        };

        await seedDemoData();

        console.log("Connected to the database");

        app.locals.runtimeInfo = {
            environment: process.env.NODE_ENV || "development",
            port,
            database: bootstrap.uri,
            isMemoryFallback: Boolean(mongoServer)
        };

        process.on("SIGINT", async () => {
            if (mongoServer) {
                await mongoServer.stop();
            }
            process.exit(0);
        });

        app.get("/health", (req, res) => {
            res.json({
                status: "ok",
                environment: app.locals.runtimeInfo.environment,
                port: app.locals.runtimeInfo.port,
                database: app.locals.runtimeInfo.database,
                isMemoryFallback: app.locals.runtimeInfo.isMemoryFallback
            });
        });

        /*
        // Fix for A5 - Security MisConfig
        // TODO: Review the rest of helmet options, like "xssFilter"
        // Remove default x-powered-by response header
        app.disable("x-powered-by");

        // Prevent opening page in frame or iframe to protect from clickjacking
        app.use(helmet.frameguard()); //xframe deprecated

        // Prevents browser from caching and storing page
        app.use(helmet.noCache());

        // Allow loading resources only from white-listed domains
        app.use(helmet.contentSecurityPolicy()); //csp deprecated

        // Allow communication only on HTTPS
        app.use(helmet.hsts());

        // TODO: Add another vuln: https://github.com/helmetjs/helmet/issues/26
        // Enable XSS filter in IE (On by default)
        // app.use(helmet.iexss());
        // Now it should be used in hit way, but the README alerts that could be
        // dangerous, like specified in the issue.
        // app.use(helmet.xssFilter({ setOnOldIE: true }));

        // Forces browser to only use the Content-Type set in the response header instead of sniffing or guessing it
        app.use(nosniff());
        */

        // Adding/ remove HTTP Headers for security
        app.use(favicon(__dirname + "/app/assets/favicon.ico"));

        // Express middleware to populate "req.body" so we can access POST variables
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            // Mandatory in Express v4
            extended: false
        }));

        // Enable session management using express middleware
        app.use(session({
            // genid: (req) => {
            //    return genuuid() // use UUIDs for session IDs
            //},
            secret: cookieSecret,
            // Both mandatory in Express v4
            saveUninitialized: true,
            resave: true
            /*
            // Fix for A5 - Security MisConfig
            // Use generic cookie name
            key: "sessionId",
            */

            /*
            // Fix for A3 - XSS
            // TODO: Add "maxAge"
            cookie: {
                httpOnly: true
                // Remember to start an HTTPS server to get this working
                // secure: true
            }
            */

        }));

        /*
        // Fix for A8 - CSRF
        // Enable Express csrf protection
        app.use(csrf());
        // Make csrf token available in templates
        app.use((req, res, next) => {
            res.locals.csrftoken = req.csrfToken();
            next();
        });
        */

        // Register templating engine
        app.engine(".html", consolidate.swig);
        app.set("view engine", "html");
        app.set("views", `${__dirname}/app/views`);
        // Fix for A5 - Security MisConfig
        // TODO: make sure assets are declared before app.use(session())
        app.use(express.static(`${__dirname}/app/assets`));

        // Initializing marked library
        // Fix for A9 - Insecure Dependencies
        marked.setOptions({
            sanitize: true
        });
        app.locals.marked = marked;

        // Application routes
        routes(app, mongoDb);

        // Template system setup
        swig.setDefaults({
            // Autoescape disabled
            autoescape: false
            /*
            // Fix for A3 - XSS, enable auto escaping
            autoescape: true // default value
            */
        });

        return app;
    } catch (error) {
        console.log("Error: DB: bootstrap");
        console.log(error);
        throw error;
    }
};

const startServer = async () => {
    try {
        const app = await createApp();
        const server = http.createServer(app);
        server.listen(port, () => {
            console.log(`Express http server listening on port ${port}`);
        });
        return server;
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = {
    createApp,
    startServer
};

