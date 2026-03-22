import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);

    res.json(notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      body: n.body,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      data: n.data ? JSON.parse(n.data) : {},
    })));
  } catch (err) {
    req.log.error({ err }, "Get notifications error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.put("/:notificationId/read", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    await db.update(notificationsTable)
      .set({ read: true })
      .where(and(
        eq(notificationsTable.id, req.params.notificationId),
        eq(notificationsTable.userId, userId)
      ));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Mark notification read error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
