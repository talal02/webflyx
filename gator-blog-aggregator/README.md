# Gator Blog Aggregator CLI

This is a small CLI app written in TypeScript.

## What you need

- Node.js
- npm
- A PostgreSQL database running locally
- Git, so you can track your changes

## Setup

1. Install the dependencies:

```bash
npm install
```

2. Make sure the config file exists at `~/.gatorconfig.json`.

It should look like this:

```json
{
  "db_url": "postgres://example",
  "current_user_name": "boots"
}
```

3. Run the app:

```bash
npm run start <command>
```

## Commands

- `register <name>` - create a new user
- `login <name>` - set the current user
- `addfeed <name> <url>` - add a feed
- `follow <url>` - follow a feed
- `following` - show feeds you follow
- `browse [limit]` - show recent posts, default limit is `2`
- `agg <time_between_reqs>` - run the feed collector loop

## Example

```bash
npm run start register boots
npm run start login boots
npm run start browse
```
