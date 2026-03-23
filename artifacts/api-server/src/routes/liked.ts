import { Router, type IRouter } from "express";
import { db, swipesTable, profilesTable, matchesTable } from "@workspace/db";
import { eq, and, inArray, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { formatProfile } from "./profiles";

const router: IRouter = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const myLikes = await db
      .select({ targetId: swipesTable.targetId })
      .from(swipesTable)
      .where(and(eq(swipesTable.swiperId, userId), eq(swipesTable.action, "like")));

    if (myLikes.length === 0) {
      res.json([]);
      return;
    }

    const targetIds = myLikes.map((l) => l.targetId);

    const profiles = await db
      .select()
      .from(profilesTable)
      .where(inArray(profilesTable.userId, targetIds));

    const matches = await db
      .select({ user1Id: matchesTable.user1Id, user2Id: matchesTable.user2Id, id: matchesTable.id })
      .from(matchesTable)
      .where(
        sql`(${matchesTable.user1Id} = ${userId} OR ${matchesTable.user2Id} = ${userId})`
      );

    const matchedMap = new Map<string, string>();
    for (const m of matches) {
      const otherId = m.user1Id === userId ? m.user2Id : m.user1Id;
      matchedMap.set(otherId, m.id);
    }

    const result = profiles.map((p) => ({
      ...formatProfile(p),
      likedBack: matchedMap.has(p.userId),
      matchId: matchedMap.get(p.userId) ?? null,
    }));

    result.sort((a, b) => (b.likedBack ? 1 : 0) - (a.likedBack ? 1 : 0));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Liked error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
