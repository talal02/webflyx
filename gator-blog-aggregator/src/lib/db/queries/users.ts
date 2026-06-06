import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string) {
  const result = await db.select().from(users).where(eq(users.name, name));
  if (result.length === 0) {
    return null;
  }
  return result[0];
}

export async function getUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id));
  if (result.length === 0) {
    return null;
  }
  return result[0];
}

export async function deleteAllUsers() {
  await db.delete(users).execute();
}

export async function getAllUsers() {
  const result = await db.select().from(users);
  return result;
}