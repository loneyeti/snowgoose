import { Model, User } from "@prisma/client";
import { ResourceType } from "../_ui/settings/buttons";
// Import shared types from the new package
import {
  Chat,
  ChatResponse,
  ContentBlock,
  MCPTool,
  ThinkingBlock,
  RedactedThinkingBlock,
  TextBlock,
  ImageBlock,
  OpenAIImageGenerationOptions,
  OpenAIImageEditOptions, // Import directly now
} from "snowgander";

// Re-export Prisma types for consistent usage
export type { Model, User };

// Re-export types from the package for use within the app
export type {
  Chat,
  ChatResponse,
  ContentBlock,
  MCPTool,
  ThinkingBlock,
  RedactedThinkingBlock,
  TextBlock,
  ImageBlock,
  OpenAIImageGenerationOptions,
  OpenAIImageEditOptions, // Re-export directly
};

// Define a new type that includes the vendor name
export interface ModelWithVendorName extends Model {
  apiVendorName?: string; // Add the optional vendor name property
}

export interface LocalChat extends Chat {
  modelId: number;
  mcpToolId?: number;
  imageData?: string;
  personaId: number;
  outputFormatId: number;
  renderTypeName: string;
  openaiImageGenerationOptions?: OpenAIImageGenerationOptions;
  openaiImageEditOptions?: OpenAIImageEditOptions;
  useWebSearch?: boolean;
}

export interface Persona {
  id: number;
  name: string;
  prompt: string;
  ownerId: number | null;
}

export interface PersonaPost {
  name: string;
  prompt: string;
  ownerId: number | null;
}

export interface OutputFormatPost {
  name: string;
  prompt: string;
  renderTypeId: number;
}

export interface OutputFormat {
  id: number;
  name: string;
  prompt: string;
  render_type_name?: string;
  render_type_id?: number;
}

export interface ModelPost {
  apiName: string;
  name: string;
  isVision: boolean;
  isImageGeneration: boolean;
  isThinking: boolean;
  apiVendorId: number;
  inputTokenCost?: number;
  outputTokenCost?: number;
  imageOutputTokenCost?: number;
  webSearchCost?: number;
}
/*
export interface Model {
  id: number;
  api_name: string;
  name: string;
  is_vision: boolean;
  is_image_generation: boolean;
  is_thinking: boolean;
  api_vendor_id: number;
  api_vendor_name?: string;
}
  */

// MCPTool definition is now imported from @snowgoose/ai-vendors
// export interface MCPTool {
//   id: number;
//   name: string;
//   path: string;
//   env_vars?: Record<string, string>;
// }

export interface RenderType {
  id: number;
  name: string;
}

export interface APIVendor {
  id: number;
  name: string;
}

// ThinkingBlock definition is now imported from @snowgoose/ai-vendors
// export interface ThinkingBlock { ... }

// RedactedThinkingBlock definition is now imported from @snowgoose/ai-vendors
// export interface RedactedThinkingBlock { ... }

// TextBlock definition is now imported from @snowgoose/ai-vendors
// export interface TextBlock { ... }

// ImageBlock definition is now imported from @snowgoose/ai-vendors
// export interface ImageBlock { ... }

// ContentBlock definition is now imported from @snowgoose/ai-vendors
// export type ContentBlock = ...;

// ChatResponse definition is now imported from @snowgoose/ai-vendors
// export interface ChatResponse { ... }

// Chat definition is now imported from @snowgoose/ai-vendors
// export interface Chat { ... }

export type FormProps = {
  updateMessage: (chat: Chat) => void;
  updateShowSpinner: (showSpinner: boolean) => void;
  responseHistory: ChatResponse[];
  resetChat: () => void;
  currentChat: Chat | undefined;
  personas: Persona[];
  models: Model[];
  outputFormats: OutputFormat[];
  mcpTools: MCPTool[];
  apiVendors: APIVendor[];
};

export type ChatWrapperProps = {
  userPersonas: Persona[];
  globalPersonas: Persona[];
  models: ModelWithVendorName[]; // Use the new type here
  outputFormats: OutputFormat[];
  mcpTools: MCPTool[];
  apiVendors: APIVendor[];
  user: User;
  // Add optional props for usage limit display/control
  periodUsage?: number | null;
  usageLimit?: number | null;
  isOverLimit?: boolean;
};
/*
export interface APIResonse {
  message: string;
}
*/

export interface UserSession {
  userId: string;
  //sessionId: string;
  email: string;
}

export interface APIUser {
  id: number;
  username: string;
  password: string;
  email: string;
  isAdmin: number;
}

export interface UserPost {
  username: string;
  //password: string;
  email: string;
  isAdmin: boolean;
}

export interface UserSettings {
  id: number;
  userId: number;
  appearanceMode: string;
  summaryModelPreferenceId: number;
  summaryModelPreference: string;
}

export interface ChatUserSession extends LocalChat, UserSession {}

export interface History {
  id: number;
  title: string;
  conversation: string;
}

export interface MCPToolPost {
  name: string;
  path: string;
}

// MCPTool definition is now imported from @snowgoose/ai-vendors
// export interface MCPTool {
//   id: number;
//   name: string;
//   path: string;
// }

export interface SettingsListSettings {
  id: number;
  title: string;
  detail?: string; // Made detail optional
}

export interface SettingListProps {
  settings: SettingsListSettings[];
  resourceType: ResourceType;
  hideEdit: boolean | undefined;
}

export interface UserUsageLimits {
  userPeriodUsage: number;
  planUsageLimit: number;
}
