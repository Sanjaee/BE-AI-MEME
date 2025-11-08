require('dotenv').config()
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const prisma = new PrismaClient();

const aiTokenBnbFinalStretchController = {
  // ✅ API: Ambil data finalStretch BNB dari API eksternal pakai token dari DB
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

      // Body request ke API eksternal untuk finalStretch BNB
      const url = "https://api1-bnb.axiom.trade/pulse";
      const body = {
        table: "finalStretch",
        filters: {
          age: { min: null, max: null },
          atLeastOneSocial: false,
          bondingCurve: { min: null, max: null },
          devHolding: { min: null, max: null },
          dexPaid: false,
          excludeKeywords: [],
          holders: { min: null, max: null },
          insiders: { min: null, max: null },
          liquidity: { min: null, max: null },
          marketCap: { min: null, max: null },
          numBuys: { min: null, max: null },
          numDevCreations: { min: null, max: null },
          numDevMigrations: { min: null, max: null },
          numSells: { min: null, max: null },
          protocols: {
            "Fourmeme V2": true,
            "Binance": true,
            "Uniswap V2": false,
            "Uniswap V3": false,
            "Uniswap V4": false
          },
          searchKeywords: [],
          showQuoteTokens: {
            wbnb: true,
            bnb: true,
            usdt: true,
            usd1: true,
            cake: true,
            aster: true,
            lisusd: true,
            usdc: true
          },
          snipers: { min: null, max: null },
          telegram: false,
          top10Holders: { min: null, max: null },
          tweetAgeMins: { min: null, max: null },
          twitterExists: false,
          twitterHandleReuses: { min: null, max: null },
          txns: { min: null, max: null },
          volume: { min: null, max: null },
          website: false
        }
      };

      // Header request dengan cookie token dari DB
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        Origin: "https://axiom.trade",
        Referer: "https://axiom.trade/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        Cookie: `auth-access-token=${authAccessToken}; auth-refresh-token=${authRefreshToken}`
      };

      // Kirim request ke API eksternal
      const response = await axios.post(url, body, { headers });

      return res.status(200).json({
        success: true,
        data: response.data
      });
    } catch (error) {
      console.error("❌ Error fetching BNB FinalStretch data:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch BNB finalStretch data from external API",
        error: error.message
      });
    }
  }
};

module.exports = aiTokenBnbFinalStretchController;

