import { and, desc, eq } from "drizzle-orm";
import { db } from "..";
import { feed_follows, posts } from "../schema";

async function getPostByFeedIdAndUrl(feedId: string, url: string) {
  const result = await db
    .select()
    .from(posts)
    .where(and(eq(posts.feedId, feedId), eq(posts.url, url)));

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

export async function createPost(
  title: string,
  url: string,
  description: string,
  publishedAt: Date,
  feedId: string,
) {
  const existingPost = await getPostByFeedIdAndUrl(feedId, url);

  if (existingPost) {
    return existingPost;
  }

  const [result] = await db
    .insert(posts)
    .values({ title, url, description, publishedAt, feedId })
    .returning();
  return result;
}

export async function getPostsForUser(userId: string, limit: number) {
  const result = await db
    .select({ post: posts })
    .from(posts)
    .innerJoin(feed_follows, eq(posts.feedId, feed_follows.feedId))
    .where(eq(feed_follows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return result.map(row => row.post);
}