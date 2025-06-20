import { AIVendorFactory } from "snowgander"; // Added MCPAvailableTool, ToolUseBlock, ContentBlock

export function initializeAIVendors() {
  // Initialize AI vendors using the imported factory
  if (process.env.OPENAI_API_KEY) {
    AIVendorFactory.setVendorConfig("openai", {
      apiKey: process.env.OPENAI_API_KEY,
      organizationId: process.env.OPENAI_ORG_ID,
    });
  }

  if (process.env.OPENAI_API_KEY) {
    AIVendorFactory.setVendorConfig("openai-image", {
      apiKey: process.env.OPENAI_API_KEY,
      organizationId: process.env.OPENAI_ORG_ID,
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    AIVendorFactory.setVendorConfig("anthropic", {
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  if (process.env.GOOGLE_API_KEY) {
    AIVendorFactory.setVendorConfig("google", {
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  if (process.env.OPENROUTER_API_KEY) {
    AIVendorFactory.setVendorConfig("openrouter", {
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
}

initializeAIVendors();
