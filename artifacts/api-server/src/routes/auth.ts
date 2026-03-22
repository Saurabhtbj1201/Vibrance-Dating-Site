import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { generateToken, requireAuth } from "../lib/auth";
import { generateId } from "../lib/id";
import { formatProfile } from "./profiles";

const router: IRouter = Router();

router.post("/register", async (req, res) => {
  try {
    const body = RegisterBody.parse(req.body);
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, body.email)).limit(1);
    if (existingUser.length > 0) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    const userId = generateId();
    const profileId = generateId();
    await db.insert(usersTable).values({ id: userId, email: body.email, passwordHash });
    await db.insert(profilesTable).values({ id: profileId, userId, name: body.name, age: body.age, photos: [], interests: [] });
    const token = generateToken(userId);
    const profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    res.status(201).json({
      user: { id: userId, email: body.email, profile: profile[0] ? formatProfile(profile[0]) : null },
      token,
    });
  } catch (err) {
    req.log.error({ err }, "Registration error");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const body = LoginBody.parse(req.body);
    const users = await db.select().from(usersTable).where(eq(usersTable.email, body.email)).limit(1);
    if (users.length === 0) { res.status(401).json({ error: "Invalid credentials" }); return; }
    const user = users[0];
    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }
    const token = generateToken(user.id);
    const profiles = await db.select().from(profilesTable).where(eq(profilesTable.userId, user.id)).limit(1);
    res.json({
      user: { id: user.id, email: user.email, profile: profiles[0] ? formatProfile(profiles[0]) : null },
      token,
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/logout", (_req, res) => { res.json({ success: true }); });

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (users.length === 0) { res.status(401).json({ error: "User not found" }); return; }
    const user = users[0];
    const profiles = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    res.json({ id: user.id, email: user.email, profile: profiles[0] ? formatProfile(profiles[0]) : null });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
