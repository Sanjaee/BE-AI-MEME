const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

async function migrate() {
  try {
    console.log("🔄 Running Prisma migrations...");
    await execAsync("npx prisma migrate deploy");
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    // Fallback to migrate dev for development
    try {
      console.log("🔄 Trying migrate dev as fallback...");
      await execAsync("npx prisma migrate dev --name init");
      console.log("✅ Migrations completed successfully");
    } catch (devError) {
      console.error("❌ Migration failed:", devError.message);
      process.exit(1);
    }
  }
}

migrate();
