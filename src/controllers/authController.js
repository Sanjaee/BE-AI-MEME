const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key-change-in-production";
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

// Generate JWT tokens
function generateTokens(admin) {
  const accessToken = jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      type: "refresh",
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

const authController = {
  // ✅ Login admin
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      // Find admin by username or email
      const admin = await prisma.admin.findFirst({
        where: {
          OR: [
            { username: username },
            { email: username },
          ],
        },
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(admin);

      // Return admin data (without password) and tokens
      const { password: _, ...adminWithoutPassword } = admin;

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: adminWithoutPassword,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Error in login:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to login",
        error: error.message,
      });
    }
  },

  // ✅ Verify token
  verifyToken: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
        });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get admin from database
        const admin = await prisma.admin.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!admin) {
          return res.status(401).json({
            success: false,
            valid: false,
            message: "Admin not found",
          });
        }

        return res.status(200).json({
          success: true,
          valid: true,
          user: admin,
        });
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          valid: false,
          message: "Invalid or expired token",
        });
      }
    } catch (error) {
      console.error("Error verifying token:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to verify token",
        error: error.message,
      });
    }
  },

  // ✅ Refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        // Verify it's a refresh token
        if (decoded.type !== "refresh") {
          return res.status(401).json({
            success: false,
            message: "Invalid refresh token",
          });
        }

        // Get admin from database
        const admin = await prisma.admin.findUnique({
          where: { id: decoded.id },
        });

        if (!admin) {
          return res.status(401).json({
            success: false,
            message: "Admin not found",
          });
        }

        // Generate new tokens
        const tokens = generateTokens(admin);

        return res.status(200).json({
          success: true,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired refresh token",
        });
      }
    } catch (error) {
      console.error("Error refreshing token:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to refresh token",
        error: error.message,
      });
    }
  },
};

module.exports = authController;

