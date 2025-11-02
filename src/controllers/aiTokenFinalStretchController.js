const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const prisma = new PrismaClient();

const aiTokenFinalStretchController = {
  // ✅ API: Ambil data finalStretch dari API eksternal pakai token dari DB
  getFinalStretchData: async (req, res) => {
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

      // Body request ke API eksternal untuk finalStretch
      const url = "https://api2.axiom.trade/pulse";
      const body = {
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
      };

      // Header request dengan cookie token dari DB
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        Origin: "https://axiom.trade",
        Referer: "https://axiom.trade/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        Cookie: `auth-access-token=${authAccessToken}; auth-refresh-token=${authRefreshToken}`
      };

      // Kirim request ke API eksternal
      const response = await axios.post(url, body, { headers });

      return res.status(200).json({
        success: true,
        data: response.data
      });
    } catch (error) {
      console.error("❌ Error fetching FinalStretch data:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch finalStretch data from external API",
        error: error.message
      });
    }
  }
};

module.exports = aiTokenFinalStretchController;

