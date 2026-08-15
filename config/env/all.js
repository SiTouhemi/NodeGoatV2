// default app configuration
const port = Number(process.env.PORT || 4000);
const db = process.env.MONGODB_URI || "mongodb://localhost:27017/nodegoat";

module.exports = {
    port,
    db,
    cookieSecret: process.env.COOKIE_SECRET || "session_cookie_secret_key_here",
    cryptoKey: process.env.CRYPTO_KEY || "a_secure_key_for_crypto_here",
    cryptoAlgo: process.env.CRYPTO_ALGO || "aes256",
    hostName: process.env.HOST_NAME || "localhost",
    environmentalScripts: [],
    nodeEnv: process.env.NODE_ENV || "development"
};

