const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const prisma = new PrismaClient();

// Helper function untuk mask token (sensor sebagian)
function maskToken(token, visibleChars = 4) {
  if (!token || token.length === 0) return "";
  if (token.length <= visibleChars * 2) {
    // Jika token terlalu pendek, hanya tampilkan karakter pertama dan terakhir
    return token.charAt(0) + "*".repeat(token.length - 2) + token.charAt(token.length - 1);
  }
  const start = token.substring(0, visibleChars);
  const end = token.substring(token.length - visibleChars);
  const middle = "*".repeat(Math.max(8, token.length - visibleChars * 2));
  return `${start}${middle}${end}`;
}

const aiTokenCombinedController = {
  // ✅ API: Gabungkan data dari newPairs, finalStretch, dan migrated
  getCombinedData: async (req, res) => {
    try {
      // Ambil token dari database
      const admin = await prisma.token.findFirst({
        select: {
          authAccessToken: true,
          authRefreshToken: true
        }
      });

      if (!admin) {
        return res.status(404).json({ error: "Token not found in database" });
      }

      const { authAccessToken, authRefreshToken } = admin;

      const url = "https://api2.axiom.trade/pulse";
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        Origin: "https://axiom.trade",
        Referer: "https://axiom.trade/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        Cookie: `auth-access-token=${authAccessToken}; auth-refresh-token=${authRefreshToken}`
      };

      // Request configurations untuk masing-masing table
      const requests = [
        {
          name: "newPairs",
          body: {
            table: "newPairs",
            filters: {
              age: { min: null, max: null },
              atLeastOneSocial: false,
              bondingCurve: { min: null, max: null },
              botUsers: { min: null, max: null },
              bundle: { min: null, max: null },
              devHolding: { min: null, max: null },
              dexPaid: false,
              excludeKeywords: [],
              fees: { min: null, max: null },
              holders: { min: null, max: null },
              insiders: { min: null, max: null },
              liquidity: { min: null, max: null },
              marketCap: { min: null, max: null },
              mustEndInPump: false,
              numBuys: { min: null, max: null },
              numMigrations: { min: null, max: null },
              numSells: { min: null, max: null },
              protocols: {
                raydium: false,
                pumpAmm: false,
                pump: true,
                moonshot: true,
                moonshotApp: true,
                launchLab: true
              },
              searchKeywords: [],
              snipers: { min: null, max: null },
              telegram: false,
              top10Holders: { min: null, max: null },
              twitter: { min: null, max: null },
              twitterExists: false,
              txns: { min: null, max: null },
              volume: { min: null, max: null },
              website: false
            },
            usdPerSol: 150
          }
        },
        {
          name: "finalStretch",
          body: {
            table: "finalStretch",
            filters: {
              age: { min: null, max: null },
              atLeastOneSocial: false,
              bondingCurve: { min: null, max: null },
              botUsers: { min: null, max: null },
              bundle: { min: null, max: null },
              devHolding: { min: null, max: null },
              dexPaid: false,
              excludeKeywords: [],
              fees: { min: null, max: null },
              holders: { min: null, max: null },
              insiders: { min: null, max: null },
              liquidity: { min: null, max: null },
              marketCap: { min: 205.12820512820514, max: null },
              mustEndInPump: false,
              numBuys: { min: null, max: null },
              numMigrations: { min: null, max: null },
              numSells: { min: null, max: null },
              protocols: {
                bags: true,
                bonk: true,
                boop: true,
                orca: false,
                pump: true,
                pumpAmm: false,
                raydium: false
              },
              searchKeywords: [],
              snipers: { min: null, max: null },
              telegram: false,
              top10Holders: { min: null, max: null },
              twitter: { min: null, max: null },
              twitterExists: false,
              txns: { min: null, max: null },
              volume: { min: null, max: null },
              website: false
            },
            usdPerSol: 195
          }
        },
        {
          name: "migrated",
          body: {
            table: "migrated",
            filters: {
              age: { min: null, max: null },
              atLeastOneSocial: false,
              bondingCurve: { min: null, max: null },
              botUsers: { min: null, max: null },
              bundle: { min: null, max: null },
              devHolding: { min: null, max: null },
              dexPaid: false,
              excludeKeywords: [],
              fees: { min: null, max: null },
              holders: { min: null, max: null },
              insiders: { min: null, max: null },
              liquidity: { min: null, max: null },
              marketCap: { min: null, max: null },
              mustEndInPump: false,
              numBuys: { min: null, max: null },
              numMigrations: { min: null, max: null },
              numSells: { min: null, max: null },
              protocols: {
                bags: true,
                bonk: true,
                boop: true,
                orca: false,
                pump: true,
                pumpAmm: false,
                raydium: false
              },
              searchKeywords: [],
              snipers: { min: null, max: null },
              telegram: false,
              top10Holders: { min: null, max: null },
              twitter: { min: null, max: null },
              twitterExists: false,
              txns: { min: null, max: null },
              volume: { min: null, max: null },
              website: false
            },
            usdPerSol: 195
          }
        }
      ];

      // Fetch semua data secara parallel
      const promises = requests.map(({ name, body }) =>
        axios
          .post(url, body, { headers })
          .then((response) => ({
            success: true,
            table: name,
            data: response.data
          }))
          .catch((error) => {
            console.error(`❌ Failed to fetch ${name} data:`, error.message);
            return {
              success: false,
              table: name,
              error: error.message,
              data: null
            };
          })
      );

      const results = await Promise.all(promises);

      // Pisahkan hasil berdasarkan success/failure
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      // Tampilkan console untuk yang gagal
      if (failed.length > 0) {
        console.error("❌ Failed fetches:", failed.map((f) => `${f.table}: ${f.error}`).join(", "));
      }

      // Gabungkan semua data menjadi satu array
      const combinedData = [];
      
      // Extract data dari setiap table yang berhasil
      results.forEach((result) => {
        if (result.success && result.data) {
          let tokensToAdd = [];
          
          // Jika response.data adalah array langsung
          if (Array.isArray(result.data)) {
            tokensToAdd = result.data;
          }
          // Jika response.data adalah object dengan property array
          else if (result.data.data && Array.isArray(result.data.data)) {
            tokensToAdd = result.data.data;
          }
          // Jika response.data adalah object dengan property rows atau items
          else if (result.data.rows && Array.isArray(result.data.rows)) {
            tokensToAdd = result.data.rows;
          }
          else if (result.data.items && Array.isArray(result.data.items)) {
            tokensToAdd = result.data.items;
          }
          // Jika response.data adalah object, tambahkan sebagai single item
          else if (typeof result.data === 'object') {
            tokensToAdd = [result.data];
          }
          
          if (tokensToAdd.length > 0) {
            console.log(`✅ Successfully fetched ${tokensToAdd.length} tokens from ${result.table}`);
            combinedData.push(...tokensToAdd);
          } else {
            console.log(`⚠️ No tokens found in ${result.table} response`);
          }
        }
      });
      
      console.log(`📊 Total combined tokens: ${combinedData.length}`);

      return res.status(200).json({
        success: true,
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length,
          combinedItems: combinedData.length
        },
        data: combinedData,
        errors: failed.length > 0 ? failed.map((f) => ({ table: f.table, error: f.error })) : null
      });
    } catch (error) {
      console.error("❌ Error in combined data fetch:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch combined data",
        error: error.message
      });
    }
  },

  // ✅ API: Get token dari database (disensor sebagian untuk keamanan)
  getToken: async (req, res) => {
    try {
      const token = await prisma.token.findUnique({
        where: { id: 1 }
      });

      if (!token) {
        return res.status(404).json({
          success: false,
          message: "Token not found in database"
        });
      }

      // Mask token untuk keamanan
      const maskedToken = {
        id: token.id,
        authAccessToken: maskToken(token.authAccessToken),
        authRefreshToken: maskToken(token.authRefreshToken),
        updatedAt: token.updatedAt
      };

      return res.status(200).json({
        success: true,
        data: maskedToken
      });
    } catch (error) {
      console.error("Error fetching token:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch token",
        error: error.message
      });
    }
  },

  // ✅ API: Update token di database (ID tetap = 1, hanya update, tidak create baru)
  updateToken: async (req, res) => {
    try {
      const { authAccessToken, authRefreshToken } = req.body;

      if (!authAccessToken || !authRefreshToken) {
        return res.status(400).json({
          success: false,
          message: "Both authAccessToken and authRefreshToken are required"
        });
      }

      // Check dulu apakah token dengan ID 1 sudah ada
      const existingToken = await prisma.token.findUnique({
        where: { id: 1 }
      });

      if (!existingToken) {
        return res.status(404).json({
          success: false,
          message: "Token with ID 1 not found. Please create it first."
        });
      }

      // Hanya update, tidak create baru
      const updated = await prisma.token.update({
        where: { id: 1 },
        data: {
          authAccessToken,
          authRefreshToken
        }
      });

      return res.status(200).json({
        success: true,
        message: "Tokens updated successfully",
        data: updated
      });
    } catch (error) {
      console.error("Error updating token:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to update tokens",
        error: error.message
      });
    }
  }
};

module.exports = aiTokenCombinedController;

