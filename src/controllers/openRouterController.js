require('dotenv').config()
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper function untuk mask API key (sensor sebagian)
function maskApiKey(apiKey, visibleChars = 8) {
  if (!apiKey || apiKey.length === 0) return "";
  if (apiKey.length <= visibleChars * 2) {
    // Jika API key terlalu pendek, hanya tampilkan karakter pertama dan terakhir
    return apiKey.charAt(0) + "*".repeat(apiKey.length - 2) + apiKey.charAt(apiKey.length - 1);
  }
  const start = apiKey.substring(0, visibleChars);
  const end = apiKey.substring(apiKey.length - visibleChars);
  const middle = "*".repeat(Math.max(12, apiKey.length - visibleChars * 2));
  return `${start}${middle}${end}`;
}

const openRouterController = {
  // ✅ API: Get OpenRouter API Key dari database (disensor sebagian untuk keamanan)
  getApiKey: async (req, res) => {
    try {
      // Ambil API key dengan ID 1
      const apiKeyRecord = await prisma.openRouterApiKey.findUnique({
        where: { id: 1 }
      });

      if (!apiKeyRecord) {
        return res.status(404).json({
          success: false,
          message: "OpenRouter API Key not found in database"
        });
      }

      // Mask API key untuk keamanan
      const maskedApiKey = {
        id: apiKeyRecord.id,
        apiKey: maskApiKey(apiKeyRecord.apiKey),
        updatedAt: apiKeyRecord.updatedAt,
        createdAt: apiKeyRecord.createdAt
      };

      return res.status(200).json({
        success: true,
        data: maskedApiKey
      });
    } catch (error) {
      console.error("Error fetching OpenRouter API Key:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch OpenRouter API Key",
        error: error.message
      });
    }
  },

  // ✅ API: Update atau Create OpenRouter API Key di database
  updateApiKey: async (req, res) => {
    try {
      const { apiKey } = req.body;

      if (!apiKey || apiKey.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "API Key is required"
        });
      }

      // Check dulu apakah sudah ada API key dengan ID 1
      const existingApiKey = await prisma.openRouterApiKey.findUnique({
        where: { id: 1 }
      });

      let result;
      if (existingApiKey) {
        // Update yang sudah ada (ID 1)
        result = await prisma.openRouterApiKey.update({
          where: { id: 1 },
          data: {
            apiKey: apiKey.trim()
          }
        });
      } else {
        // Create baru dengan ID 1 jika belum ada
        result = await prisma.openRouterApiKey.create({
          data: {
            id: 1,
            apiKey: apiKey.trim()
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: existingApiKey ? "OpenRouter API Key updated successfully" : "OpenRouter API Key created successfully",
        data: {
          id: result.id,
          updatedAt: result.updatedAt
        }
      });
    } catch (error) {
      console.error("Error updating OpenRouter API Key:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to update OpenRouter API Key",
        error: error.message
      });
    }
  }
};

module.exports = openRouterController;

