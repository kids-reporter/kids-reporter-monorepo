# Cronjob

This package contains scripts for cronjobs. Using different commands and arguments, you can run different scripts.
For easy deployment, the file name of the script is the same as the command name specified in `package.json`.

## Prerequisites

- Node.js (version 18 or higher)
- Google Cloud Storage account and bucket set up
- Slack webhook URL

## Installation

1. Clone the repository
2. Install dependencies using Yarn:

   ```bash
   yarn install
   ```

## Deployment

The package Cloud Build configuration builds the shared image and deploys the
RSS and scheduled-post Cloud Run jobs. See [deploy/README.md](deploy/README.md)
for configuration, secret provisioning, and rollout instructions.

## Scripts

### RSS Feed Generator

This Node.js script fetches posts data from a RESTful server, generates an RSS feed based on the fetched data, uploads the RSS file to a Google Cloud Storage (GCS) bucket, and sends a notification to a Slack channel.

#### RSS Feed Configuration

Set up `configs.js` with envs, accepted envs:

- `API_URL`: the RESTful server URL
- `BASE_URL`: the base URL of the website
- `BUCKET_NAME`: the GCS bucket name
- `SLACK_LOG_HOOK`: the Slack webhook URL for logging
- `SLACK_ERROR_HOOK`: the Slack webhook URL for error notification
- `RSS_FILE_NAME`: the name of the RSS file
- `RSS_FETCH_DAYS`: the number of days to fetch posts data
- `PROJECT_ID`: (optional) the GCP project ID
- `KEY_FILENAME`: (optional) the path to the GCP service account key file

#### RSS Feed Usage

Run the script using:

```bash
yarn rss
```

This will execute the script, fetching posts data, generating an RSS feed, uploading it to GCS, and sending a Slack notification.

#### RSS Feed Cronjob Configs

- Frequency: `0 1 * * *` (every day at 01:00 UTC+8)
- Fetch criteria: posts and projects published in last 2 days

### Scheduled Post Status Updater

This script connects to a PostgreSQL database, fetches posts data, and updates the status of scheduled posts from `scheduled` to `published` if the scheduled time has passed.

#### Scheduled Post Configuration

Set up `configs.js` with envs, accepted envs:

- `PG_DB_HOST`: the PostgreSQL database host
- `PG_DB_PORT`: the PostgreSQL database port
- `PG_DB_NAME`: the PostgreSQL database name
- `PG_DB_USER`: the PostgreSQL database user
- `PG_DB_PASSWORD`: the PostgreSQL database password

#### Scheduled Post Usage

Run the script using:

```bash
yarn scheduled-post
```

This will execute the script, fetching posts data, and updating the status of scheduled posts.

#### Scheduled Post Cronjob Configs

- Frequency: `0 1 * * *` (every day at 01:00 UTC+8)
