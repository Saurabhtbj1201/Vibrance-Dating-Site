import { Router, type IRouter } from "express";
import { db, matchesTable, messagesTable } from "@workspace/db";
import { eq, or, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { formatProfile } from "./profiles";
import { profilesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const matches = await db.select().from(matchesTable)
      .where(or(eq(matchesTable.user1Id, userId), eq(matchesTable.user2Id, userId)))
      .orderBy(desc(matchesTable.createdAt));

    const result = await Promise.all(matches.map(async (match) => {
      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
      const profiles = await db.select().from(profilesTable).where(eq(profilesTable.userId, otherUserId)).limit(1);
      const lastMessages = await db.select().from(messagesTable)
        .where(eq(messagesTable.matchId, match.id))
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);
      const unreadCount = await db.select({ count: sql<number>`count(*)` })
        .from(messagesTable)
        .where(and(
          eq(messagesTable.matchId, match.id),
          eq(messagesTable.read, false),
          sql`${messagesTable.senderId} != ${userId}`
        ));
      return {
        id: match.id,
        userId,
        matchedUserId: otherUserId,
        profile: profiles[0] ? formatProfile(profiles[0]) : null,
        lastMessage: lastMessages[0] ? formatMessage(lastMessages[0]) : null,
        createdAt: match.createdAt.toISOString(),
        unreadCount: Number(unreadCount[0]?.count) || 0,
      };
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Get matches error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/:matchId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const matchId = Array.isArray(req.params.matchId)
      ? req.params.matchId[0]
      : req.params.matchId;
    const matches = await db.select().from(matchesTable)
      .where(and(eq(matchesTable.id, matchId), or(eq(matchesTable.user1Id, userId), eq(matchesTable.user2Id, userId))))
      .limit(1);
    if (matches.length === 0) { res.status(404).json({ error: "Match not found" }); return; }
    const match = matches[0];
    const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
    const profiles = await db.select().from(profilesTable).where(eq(profilesTable.userId, otherUserId)).limit(1);
    res.json({
      id: match.id,
      userId,
      matchedUserId: otherUserId,
      profile: profiles[0] ? formatProfile(profiles[0]) : null,
      createdAt: match.createdAt.toISOString(),
      unreadCount: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Get match error");
    res.status(500).json({ error: "Internal error" });
  }
});

function formatMessage(m: any) {
  return {
    id: m.id,
    matchId: m.matchId,
    senderId: m.senderId,
    content: m.content,
    createdAt: m.createdAt?.toISOString(),
    read: m.read,
  };
}

export { formatMessage };
export default router;
