import { AIVendorFactory } from "./factory";

export function initializeAIVendors() {
  // Initialize OpenAI
  if (process.env.OPENAI_API_KEY) {
    AIVendorFactory.setVendorConfig("openai", {
      apiKey: process.env.OPENAI_API_KEY,
      organizationId: process.env.OPENAI_ORG_ID,
    });
  }

  // Initialize Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    AIVendorFactory.setVendorConfig("anthropic", {
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  // Initialize Google
  if (process.env.GOOGLE_API_KEY) {
    AIVendorFactory.setVendorConfig("google", {
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }
}
