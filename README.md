# LifeSync Games Vitrina (Showcase Frontend)

Vue 3 + Vite SPA for the Vitrina showcase/marketplace of game publications.

## Requirements

- Node >= 18

## Setup

```sh
npm install
```

## Environment variables

Create a `.env` file in the project root.

```sh
# Vitrina API (publications, reviews, moderation)
VITE_API_URL="http://localhost:3020/v1"

# Auth Service (SSO, OAuth, JWT)
VITE_AUTH_SERVICE_URL="http://localhost:3000/api/v1"

# Cross-service navigation (trailing slash required)
VITE_CLOUD_MODULE_URL="http://localhost/cloud/"
VITE_HOME_URL="http://localhost/home/"

# Firebase (auth provider). Get these from your Firebase project settings.
# Despite the naming, these client keys are not sensitive.
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
```

## Development

```sh
npm run dev
```

The dev server runs on port 3007 (configurable in `vite.config.js`).

The app is served under the `/vitrina/` base path, so open `http://localhost:3007/vitrina/`.
In the full platform it sits behind an nginx reverse proxy that maps `/vitrina/` to this app.

## Build

```sh
npm run build
```

## Test and lint

```sh
npm run test:unit    # Vitest
npm run lint         # ESLint
npm run type-check   # vue-tsc
```
