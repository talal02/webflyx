import { readConfig, setUser } from "./config";
import { getUserByName, getUserById, createUser, deleteAllUsers, getAllUsers } from "./lib/db/queries/users";
import {  type Feed, type Post, type User } from "./lib/db/schema";
import { getDBFeedFollowsForUser, deleteFeedFollow, createFeed, getFeedById, getAllFeeds, getFeedByUrl, createFeedFollow, getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";
import { createPost, getPostsForUser } from "./lib/db/queries/posts";
import { XMLParser } from "fast-xml-parser";

type RSSFeedItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

type RSSFeed = {
  title: string;
  link: string;
  description: string;
  items: RSSFeedItem[];
};

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type CommandsRegistry = Record<string, CommandHandler>;

async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error(`${cmdName} command requires a username`);
  }

  const username = args[0];

  const existingUser = await getUserByName(username);

  if (!existingUser) {
    throw new Error(`user ${username} does not exist`);
  }

  const config = readConfig();

  setUser(username, config);
  console.log(`User ${username} has been set.`);
}

async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error(`${cmdName} command requires a username`);
  }

  const username = args[0];
  const existingUser = await getUserByName(username);

  if (existingUser) {
    throw new Error(`user ${username} already exists`);
  }

  const user = await createUser(username);
  const config = readConfig();

  setUser(username, config);
  console.log(`User ${username} was created.`);
  console.log(user);
}

async function handlerReset(cmdName: string, ...args: string[]) {
  await deleteAllUsers();
  console.log("All users have been deleted.");
}

async function handlerPrintUsers(cmdName: string, ...args: string[]) {
  const users = await getAllUsers();
  const currentUserName = readConfig().currentUserName;

  users.forEach(user => {
    if (user.name === currentUserName) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  });
}

async function handlerPrintFeeds(cmdName: string, ...args: string[]) {
  const feeds = await getAllFeeds();
  for (const feed of feeds) {
    const user = await getUserById(feed.userId);
    printFeed(feed, user!);
  }
}

async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
  if (args.length < 2) {
    throw new Error(`${cmdName} command requires a feed URL and a feed name`);
  }
  const feedURL = args[1];
  const feedName = args[0];
  const createdFeed = await createFeed(feedURL, user.id, feedName);
  await createFeedFollow(createdFeed.id, user.id);
  printFeed(createdFeed, user);
}


function getStringField(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function validateItem(rawItem: any): RSSFeedItem | null {
  const title = getStringField(rawItem?.title);
  const link = getStringField(rawItem?.link);
  const description = getStringField(rawItem?.description);
  const pubDate = getStringField(rawItem?.pubDate);

  if (!title || !link || !description || !pubDate) {
    return null;
  }

  return { title, link, description, pubDate };
}

function parsePublishedAt(pubDate: string): Date | null {
  const timestamp = Date.parse(pubDate);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp);
}

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  const xml = await response.text();
  const parser = new XMLParser({ processEntities: false });
  const parsedFeed = parser.parse(xml);
  const channel = parsedFeed?.rss?.channel;

  if (!channel) {
    throw new Error("missing channel");
  }

  const title = getStringField(channel.title);
  const link = getStringField(channel.link);
  const description = getStringField(channel.description);

  if (!title || !link || !description) {
    throw new Error("invalid channel metadata");
  }

  const rawItems: any[] = channel.item
    ? Array.isArray(channel.item)
      ? channel.item
      : [channel.item]
    : [];

  const items = rawItems
    .map(validateItem)
    .filter((item): item is RSSFeedItem => item !== null);

  return { title, link, description, items };
}

function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) {
    throw new Error(`invalid duration: ${durationStr}`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === "ms") return value;
  if (unit === "s") return value * 1000;
  if (unit === "m") return value * 60 * 1000;
  return value * 60 * 60 * 1000;
}

