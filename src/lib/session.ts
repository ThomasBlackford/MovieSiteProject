import { cache } from "react";
import { db } from "./db";

// Prototype stand-in for Auth.js: everyone is the seeded "demo" user.
// Swap this for `auth()` once real sign-in exists.
export const getCurrentUser = cache(async () => {
  const user = await db.user.findUnique({ where: { username: "demo" } });
  if (!user) throw new Error('Seed the database first: npm run db:reset');
  return user;
});
