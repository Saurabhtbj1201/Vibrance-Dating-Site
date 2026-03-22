import { Router, type IRouter } from "express";
import { db, verificationRequestsTable, profilesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { generateId } from "../lib/id";

const router: IRouter = Router();

// GET /api/verification/me — get my verification status
router.get("/me", requireAuth, async (req: any, res) => {
  try {
    const rows = await db
      .select()
      .from(verificationRequestsTable)
      .where(eq(verificationRequestsTable.userId, req.userId))
      .limit(1);
    res.json(rows[0] || null);
  } catch (err) {
    req.log.error({ err }, "Get verification error");
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/verification — submit request
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const {
      idType, idNumber, idFrontUrl, idBackUrl,
      eduDocType, eduDocUrl, selfieUrl,
      phone, address,
    } = req.body;

    if (!idType || !idNumber) {
      res.status(400).json({ error: "ID type and number are required" });
      return;
    }

    // Check if one already pending/approved
    const existing = await db
      .select()
      .from(verificationRequestsTable)
      .where(eq(verificationRequestsTable.userId, req.userId))
      .limit(1);

    if (existing[0]?.status === "pending") {
      res.status(409).json({ error: "Verification already pending" });
      return;
    }
    if (existing[0]?.status === "approved") {
      res.status(409).json({ error: "Already verified" });
      return;
    }

    const id = generateId();

    if (existing[0]) {
      // Re-submit after rejection
      await db.update(verificationRequestsTable)
        .set({
          idType, idNumber, idFrontUrl, idBackUrl,
          eduDocType, eduDocUrl, selfieUrl, phone, address,
          status: "pending",
          adminNote: null,
          reviewedAt: null,
          reviewedBy: null,
          updatedAt: new Date(),
        })
        .where(eq(verificationRequestsTable.userId, req.userId));

      const updated = await db.select()
        .from(verificationRequestsTable)
        .where(eq(verificationRequestsTable.userId, req.userId))
        .limit(1);
      res.json(updated[0]);
    } else {
      await db.insert(verificationRequestsTable).values({
        id,
        userId: req.userId,
        idType, idNumber,
        idFrontUrl: idFrontUrl || null,
        idBackUrl: idBackUrl || null,
        eduDocType: eduDocType || null,
        eduDocUrl: eduDocUrl || null,
        selfieUrl: selfieUrl || null,
        phone: phone || null,
        address: address || null,
        status: "pending",
      });

      // Mark profile as pending
      await db.update(profilesTable)
        .set({ verificationStatus: "pending", updatedAt: new Date() })
        .where(eq(profilesTable.userId, req.userId));

      const created = await db.select()
        .from(verificationRequestsTable)
        .where(eq(verificationRequestsTable.id, id))
        .limit(1);
      res.status(201).json(created[0]);
    }
  } catch (err) {
    req.log.error({ err }, "Submit verification error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
