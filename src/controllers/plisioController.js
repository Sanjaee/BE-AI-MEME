require('dotenv').config()
const axios = require("axios")

const plisioController = {
  // ✅ API: Get Plisio currency rates
  getCurrencies: async (req, res) => {
    try {
      const apiKey = process.env.PLISIO_API_KEY || "eB_tpJ0APoZFakdp7HIH-drEhVjGwBNCMi-VaDxMtUulbgDsDDtUS86Hu7BkjzBG"
      
      const response = await axios.get(
        `https://api.plisio.net/api/v1/currencies?api_key=${apiKey}`,
        {
          timeout: 10000,
        }
      )

      if (response.data.status === "success" && response.data.data) {
        // Filter out hidden currencies and maintenance currencies
        const visibleCurrencies = response.data.data.filter(
          (curr) => !curr.hidden && !curr.maintenance
        )
        
        return res.status(200).json({
          success: true,
          data: visibleCurrencies,
          timestamp: Date.now()
        })
      }
      
      return res.status(200).json({
        success: false,
        message: "No currencies available",
        data: []
      })
    } catch (error) {
      console.error("❌ Error fetching Plisio currencies:", error.message)
      return res.status(500).json({
        success: false,
        message: "Failed to fetch currencies",
        error: error.message
      })
    }
  }
}

module.exports = plisioController

