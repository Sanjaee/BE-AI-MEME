require('dotenv').config()
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// OpenRouter API configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || "";
const OPENROUTER_SITE_NAME = process.env.OPENROUTER_SITE_NAME || "";

// Helper function untuk mendapatkan API key dari database atau fallback ke env
async function getOpenRouterApiKey() {
  try {
    // Ambil API key dengan ID 1
    const apiKeyRecord = await prisma.openRouterApiKey.findUnique({
      where: { id: 1 }
    });
    
    if (apiKeyRecord && apiKeyRecord.apiKey) {
      return apiKeyRecord.apiKey;
    }
  } catch (error) {
    console.error("Error fetching OpenRouter API Key from database:", error.message);
  }
  
  // Fallback ke environment variable atau default
  return process.env.OPENROUTER_API_KEY || "";
}

const aiChatController = {
  // ✅ API: Chat completion dengan OpenRouter
  chatCompletion: async (req, res) => {
    try {
      const { messages, model, stream, temperature, content } = req.body;

      // Support both formats: messages array or single content string
      let chatMessages = messages;
      
      // If content is provided (legacy format), convert to messages format
      if (content && !messages) {
        chatMessages = [
          {
            role: "user",
            content: content
          }
        ];
      }

      // Validate messages
      if (!chatMessages || !Array.isArray(chatMessages) || chatMessages.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Messages field is required and must be a non-empty array"
        });
      }

      // Default values
      const chatModel = model || "nvidia/nemotron-nano-9b-v2:free";
      const chatStream = stream || false;
      const chatTemperature = temperature !== undefined ? temperature : 0;

      // Get API key from database
      const OPENROUTER_API_KEY = await getOpenRouterApiKey();

      // Prepare headers for OpenRouter API
      const headers = {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      };

      // Add optional headers if provided
      if (OPENROUTER_SITE_URL) {
        headers["HTTP-Referer"] = OPENROUTER_SITE_URL;
      }
      if (OPENROUTER_SITE_NAME) {
        headers["X-Title"] = OPENROUTER_SITE_NAME;
      }

      // Prepare payload for OpenRouter API
      const payload = {
        model: chatModel,
        messages: chatMessages
      };

      // Add optional parameters
      if (chatTemperature !== undefined) {
        payload.temperature = chatTemperature;
      }
      if (chatStream) {
        payload.stream = chatStream;
      }

      // Make request to OpenRouter API
      const response = await axios.post(
        OPENROUTER_API_URL,
        payload,
        { headers }
      );

      if (response.status !== 200) {
        return res.status(response.status).json({
          success: false,
          error: "OpenRouter API error",
          details: response.data
        });
      }

      const openrouterResponse = response.data;

      // Extract the response content
      if (chatStream) {
        // Handle streaming response
        return res.status(200).json({
          success: true,
          response: openrouterResponse
        });
      } else {
        // Non-streaming response
        const responseContent = openrouterResponse?.choices?.[0]?.message?.content || "";
        
        return res.status(200).json({
          success: true,
          response: responseContent
        });
      }
    } catch (error) {
      console.error("❌ Error in chat completion:", error.message);
      
      // Handle axios errors
      if (error.response) {
        return res.status(error.response.status || 500).json({
          success: false,
          error: "OpenRouter API error",
          details: error.response.data || error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to process chat completion",
        message: error.message
      });
    }
  }
};

module.exports = aiChatController;

