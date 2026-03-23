import { Router, type IRouter } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq, ne, asc } from "drizzle-orm";
import { UpdateMyProfileBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

function calcAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function calcCompletionPercent(p: any): number {
  const fields = [
    p.photos?.length > 0,
    !!p.bio,
    !!p.gender,
    !!p.location,
    p.interests?.length > 0,
    !!p.profession,
    !!p.dateOfBirth,
    !!p.lookingFor,
    !!p.interestedIn,
    !!p.smoking,
    !!p.drinking,
    !!p.workout,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export function formatProfile(p: any) {
  const age = calcAge(p.dateOfBirth) ?? p.age;
  return {
    id: p.id,
    userId: p.userId,
    name: p.name,
    age,
    dateOfBirth: p.dateOfBirth,
    gender: p.gender,
    location: p.location,
    photos: p.photos || [],
    bio: p.bio,
    interests: p.interests || [],
    profession: p.profession,
    education: p.education,
    course: p.course,
    courseStatus: p.courseStatus,
    completionYear: p.completionYear,
    collegeName: p.collegeName,
    languages: p.languages || [],
    smoking: p.smoking,
    drinking: p.drinking,
    workout: p.workout,
    diet: p.diet,
    pets: p.pets,
    lookingFor: p.lookingFor,
    interestedIn: p.interestedIn,
    minAgePreference: p.minAgePreference,
    maxAgePreference: p.maxAgePreference,
    distancePreference: p.distancePreference,
    hobbies: p.hobbies || [],
    favoriteMusic: p.favoriteMusic,
    favoriteMovies: p.favoriteMovies,
    instagramHandle: p.instagramHandle,
    zodiacSign: p.zodiacSign,
    verificationStatus: p.verificationStatus ?? "none",
    createdAt: p.createdAt?.toISOString(),
    completionPercent: calcCompletionPercent(p),
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const search = (req.query.search as string || "").trim().toLowerCase();

    let rows = await db
      .select()
      .from(profilesTable)
      .where(ne(profilesTable.userId, userId))
      .orderBy(asc(profilesTable.createdAt))
      .limit(limit)
      .offset(offset);

    if (search) {
      rows = rows.filter(p => p.name.toLowerCase().includes(search));
    }

    res.json(rows.map(formatProfile));
  } catch (err) {
    req.log.error({ err }, "Browse profiles error");
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const profiles = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    if (profiles.length === 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(formatProfile(profiles[0]));
  } catch (err) {
    req.log.error({ err }, "Get profile error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const body = UpdateMyProfileBody.parse(req.body);

    const updateData: any = { updatedAt: new Date() };

    const stringFields = [
      "name", "bio", "gender", "location", "profession", "education",
      "smoking", "drinking", "workout", "diet", "pets",
      "lookingFor", "interestedIn", "dateOfBirth",
      "favoriteMusic", "favoriteMovies", "instagramHandle", "zodiacSign",
    ];
    const arrayFields = ["photos", "interests", "languages", "hobbies"];
    const intFields = ["minAgePreference", "maxAgePreference", "distancePreference"];

    for (const f of stringFields) {
      if ((body as any)[f] !== undefined) updateData[f] = (body as any)[f];
    }
    for (const f of arrayFields) {
      if ((body as any)[f] !== undefined) updateData[f] = (body as any)[f];
    }
    for (const f of intFields) {
      if ((body as any)[f] !== undefined) updateData[f] = (body as any)[f];
    }

    // Auto-compute age from DOB if provided
    if (body.dateOfBirth) {
      const birth = new Date(body.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      updateData.age = age;
    }

    const updated = await db.update(profilesTable).set(updateData).where(eq(profilesTable.userId, userId)).returning();
    if (updated.length === 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(formatProfile(updated[0]));
  } catch (err) {
    req.log.error({ err }, "Update profile error");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/:profileId", requireAuth, async (req, res) => {
  try {
    const profileId = Array.isArray(req.params.profileId)
      ? req.params.profileId[0]
      : req.params.profileId;
    const profiles = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId)).limit(1);
    if (profiles.length === 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(formatProfile(profiles[0]));
  } catch (err) {
    req.log.error({ err }, "Get profile by ID error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
