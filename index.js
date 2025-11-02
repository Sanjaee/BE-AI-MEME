import express from "express"
import cors from "cors"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

const app = express()
const port = 5000

app.use(cors())
app.use(express.json())

// Run Prisma migrations on startup
async function runMigrations() {
  try {
    console.log("Running database migrations...")
    await execAsync("npx prisma migrate deploy")
    console.log("✅ Database migrations completed successfully")
  } catch (error) {
    console.error("❌ Migration error:", error.message)
    // Try to run migrate dev if deploy fails (for development)
    try {
      console.log("Trying migrate dev...")
      await execAsync("npx prisma migrate dev --name init")
      console.log("✅ Database migrations completed successfully")
    } catch (devError) {
      console.error("❌ Migration dev error:", devError.message)
    }
  }
}

// Import routes
import aiTokenRoutes from "./src/routes/aiTokenRoutes.js"

app.get("/", (req, res) => {
    res.send("Letscode!")
})

// Routes
app.use("/api/ai-token", aiTokenRoutes)

// Start server after migrations
async function startServer() {
  await runMigrations()
  
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}/`)
  })
}

startServer().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})