import { Router, type IRouter } from "express";
import { db, usersTable, profilesTable, verificationRequestsTable, collegesTable, swipesTable, matchesTable, messagesTable, notificationsTable } from "@workspace/db";
import { eq, desc, asc, ilike, or } from "drizzle-orm";
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

// All admin routes require auth + admin role
router.use(requireAuth as any);
router.use(requireAdmin);

// ── GET /api/admin/check — verify admin status + return self userId
router.get("/check", async (req: any, res) => {
  res.json({ isAdmin: true, userId: req.userId });
});

// ── GET /api/admin/profiles — all profiles with full details
router.get("/profiles", async (req: any, res) => {
  try {
    const rows = await db
      .select({
        profile: profilesTable,
        user: { id: usersTable.id, email: usersTable.email, createdAt: usersTable.createdAt, isAdmin: usersTable.isAdmin },
      })
      .from(profilesTable)
      .innerJoin(usersTable, eq(profilesTable.userId, usersTable.id))
      .orderBy(desc(profilesTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Admin list profiles error");
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /api/admin/verifications — all verification requests
router.get("/verifications", async (req: any, res) => {
  try {
    const rows = await db
      .select({
        request: verificationRequestsTable,
        profile: { name: profilesTable.name, age: profilesTable.age, photos: profilesTable.photos },
        user: { email: usersTable.email },
      })
      .from(verificationRequestsTable)
      .innerJoin(usersTable, eq(verificationRequestsTable.userId, usersTable.id))
      .leftJoin(profilesTable, eq(profilesTable.userId, verificationRequestsTable.userId))
      .orderBy(desc(verificationRequestsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Admin list verifications error");
    res.status(500).json({ error: "Server error" });
  }
});

// ── PUT /api/admin/verifications/:id — approve or reject
router.put("/verifications/:id", async (req: any, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      res.status(400).json({ error: "status must be approved or rejected" });
      return;
    }

    const updated = await db.update(verificationRequestsTable)
      .set({
        status,
        adminNote: adminNote || null,
        reviewedAt: new Date(),
        reviewedBy: req.userId,
        updatedAt: new Date(),
      })
      .where(eq(verificationRequestsTable.id, req.params.id))
      .returning();

    if (!updated[0]) { res.status(404).json({ error: "Not found" }); return; }

    // Update the profile's verification status
    await db.update(profilesTable)
      .set({
        verificationStatus: status === "approved" ? "verified" : "rejected",
        updatedAt: new Date(),
      })
      .where(eq(profilesTable.userId, updated[0].userId));

    res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Admin review verification error");
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /api/admin/colleges — list all colleges
router.get("/colleges", async (req: any, res) => {
  try {
    const rows = await db.select().from(collegesTable).orderBy(asc(collegesTable.name));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Admin list colleges error");
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/admin/colleges — add college
router.post("/colleges", async (req: any, res) => {
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
    req.log.error({ err }, "Admin add college error");
    res.status(500).json({ error: "Server error" });
  }
});

// ── DELETE /api/admin/colleges/:id — remove college
router.delete("/colleges/:id", async (req: any, res) => {
  try {
    await db.delete(collegesTable).where(eq(collegesTable.id, req.params.id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete college error");
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /api/admin/admins — list all admin users
router.get("/admins", async (req: any, res) => {
  try {
    const admins = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
        name: profilesTable.name,
        photo: profilesTable.photos,
      })
      .from(usersTable)
      .leftJoin(profilesTable, eq(profilesTable.userId, usersTable.id))
      .where(eq(usersTable.isAdmin, true))
      .orderBy(asc(usersTable.createdAt));
    res.json(admins.map(a => ({ ...a, photo: (a.photo as string[])?.[0] ?? null })));
  } catch (err) {
    req.log.error({ err }, "List admins error");
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/admin/admins — promote user to admin by email
router.post("/admins", async (req: any, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) { res.status(400).json({ error: "Email required" }); return; }

    // Case-insensitive lookup
    const found = await db.select()
      .from(usersTable)
      .where(ilike(usersTable.email, email.trim()))
      .limit(1);

    if (!found[0]) {
      res.status(404).json({ error: "No user found with that email" });
      return;
    }

    if (found[0].isAdmin) {
      res.json({ ok: true, already: true, email: found[0].email });
      return;
    }

    await db.update(usersTable)
      .set({ isAdmin: true })
      .where(eq(usersTable.id, found[0].id));

    res.json({ ok: true, email: found[0].email });
  } catch (err) {
    req.log.error({ err }, "Promote admin error");
    res.status(500).json({ error: "Server error" });
  }
});

// ── DELETE /api/admin/admins/:userId — remove admin role (cannot remove self)
router.delete("/admins/:userId", async (req: any, res) => {
  try {
    if (req.params.userId === req.userId) {
      res.status(400).json({ error: "You cannot remove your own admin access" });
      return;
    }
    const updated = await db.update(usersTable)
      .set({ isAdmin: false })
      .where(eq(usersTable.id, req.params.userId))
      .returning();
    if (!updated[0]) { res.status(404).json({ error: "User not found" }); return; }
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Remove admin error");
    res.status(500).json({ error: "Server error" });
  }
});

// ── DELETE /api/admin/users/:userId — delete user and all related data
router.delete("/users/:userId", async (req: any, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.userId) {
      res.status(400).json({ error: "You cannot delete your own account" });
      return;
    }
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

    // Delete in dependency order to avoid FK violations
    await db.delete(messagesTable).where(eq(messagesTable.senderId, userId));
    const userMatches = await db.select({ id: matchesTable.id })
      .from(matchesTable)
      .where(or(eq(matchesTable.user1Id, userId), eq(matchesTable.user2Id, userId)));
    const matchIds = userMatches.map(m => m.id);
    if (matchIds.length > 0) {
      for (const mid of matchIds) {
        await db.delete(messagesTable).where(eq(messagesTable.matchId, mid));
      }
    }
    await db.delete(matchesTable).where(or(eq(matchesTable.user1Id, userId), eq(matchesTable.user2Id, userId)));
    await db.delete(swipesTable).where(or(eq(swipesTable.swiperId, userId), eq(swipesTable.targetId, userId)));
    await db.delete(notificationsTable).where(eq(notificationsTable.userId, userId));
    await db.delete(verificationRequestsTable).where(eq(verificationRequestsTable.userId, userId));
    await db.delete(profilesTable).where(eq(profilesTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.id, userId));

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete user error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
