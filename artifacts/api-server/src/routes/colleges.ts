import { Router, type IRouter } from "express";
import { db, collegesTable, usersTable } from "@workspace/db";
import { eq, asc, ilike } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { generateId } from "../lib/id";

const router: IRouter = Router();

async function requireAdmin(req: any, res: any, next: any) {
  const user = await db.select().from(usersTable).where(eq(usersTable.id, req.userId)).limit(1);
  if (!user[0]?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

// GET /api/colleges — list all (authenticated users)
router.get("/", requireAuth, async (req, res) => {
  try {
    const search = (req.query.q as string || "").trim();
    let rows = await db.select().from(collegesTable).orderBy(asc(collegesTable.name));
    if (search) {
      rows = rows.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "List colleges error");
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/colleges — add (admin only)
router.post("/", requireAuth, async (req: any, res) => {
  await requireAdmin(req, res, async () => {
    try {
      const { name, city, state } = req.body;
      if (!name?.trim()) { res.status(400).json({ error: "Name required" }); return; }
      const inserted = await db.insert(collegesTable).values({
        id: generateId(),
        name: name.trim(),
        city: city?.trim() || null,
        state: state?.trim() || null,
      }).returning();
      res.status(201).json(inserted[0]);
    } catch (err: any) {
      if (err.code === "23505") { res.status(409).json({ error: "College already exists" }); return; }
      req.log.error({ err }, "Add college error");
      res.status(500).json({ error: "Server error" });
    }
  });
});

// DELETE /api/colleges/:id — remove (admin only)
router.delete("/:id", requireAuth, async (req: any, res) => {
  await requireAdmin(req, res, async () => {
    try {
      await db.delete(collegesTable).where(eq(collegesTable.id, req.params.id));
      res.json({ ok: true });
    } catch (err) {
      req.log.error({ err }, "Delete college error");
      res.status(500).json({ error: "Server error" });
    }
  });
});

export default router;
