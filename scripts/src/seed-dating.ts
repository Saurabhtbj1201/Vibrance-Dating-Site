import { db, usersTable, profilesTable } from "@workspace/db";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const demoUsers = [
  {
    email: "emma@example.com",
    password: "password123",
    name: "Emma",
    age: 26,
    bio: "Adventure seeker, coffee lover, and amateur photographer. Looking for someone to explore the city with! 📸☕",
    photos: [
      "https://images.unsplash.com/photo-1494790108755-2616b612b3bc?w=400&h=600&fit=crop&crop=face",
    ],
    interests: ["Photography", "Coffee", "Hiking", "Travel", "Yoga"],
    location: "New York, NY",
    gender: "woman",
    lookingFor: "man",
  },
  {
    email: "alex@example.com",
    password: "password123",
    name: "Alex",
    age: 29,
    bio: "Software engineer by day, musician by night. Love hiking and trying new restaurants 🎸🌮",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face",
    ],
    interests: ["Music", "Coding", "Hiking", "Food", "Movies"],
    location: "San Francisco, CA",
    gender: "man",
    lookingFor: "woman",
  },
  {
    email: "sophia@example.com",
    password: "password123",
    name: "Sophia",
    age: 24,
    bio: "Art lover and weekend warrior. Dog mom to the most adorable golden retriever 🐕🎨",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face",
    ],
    interests: ["Art", "Dogs", "Running", "Cooking", "Reading"],
    location: "Austin, TX",
    gender: "woman",
    lookingFor: "man",
  },
  {
    email: "jordan@example.com",
    password: "password123",
    name: "Jordan",
    age: 31,
    bio: "Startup founder, fitness enthusiast, and amateur chef. Looking for my partner in crime 🏋️‍♂️👨‍🍳",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
    ],
    interests: ["Entrepreneurship", "Fitness", "Cooking", "Travel", "Podcasts"],
    location: "Los Angeles, CA",
    gender: "man",
    lookingFor: "woman",
  },
  {
    email: "mia@example.com",
    password: "password123",
    name: "Mia",
    age: 27,
    bio: "Bookworm, tea enthusiast, and aspiring writer. Let's get lost in a good story ☕📚",
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
    ],
    interests: ["Books", "Writing", "Tea", "Movies", "Yoga"],
    location: "Chicago, IL",
    gender: "woman",
    lookingFor: "man",
  },
  {
    email: "noah@example.com",
    password: "password123",
    name: "Noah",
    age: 28,
    bio: "Graphic designer with a passion for street art and vintage vinyl. Looking for genuine connection 🎨🎵",
    photos: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop&crop=face",
    ],
    interests: ["Art", "Music", "Design", "Cycling", "Coffee"],
    location: "Brooklyn, NY",
    gender: "man",
    lookingFor: "woman",
  },
  {
    email: "isabella@example.com",
    password: "password123",
    name: "Isabella",
    age: 25,
    bio: "Marine biologist studying coral reefs 🐠. Ocean lover, scuba diver, environmentalist.",
    photos: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face",
    ],
    interests: ["Marine Biology", "Scuba Diving", "Environment", "Travel", "Surfing"],
    location: "Miami, FL",
    gender: "woman",
    lookingFor: "man",
  },
  {
    email: "liam@example.com",
    password: "password123",
    name: "Liam",
    age: 30,
    bio: "Chef at a farm-to-table restaurant. Avid skier and lover of the outdoors 🍽️⛷️",
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face",
    ],
    interests: ["Cooking", "Skiing", "Outdoors", "Wine", "Photography"],
    location: "Denver, CO",
    gender: "man",
    lookingFor: "woman",
  },
  {
    email: "ava@example.com",
    password: "password123",
    name: "Ava",
    age: 23,
    bio: "Dance teacher who loves live music and spontaneous road trips 🕺🎸",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
    ],
    interests: ["Dance", "Music", "Road Trips", "Fashion", "Fitness"],
    location: "Nashville, TN",
    gender: "woman",
    lookingFor: "man",
  },
  {
    email: "demo@example.com",
    password: "demo123",
    name: "Demo User",
    age: 25,
    bio: "Just testing out this amazing app! 😄",
    photos: [],
    interests: ["Dating", "Apps", "Testing"],
    location: "Internet, USA",
    gender: "other",
    lookingFor: "everyone",
  },
];

async function seed() {
  console.log("Seeding database...");

  for (const user of demoUsers) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, user.email)).limit(1);
    if (existing.length > 0) {
      console.log(`User ${user.email} already exists, skipping`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 10);
    const userId = randomUUID();
    const profileId = randomUUID();

    await db.insert(usersTable).values({
      id: userId,
      email: user.email,
      passwordHash,
    });

    await db.insert(profilesTable).values({
      id: profileId,
      userId,
      name: user.name,
      age: user.age,
      bio: user.bio,
      photos: user.photos,
      interests: user.interests,
      location: user.location,
      gender: user.gender,
      lookingFor: user.lookingFor,
    });

    console.log(`Created user: ${user.name} (${user.email})`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
