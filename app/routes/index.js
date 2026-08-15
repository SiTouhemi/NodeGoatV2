const SessionHandler = require("./session");
const ProfileHandler = require("./profile");
const BenefitsHandler = require("./benefits");
const ContributionsHandler = require("./contributions");
const AllocationsHandler = require("./allocations");
const MemosHandler = require("./memos");
const ResearchHandler = require("./research");
const tutorialRouter = require("./tutorial");
const ErrorHandler = require("./error").errorHandler;

const index = (app, db) => {

    "use strict";

    const sessionHandler = new SessionHandler(db);
    const profileHandler = new ProfileHandler(db);
    const benefitsHandler = new BenefitsHandler(db);
    const contributionsHandler = new ContributionsHandler(db);
    const allocationsHandler = new AllocationsHandler(db);
    const memosHandler = new MemosHandler(db);
    const researchHandler = new ResearchHandler(db);

    // Middleware to check if a user is logged in
    const isLoggedIn = sessionHandler.isLoggedInMiddleware;

    //Middleware to check if user has admin rights
    const isAdmin = sessionHandler.isAdminUserMiddleware;

    // Public landing page for a more polished product experience
    app.get("/", (req, res) => {
        if (req.session && req.session.userId) {
            return res.redirect("/dashboard");
        }
        return res.render("landing", {
            environmentalScripts
        });
    });

    app.get("/overview", isLoggedIn, sessionHandler.displayWelcomePage);

    app.get("/challenges", isLoggedIn, (req, res) => {
        const challenges = [
            {
                name: "Broken Access Control",
                difficulty: "Easy",
                status: "Available",
                description: "Explore how authorization checks can be bypassed in a financial dashboard."
            },
            {
                name: "Command Injection",
                difficulty: "Medium",
                status: "Available",
                description: "Practice how unsafe command execution can expose system-level risks."
            },
            {
                name: "XSS",
                difficulty: "Medium",
                status: "Available",
                description: "Examine how unsafe rendering can lead to script injection in user-driven content."
            },
            {
                name: "SSRF",
                difficulty: "Hard",
                status: "Available",
                description: "Review how untrusted URLs can be abused for internal service access."
            }
        ];

        return res.render("challenges", {
            challenges,
            environmentalScripts,
            firstName: req.session.firstName || "User",
            lastName: req.session.lastName || ""
        });
    });

    app.get("/roadmap", isLoggedIn, (req, res) => {
        const roadmap = [
            { phase: "Phase 1", title: "Foundations", summary: "Learn the attack surface and authentication model.", completion: "Completed" },
            { phase: "Phase 2", title: "Injection and Validation", summary: "Study input validation issues and unsafe command execution.", completion: "In progress" },
            { phase: "Phase 3", title: "Access and Session Risks", summary: "Map broken auth, authorization gaps, and session weaknesses.", completion: "Next" },
            { phase: "Phase 4", title: "Secure Engineering", summary: "Apply fixes and verify the application behaves safely.", completion: "Planned" }
        ];

        return res.render("roadmap", {
            roadmap,
            environmentalScripts,
            firstName: req.session.firstName || "User",
            lastName: req.session.lastName || ""
        });
    });

    // Login form
    app.get("/login", sessionHandler.displayLoginPage);
    app.post("/login", sessionHandler.handleLoginRequest);

    // Signup form
    app.get("/signup", sessionHandler.displaySignupPage);
    app.post("/signup", sessionHandler.handleSignup);

    // Logout page
    app.get("/logout", sessionHandler.displayLogoutPage);

    // The main page of the app
    app.get("/dashboard", isLoggedIn, sessionHandler.displayWelcomePage);

    // Profile page
    app.get("/profile", isLoggedIn, profileHandler.displayProfile);
    app.post("/profile", isLoggedIn, profileHandler.handleProfileUpdate);

    // Contributions Page
    app.get("/contributions", isLoggedIn, contributionsHandler.displayContributions);
    app.post("/contributions", isLoggedIn, contributionsHandler.handleContributionsUpdate);

    // Benefits Page
    app.get("/benefits", isLoggedIn, benefitsHandler.displayBenefits);
    app.post("/benefits", isLoggedIn, benefitsHandler.updateBenefits);
    /* Fix for A7 - checks user role to implement  Function Level Access Control
     app.get("/benefits", isLoggedIn, isAdmin, benefitsHandler.displayBenefits);
     app.post("/benefits", isLoggedIn, isAdmin, benefitsHandler.updateBenefits);
     */

    // Allocations Page
    app.get("/allocations/:userId", isLoggedIn, allocationsHandler.displayAllocations);

    // Memos Page
    app.get("/memos", isLoggedIn, memosHandler.displayMemos);
    app.post("/memos", isLoggedIn, memosHandler.addMemos);

    // Handle redirect for learning resources link
    app.get("/learn", isLoggedIn, (req, res) => {
        // Insecure way to handle redirects by taking redirect url from query string
        return res.redirect(req.query.url);
    });

    // Research Page
    app.get("/research", isLoggedIn, researchHandler.displayResearch);

    // Mount tutorial router
    app.use("/tutorial", tutorialRouter);

    // Error handling middleware
    app.use(ErrorHandler);
};

module.exports = index;
