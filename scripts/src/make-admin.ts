import { db, usersTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";

async function makeAdmin() {
  const email = "saurabhtbj143@gmail.com";
  console.log(`Setting admin privileges for ${email} (case-insensitive checking)...`);

  const users = await db.select().from(usersTable);
  console.log("All users in DB:", users.map(u => ({ email: u.email, isAdmin: u.isAdmin })));

  const result = await db
    .update(usersTable)
    .set({ isAdmin: true })
    .where(ilike(usersTable.email, email))
    .returning();

  if (result.length > 0) {
    console.log(`Success! ${result[0].email} is now an ADMIN.`);
  } else {
    console.log(`Error: User not found with email: ${email}`);
  }
  process.exit(0);
}

makeAdmin().catch((err) => {
  console.error("Error updating user:", err);
  process.exit(1);
});