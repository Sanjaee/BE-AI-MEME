require('dotenv').config()
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const prisma = new PrismaClient();

const aiTokenBnbCombinedController = {
  // ✅ API: Gabungkan data BNB dari newPairs
  getCombinedData: async (req, res) => {
    try {
      // Handle query parameter t (timestamp) untuk cache busting jika ada
      const timestamp = req.query.t || Date.now();
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

      const url = "https://api1-bnb.axiom.trade/pulse";
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        Origin: "https://axiom.trade",
        Referer: "https://axiom.trade/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        Cookie: `auth-access-token=${authAccessToken}; auth-refresh-token=${authRefreshToken}`
      };

      // Request configurations untuk newPairs, finalStretch, dan migrated BNB
      const requests = [
        {
          name: "newPairs",
          body: {
            table: "newPairs",
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
            console.error(`❌ Failed to fetch BNB ${name} data:`, error.message);
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
        console.error("❌ Failed BNB fetches:", failed.map((f) => `${f.table}: ${f.error}`).join(", "));
      }

      // Gabungkan semua data menjadi satu array
      const combinedData = [];
      
      // Extract data dari setiap table yang berhasil
      results.forEach((result) => {
        if (result.success && result.data) {
          let tokensToAdd = [];
          
          // API BNB mengembalikan format: {status: "Success", data: [...]}
          if (result.data.status === "Success" && Array.isArray(result.data.data)) {
            tokensToAdd = result.data.data;
          }
          // Jika response.data adalah array langsung
          else if (Array.isArray(result.data)) {
            tokensToAdd = result.data;
          }
          // Jika response.data adalah object dengan property data (array)
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
            combinedData.push(...tokensToAdd);
          }
        }
      });

      // Transform data BNB ke format TokenData (mapping field BNB ke format yang diharapkan)
      const transformedData = combinedData.map((token) => {
        // Convert liquidityNative dari string/wei ke number (BNB)
        const liquidityNative = token.liquidityNative 
          ? (typeof token.liquidityNative === 'string' 
              ? parseFloat(token.liquidityNative) / 1e18 
              : token.liquidityNative)
          : 0;

        return {
          ...token,
          // Map field BNB ke format TokenData
          marketCapSol: token.marketCap || token.marketCapSol || 0,
          volumeSol: token.volume || token.volumeSol || 0,
          liquiditySol: liquidityNative,
          // Ensure all required fields exist
          numTxns: token.numTxns || 0,
          numBuys: token.numBuys || 0,
          numSells: token.numSells || 0,
          top10HoldersPercent: token.top10HoldersPercent || token.top10Holders || 0,
          devHoldsPercent: token.devHoldsPercent || 0,
          snipersHoldPercent: token.snipersHoldPercent || 0,
          insidersHoldPercent: token.insidersHoldPercent || 0,
          bundlersHoldPercent: token.bundlersHoldPercent || 0,
          numHolders: token.numHolders || 0,
          numTradingBotUsers: token.numTradingBotUsers || 0,
          createdAt: token.createdAt || token.openTrading || new Date().toISOString(),
          openTrading: token.openTrading || token.createdAt || new Date().toISOString(),
          website: token.website || null,
          twitter: token.twitter || null,
          telegram: token.telegram || null,
          dexPaid: token.dexPaid || false,
          isPumpLive: token.isPumpLive || false
        };
      });

      // Filter berdasarkan kriteria sama seperti Solana:
      // 1. Top 10 Holders <= 20%
      // 2. Total Holders >= 100
      const filteredData = transformedData.filter((token) => {
        // Check top10HoldersPercent
        const top10Holders = token.top10HoldersPercent || 
                            token.top10Holders || 
                            0;
        
        // Check numHolders
        const holders = token.numHolders || 
                       token.holders || 
                       0;
        
        // Filter: top10Holders <= 20% AND holders >= 100
        return top10Holders <= 20 && holders >= 100;
      });

      // Sort berdasarkan waktu launch paling awal (terbaru di atas)
      const sortedData = filteredData.sort((a, b) => {
        // Ambil waktu launch (prioritaskan openTrading, fallback ke createdAt)
        const timeA = new Date(a.openTrading || a.createdAt).getTime();
        const timeB = new Date(b.openTrading || b.createdAt).getTime();
        
        // Sort descending (terbaru di atas)
        return timeB - timeA;
      });

      // Return dengan format yang diharapkan: {status: "Success", data: [...]}
      return res.status(200).json({
        status: "Success",
        data: sortedData
      });
    } catch (error) {
      console.error("❌ Error in BNB combined data fetch:", error.message);
      return res.status(500).json({
        status: "Error",
        message: "Failed to fetch BNB combined data",
        error: error.message
      });
    }
  }
};

module.exports = aiTokenBnbCombinedController;

