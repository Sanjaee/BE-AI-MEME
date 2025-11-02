// Load environment variables from .env file (for local development)
// Note: In Docker, environment variables are loaded automatically from docker-compose.yml
require('dotenv').config()

const express = require("express")
const cors = require("cors")
const { exec } = require("child_process")
const { promisify } = require("util")

const execAsync = promisify(exec)

const app = express()
const port = process.env.PORT || 5000

// CORS configuration - allow specific frontend domains
// Environment variables are loaded from .env (local) or docker-compose.yml (Docker)
// Support multiple origins: local development and production

// Determine default frontend URL based on environment
const isDevelopment = process.env.NODE_ENV === 'development'
const defaultFrontendUrl = isDevelopment 
  "https://meme-ai-delta.vercel.app"

// Parse allowed origins from environment variable (comma-separated)
const frontendUrlEnv = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || defaultFrontendUrl
const allowedOrigins = frontendUrlEnv.split(',').map(url => url.trim()).filter(url => url.length > 0)

// Default allowed origins (add production domain here if needed)
const defaultOrigins = [
  "https://meme-ai-delta.vercel.app"
]

// Combine and deduplicate origins
const allAllowedOrigins = [...new Set([...defaultOrigins, ...allowedOrigins])]

console.log(`🔒 CORS configured for allowed origins: ${allAllowedOrigins.join(', ')}`)

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (same-origin requests or preflight)
    // This is needed for CORS preflight OPTIONS requests
    if (!origin) {
      return callback(null, true)
    }
    
    // Check if origin is in allowed list
    if (allAllowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}. Allowed: ${allAllowedOrigins.join(', ')}`)
      callback(new Error('CORS policy: Origin not allowed'), false)
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control']
}

app.use(cors(corsOptions))

// Middleware to block direct browser access and Postman
const blockDirectAccess = (req, res, next) => {
  const userAgent = req.get('user-agent') || ''
  const referer = req.get('referer') || req.get('referrer') || ''
  const origin = req.get('origin')
  
  // Block Postman, Insomnia, Thunder Client, curl, and other API testing tools
  if (
    userAgent.includes('Postman') || 
    userAgent.includes('insomnia') || 
    userAgent.includes('Thunder Client') ||
    userAgent.includes('curl/') ||
    userAgent.includes('HTTPie') ||
    userAgent.includes('RestClient') ||
    userAgent === '' ||
    !userAgent
  ) {
    return res.status(403).send('Access Denied')
  }
  
  // Block if origin doesn't match allowed origins
  if (origin && !allAllowedOrigins.includes(origin)) {
    return res.status(403).send('Access Denied')
  }
  
  // Block direct browser access - must have origin matching allowed origins
  // But allow if it's an OPTIONS request (CORS preflight)
  if (req.method !== 'OPTIONS') {
    if (!origin || !allAllowedOrigins.includes(origin)) {
      return res.status(403).send('Access Denied')
    }
  }
  
  next()
}

app.use(express.json())

// Apply blocking middleware to all API routes except health check and auth
app.use((req, res, next) => {
  // Allow root path (health check)
  if (req.path === '/') {
    return next()
  }
  // Allow OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next()
  }
  // Allow auth routes without strict origin check (server-to-server from NextAuth)
  // Auth routes will still be protected by CORS policy
  if (req.path.startsWith('/api/auth')) {
    // Only block known API testing tools
    const userAgent = req.get('user-agent') || ''
    if (
      userAgent.includes('Postman') || 
      userAgent.includes('insomnia') || 
      userAgent.includes('Thunder Client') ||
      userAgent.includes('curl/') ||
      userAgent.includes('HTTPie') ||
      userAgent.includes('RestClient')
    ) {
      return res.status(403).send('Access Denied')
    }
    // Allow auth routes to proceed (CORS will still filter based on origin)
    return next()
  }
  // Apply block middleware to all other routes
  blockDirectAccess(req, res, next)
})

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
const aiTokenRoutes = require("./src/routes/aiTokenRoutes.js")
const authRoutes = require("./src/routes/authRoutes.js")
const plisioRoutes = require("./src/routes/plisioRoutes.js")

app.get("/", (req, res) => {
    res.send("Letscode!")
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/ai-token", aiTokenRoutes)
app.use("/api/plisio", plisioRoutes)

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