import { and, eq, sql } from "drizzle-orm";
import { db } from "..";
import { feeds, feed_follows } from "../schema";

export async function createFeed(url: string, userId: string, name: string) {
  const [result] = await db.insert(feeds).values({ url, name, userId }).returning();
  return result;
}

export async function markFeedFetched(feedId: string) {
  const [result] = await db
    .update(feeds)
    .set({ lastFetchedAt: new Date(), updatedAt: new Date() })
    .where(eq(feeds.id, feedId))
    .returning();
  return result;
}

export async function getAllFeeds() {
  const result = await db.select().from(feeds);
  return result;
}

export async function getFeedByUrl(url: string) {
  const result = await db.select().from(feeds).where(eq(feeds.url, url));
  if (result.length === 0) {
    return null;
  }
  return result[0];
}

export async function getFeedById(id: string) {
  const result = await db.select().from(feeds).where(eq(feeds.id, id));
  if (result.length === 0) {
    return null;
  }
  return result[0];
}

export async function getNextFeedToFetch() {
  const result = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

export async function createFeedFollow(feedId: string, userId: string) {
  const [result] = await db.insert(feed_follows).values({ feedId, userId }).returning();
  return result;
}

export async function deleteFeedFollow(feedId: string, userId: string) {
  const condition = and(
    eq(feed_follows.feedId, feedId),
    eq(feed_follows.userId, userId)
  );
  await db.delete(feed_follows).where(condition).execute();
}

export async function getDBFeedFollowsForUser(userId: string) {
  const result = await db.select().from(feed_follows).where(eq(feed_follows.userId, userId));
  return result;
}
