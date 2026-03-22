import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => usersTable.id),

  // Basic Information
  name: text("name").notNull(),
  age: integer("age").notNull(),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  location: text("location"),
  photos: text("photos").array().notNull().default([]),

  // Profile Details
  bio: text("bio"),
  interests: text("interests").array().notNull().default([]),
  profession: text("profession"),
  education: text("education"),
  course: text("course"),
  courseStatus: text("course_status"),     // pursuing | completed
  completionYear: integer("completion_year"),
  collegeName: text("college_name"),
  languages: text("languages").array().notNull().default([]),

  // Lifestyle
  smoking: text("smoking"),       // yes | no | occasionally
  drinking: text("drinking"),     // yes | no | socially
  workout: text("workout"),       // active | sometimes | never
  diet: text("diet"),             // veg | non-veg | vegan
  pets: text("pets"),             // yes | no

  // Relationship Preferences
  lookingFor: text("looking_for"),
  interestedIn: text("interested_in"),
  minAgePreference: integer("min_age_preference"),
  maxAgePreference: integer("max_age_preference"),
  distancePreference: integer("distance_preference"),

  // Additional / Optional
  hobbies: text("hobbies").array().notNull().default([]),
  favoriteMusic: text("favorite_music"),
  favoriteMovies: text("favorite_movies"),
  instagramHandle: text("instagram_handle"),
  zodiacSign: text("zodiac_sign"),

  // Verification
  verificationStatus: text("verification_status").notNull().default("none"), // none | pending | verified | rejected

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Admin-managed college list
export const collegesTable = pgTable("colleges", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  city: text("city"),
  state: text("state"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Verification requests submitted by users
export const verificationRequestsTable = pgTable("verification_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id),

  // Status
  status: text("status").notNull().default("pending"), // pending | approved | rejected

  // Identity document
  idType: text("id_type").notNull(),      // aadhar | pan | driving_license | passport | voter_card | other
  idNumber: text("id_number").notNull(),
  idFrontUrl: text("id_front_url"),
  idBackUrl: text("id_back_url"),

  // Educational documents
  eduDocType: text("edu_doc_type"),       // certificate | college_id | fee_receipt | other
  eduDocUrl: text("edu_doc_url"),

  // Selfie
  selfieUrl: text("selfie_url"),

  // Contact & address
  phone: text("phone"),
  address: text("address"),

  // Admin feedback
  adminNote: text("admin_note"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const swipesTable = pgTable("swipes", {
  id: text("id").primaryKey(),
  swiperId: text("swiper_id").notNull().references(() => usersTable.id),
  targetId: text("target_id").notNull().references(() => usersTable.id),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const matchesTable = pgTable("matches", {
  id: text("id").primaryKey(),
  user1Id: text("user1_id").notNull().references(() => usersTable.id),
  user2Id: text("user2_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: text("id").primaryKey(),
  matchId: text("match_id").notNull().references(() => matchesTable.id),
  senderId: text("sender_id").notNull().references(() => usersTable.id),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  data: text("data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, createdAt: true, updatedAt: true });

export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profilesTable.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Swipe = typeof swipesTable.$inferSelect;
export type Match = typeof matchesTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
export type College = typeof collegesTable.$inferSelect;
export type VerificationRequest = typeof verificationRequestsTable.$inferSelect;
