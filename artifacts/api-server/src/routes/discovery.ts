import { Router, type IRouter } from "express";
import { db, profilesTable, swipesTable, matchesTable, notificationsTable } from "@workspace/db";
import { eq, and, notInArray, ne, sql } from "drizzle-orm";
import { RecordSwipeBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { generateId } from "../lib/id";
import { formatProfile } from "./profiles";

const router: IRouter = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const swiped = await db.select({ targetId: swipesTable.targetId })
      .from(swipesTable)
      .where(eq(swipesTable.swiperId, userId));
    const swipedIds = swiped.map((s) => s.targetId);

    const myProfile = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    if (myProfile.length === 0) {
      res.json([]);
      return;
    }

    let query = db.select().from(profilesTable)
      .where(
        and(
          ne(profilesTable.userId, userId),
          swipedIds.length > 0
            ? notInArray(profilesTable.userId, swipedIds)
            : sql`true`
        )
      )
      .limit(limit);

    const profiles = await query;
    res.json(profiles.map(formatProfile));
  } catch (err) {
    req.log.error({ err }, "Discovery error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/swipes", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const body = RecordSwipeBody.parse(req.body);

    const existing = await db.select().from(swipesTable)
      .where(and(eq(swipesTable.swiperId, userId), eq(swipesTable.targetId, body.targetUserId)))
      .limit(1);
    if (existing.length > 0) {
      await db.update(swipesTable).set({ action: body.action }).where(eq(swipesTable.id, existing[0].id));
    } else {
      await db.insert(swipesTable).values({
        id: generateId(),
        swiperId: userId,
        targetId: body.targetUserId,
        action: body.action,
      });
    }

    let matched = false;
    let matchId: string | undefined;

    if (body.action === "like") {
      const theirLike = await db.select().from(swipesTable)
        .where(and(eq(swipesTable.swiperId, body.targetUserId), eq(swipesTable.targetId, userId), eq(swipesTable.action, "like")))
        .limit(1);

      if (theirLike.length > 0) {
        const existingMatch = await db.select().from(matchesTable)
          .where(
            sql`(${matchesTable.user1Id} = ${userId} AND ${matchesTable.user2Id} = ${body.targetUserId}) OR (${matchesTable.user1Id} = ${body.targetUserId} AND ${matchesTable.user2Id} = ${userId})`
          )
          .limit(1);

        if (existingMatch.length === 0) {
          matchId = generateId();
          await db.insert(matchesTable).values({
            id: matchId,
            user1Id: userId,
            user2Id: body.targetUserId,
          });
          matched = true;

          const myProfile = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
          const theirProfile = await db.select().from(profilesTable).where(eq(profilesTable.userId, body.targetUserId)).limit(1);
          const myName = myProfile[0]?.name || "Someone";
          const theirName = theirProfile[0]?.name || "Someone";

          await db.insert(notificationsTable).values([
            {
              id: generateId(),
              userId,
              type: "new_match",
              title: "New Match!",
              body: `You matched with ${theirName}!`,
              data: JSON.stringify({ matchId }),
            },
            {
              id: generateId(),
              userId: body.targetUserId,
              type: "new_match",
              title: "New Match!",
              body: `You matched with ${myName}!`,
              data: JSON.stringify({ matchId }),
            },
          ]);
        } else {
          matched = true;
          matchId = existingMatch[0].id;
        }
      }
    }

    res.json({ matched, matchId });
  } catch (err) {
    req.log.error({ err }, "Swipe error");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
