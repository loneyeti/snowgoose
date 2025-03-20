import { Model } from "@prisma/client";
import { AIVendorAdapter, VendorConfig } from "./types";
import { OpenAIAdapter } from "./vendors/openai";
import { AnthropicAdapter } from "./vendors/anthropic";
import { GoogleAIAdapter } from "./vendors/google";
import { prisma } from "../db/prisma";
import { getApiVendor } from "../server_actions/api_vendor.actions";
import { OpenRouterAdapter } from "./vendors/openrouter";

export class AIVendorFactory {
  private static vendorConfigs: Map<string, VendorConfig> = new Map();

  static setVendorConfig(vendorName: string, config: VendorConfig) {
    this.vendorConfigs.set(vendorName.toLowerCase(), config);
  }

  static async getAdapter(model: Model): Promise<AIVendorAdapter> {
    if (!model.apiVendorId) {
      throw new Error("Model must have an associated API vendor");
    }

    // Get the API vendor from the model's apiVendorId
    const apiVendor = await getApiVendor(model.apiVendorId);

    if (!apiVendor) {
      throw new Error(`API vendor not found for id: ${model.apiVendorId}`);
    }

    const vendorName = apiVendor.name.toLowerCase();

    const config = this.vendorConfigs.get(vendorName);
    if (!config) {
      throw new Error(`No configuration found for vendor: ${vendorName}`);
    }

    let adapter: AIVendorAdapter;

    switch (vendorName) {
      case "openai":
        adapter = new OpenAIAdapter(config, model);
        break;
      case "anthropic":
        adapter = new AnthropicAdapter(config, model);
        break;
      case "google":
        adapter = new GoogleAIAdapter(config, model);
        break;
      case "openrouter":
        adapter = new OpenRouterAdapter(config, model);
        break;
      default:
        throw new Error(`Unsupported vendor: ${vendorName}`);
    }

    return adapter;
  }
}