function formatDuration(durationMs: number): string {
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  const milliseconds = durationMs % 1000;

  let result = "";

  if (hours > 0) result += `${hours}h`;
  if (minutes > 0 || hours > 0) result += `${minutes}m`;
  if (seconds > 0 || minutes > 0 || hours > 0) result += `${seconds}s`;
  if (milliseconds > 0 && hours === 0 && minutes === 0 && seconds === 0) {
    result += `${milliseconds}ms`;
  }

  return result || "0s";
}

async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    return;
  }

  const rssFeed = await fetchFeed(feed.url);
  await markFeedFetched(feed.id);

  for (const item of rssFeed.items) {
    const publishedAt = parsePublishedAt(item.pubDate);

    if (!publishedAt) {
      continue;
    }

    await createPost(item.title, item.link, item.description, publishedAt, feed.id);
  }
}

async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error(`${cmdName} command requires a duration`);
  }

  const timeBetweenRequests = parseDuration(args[0]);
  console.log(`Collecting feeds every ${formatDuration(timeBetweenRequests)}`);

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("unknown error");
    }
  };

  await scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve(null);
    });
  });
}

async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
  if (args.length === 0) {
    throw new Error(`${cmdName} command requires a feed URL`);
  }
  
  const feedURL = args[0];
  const feed = await getFeedByUrl(feedURL);

  if (!feed) {
    throw new Error(`feed with URL ${feedURL} does not exist`);
  }

  await createFeedFollow(feed.id, user.id);
  console.log(`User ${user.name} is now following feed ${feed.name}`);
}

async function getFeedFollowsForUser(user: User) {
  const feedFollows = await getDBFeedFollowsForUser(user.id);

  for (const feedFollow of feedFollows) {
    const feed = await getFeedById(feedFollow.feedId);
    console.log(`User ${user.name} follows feed ${feed?.name}`);
  }
}

async function handlerFollowing(cmdName: string, user: User, ...args: string[]) {
  await getFeedFollowsForUser(user);
}

async function handlerBrowse(cmdName: string, user: User, ...args: string[]) {
  const limit = args.length > 0 ? Number(args[0]) : 2;
  const posts = await getPostsForUser(user.id, Number.isNaN(limit) ? 2 : limit);

  for (const post of posts) {
    console.log(post.title);
  }
}

async function handlerUnfollowFeed(cmdName: string, user: User, ...args: string[]) {
  if (args.length === 0) {
    throw new Error(`${cmdName} command requires a feed URL`);
  }
  const feedURL = args[0];
  const feed = await getFeedByUrl(feedURL);
  
  if (!feed) {
    throw new Error(`feed with URL ${feedURL} does not exist`);
  }

  await deleteFeedFollow(feed.id, user.id);
  console.log(`User ${user.name} has unfollowed feed ${feed.name}`);
}


function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig();
    const user = await getUserByName(config.currentUserName);

    if (!user) {
      throw new Error(`current user ${config.currentUserName} does not exist`);
    }

    await handler(cmdName, user, ...args);
  };
}

function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
) {
  registry[cmdName] = handler;
}

async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
) {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`unknown command: ${cmdName}`);
  }

  await handler(cmdName, ...args);
}

function printFeed(feed: Feed, user: User) {
  console.log("=============")
  console.log(`Feed: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`Created by: ${user.name}`);
  console.log("=============")
}

async function main() {
  const commands: CommandsRegistry = {};
  registerCommand(commands, "login", handlerLogin);
  registerCommand(commands, "register", handlerRegister);
  registerCommand(commands, "reset", handlerReset);
  registerCommand(commands, "users", handlerPrintUsers);
  registerCommand(commands, "agg", handlerAgg);
  registerCommand(commands, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(commands, "feeds", handlerPrintFeeds);
  registerCommand(commands, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(commands, "unfollow", middlewareLoggedIn(handlerUnfollowFeed));
  registerCommand(commands, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(commands, "browse", middlewareLoggedIn(handlerBrowse));
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("not enough arguments provided");
    process.exit(1);
  }

  const [cmdName, ...cmdArgs] = args;

  try {
    await runCommand(commands, cmdName, ...cmdArgs);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("unknown error");
    }

    process.exit(1);
  }
  process.exit(0);

}

main();
