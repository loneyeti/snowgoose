import { Model, User } from "@prisma/client";
import { ResourceType } from "../_ui/settings/buttons";

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
  //owner_id: number;
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

export interface MCPTool {
  id: number;
  name: string;
  path: string;
  env_vars?: Record<string, string>;
}

export interface RenderType {
  id: number;
  name: string;
}

export interface APIVendor {
  id: number;
  name: string;
}

// Interface for Anthropic thinking blocks
export interface ThinkingBlock {
  type: "thinking";
  thinking: string;
  signature: string;
}

export interface RedactedThinkingBlock {
  type: "redacted_thinking";
  data: string;
}

export interface TextBlock {
  type: "text";
  text: string;
}

export interface ImageBlock {
  type: "image";
  url: string;
}

export type ContentBlock =
  | ThinkingBlock
  | RedactedThinkingBlock
  | TextBlock
  | ImageBlock;

// Content of a chat response can either be plain text or an Anthropic ContentBlock
export interface ChatResponse {
  role: string;
  content: string | ContentBlock[];
}

export interface Chat {
  responseHistory: ChatResponse[];
  personaId: number;
  outputFormatId: number;
  mcpToolId?: number;
  renderTypeName: string;
  imageData: string | null;
  model: string;
  modelId: number;
  prompt: string;
  imageURL: string | null;
  maxTokens: number | null;
  budgetTokens: number | null;
  personaPrompt?: string;
}

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
  models: Model[];
  outputFormats: OutputFormat[];
  mcpTools: MCPTool[];
  apiVendors: APIVendor[];
  user: User;
};
/*
export interface APIResonse {
  message: string;
}
*/

export interface UserSession {
  userId: string;
  sessionId: string;
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
  password: string;
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

export interface ChatUserSession extends Chat, UserSession {}

export interface History {
  id: number;
  title: string;
  conversation: string;
}

export interface MCPToolPost {
  name: string;
  path: string;
}

export interface MCPTool {
  id: number;
  name: string;
  path: string;
}

export interface SettingsListSettings {
  id: number;
  title: string;
  detail: string;
}

export interface SettingListProps {
  settings: SettingsListSettings[];
  resourceType: ResourceType;
  hideEdit: boolean | undefined;
}
