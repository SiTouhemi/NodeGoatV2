# NodeGoatV2

NodeGoatV2 is a developer-friendly fork of the OWASP NodeGoat training app. It keeps the learning value of the original project while making local setup easier for real users, especially on Windows and other environments without a preinstalled MongoDB instance.

## Quick start

### 1) Install dependencies

```bash
npm install
```

### 2) Start the app

```bash
npm start
```

The app will automatically start an in-memory MongoDB instance when no MongoDB server is available, so it works well on a fresh machine.

### 3) Open the app

- App: http://localhost:4000/
- Tutorial: http://localhost:4000/tutorial
- Health check: http://localhost:4000/health

## Environment configuration

A sample environment file is included in `.env.example`. Copy it to `.env` and adjust the values as needed.

```bash
copy .env.example .env
```

Supported variables:

- `PORT` - HTTP port for the app
- `MONGODB_URI` - MongoDB connection string
- `COOKIE_SECRET` - session secret
- `CRYPTO_KEY` - encryption key
- `CRYPTO_ALGO` - crypto algorithm
- `HOST_NAME` - host name for the app
- `NODE_ENV` - environment mode

If `MONGODB_URI` is not set, the app will try a local MongoDB instance and fall back to an in-memory MongoDB instance automatically.

## Default demo accounts

The database is pre-seeded with demo users.

- Admin: `admin` / `Admin_123`
- User: `user1` / `User1_123`
- User: `user2` / `User2_123`

## Scripts

```bash
npm start
npm run dev
npm run test:memory
npm run db:seed
```

## Why this fork is easier to use

This fork focuses on real developer usability:

- no hard requirement for a local MongoDB server
- automatic in-memory fallback for local testing
- simple health endpoint for quick validation
- clearer setup instructions for modern environments
- cleaner startup flow for Windows and local development

## Security learning goals

This project is still designed to teach the OWASP Top 10 risks in Node.js applications, including:

- injection
- broken authentication
- sensitive data exposure
- XXE and SSRF cases
- insecure direct object references
- cross-site scripting
- insecure configuration

## License

This project is licensed under the Apache License 2.0.
