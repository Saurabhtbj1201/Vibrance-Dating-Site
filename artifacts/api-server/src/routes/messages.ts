import { Router, type IRouter } from "express";
import { db, messagesTable, matchesTable, notificationsTable, profilesTable } from "@workspace/db";
import { eq, and, or, desc } from "drizzle-orm";
import { SendMessageBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { generateId } from "../lib/id";
import { formatMessage } from "./matches";

const router: IRouter = Router();

router.get("/:matchId/messages", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const match = await db.select().from(matchesTable)
      .where(and(
        eq(matchesTable.id, req.params.matchId),
        or(eq(matchesTable.user1Id, userId), eq(matchesTable.user2Id, userId))
      ))
      .limit(1);

    if (match.length === 0) {
      res.status(403).json({ error: "Not in this match" });
      return;
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    let query = db.select().from(messagesTable)
      .where(eq(messagesTable.matchId, req.params.matchId))
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit);

    const messages = await query;

    await db.update(messagesTable)
      .set({ read: true })
      .where(and(
        eq(messagesTable.matchId, req.params.matchId),
        eq(messagesTable.read, false)
      ));

    res.json(messages.reverse().map(formatMessage));
  } catch (err) {
    req.log.error({ err }, "Get messages error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/:matchId/messages", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const body = SendMessageBody.parse(req.body);

    const match = await db.select().from(matchesTable)
      .where(and(
        eq(matchesTable.id, req.params.matchId),
        or(eq(matchesTable.user1Id, userId), eq(matchesTable.user2Id, userId))
      ))
      .limit(1);

    if (match.length === 0) {
      res.status(403).json({ error: "Not in this match" });
      return;
    }

    const messageId = generateId();
    const inserted = await db.insert(messagesTable).values({
      id: messageId,
      matchId: req.params.matchId,
      senderId: userId,
      content: body.content,
      read: false,
    }).returning();

    const otherUserId = match[0].user1Id === userId ? match[0].user2Id : match[0].user1Id;
    const senderProfile = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    const senderName = senderProfile[0]?.name || "Someone";

    await db.insert(notificationsTable).values({
      id: generateId(),
      userId: otherUserId,
      type: "new_message",
      title: `New message from ${senderName}`,
      body: body.content.slice(0, 100),
      data: JSON.stringify({ matchId: req.params.matchId }),
    });

    res.status(201).json(formatMessage(inserted[0]));
  } catch (err) {
    req.log.error({ err }, "Send message error");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
