# Staging

Staging mirrors production on the same host (Railway project `wonderful-vibrancy`), in its own environment named `staging`, with its own database and keys.

| | Production | Staging |
|---|---|---|
| Branch | `main` | `staging` |
| Frontend | https://brettonkey.com | Railway-generated URL on the `staging` env's `frontend` service (or `staging.brettonkey.com` once Bretton adds DNS) |
| API | https://api.brettonkey.com | Railway-generated URL on the `staging` env's `BK` service (or `api-staging.brettonkey.com`) |
| Database | production MongoDB | separate MongoDB Atlas project/cluster, own `MONGO_URL` |

## How staging deploys
Railway's GitHub integration redeploys each service in the `staging` environment on every push to the `staging` branch. Production services keep deploying from `main` and are not touched.

## How the environment differs
Set these in Railway on the `staging` environment only. Never copy production values.

| Variable (service) | Staging value |
|---|---|
| `MONGO_URL` (BK) | connection string of the separate staging Atlas cluster; its host must differ from production |
| `DB_NAME` (BK) | `bk_staging` |
| `JWT_SECRET` (BK) | new random value |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` (BK) | staging-only admin credentials |
| `APP_NAME` (BK) | `bretton-key-site-staging` |
| `CORS_ORIGINS` (BK) | the staging frontend URL only |
| `STORAGE_BACKEND` (BK) | `gridfs` (stored in the staging DB) |
| `REACT_APP_BACKEND_URL` (frontend) | the staging API URL |

The backend has no payment or email integration today. If one is added, staging must use test/sandbox keys only (for example Stripe `sk_test_`, email in sandbox or restricted to Bretton's address).

The schema is created by the app on startup (MongoDB, no migration files). Seed content with `backend/scripts/seed_content.py` run with the staging `MONGO_URL`. Never point staging at the production database.

## Promotion
1. Push the change to `staging`. Railway deploys it. Verify on the staging URL.
2. Open a PR `staging` -> `main`.
3. Bretton reviews and approves, then merges.
4. Railway deploys production from `main`. Confirm https://brettonkey.com and https://api.brettonkey.com return 200.
