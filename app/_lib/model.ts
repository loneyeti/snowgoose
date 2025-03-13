export interface Persona {
  id: number;
  name: string;
  prompt: string;
  //owner_id: number | null;
}

export interface PersonaPost {
  name: string;
  prompt: string;
}

export interface OutputFormatPost {
  name: string;
  prompt: string;
  render_type_id: number;
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
  api_name: string;
  name: string;
  is_vision: boolean;
  is_image_generation: boolean;
  api_vendor_id: number;
}

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

export type ContentBlock = ThinkingBlock | RedactedThinkingBlock | TextBlock;

// Content of a chat response can either be plain text or an Anthropic ContentBlock
export interface ChatResponse {
  role: string;
  content: string | ContentBlock[];
}

export interface Chat {
  responseHistory: ChatResponse[];
  personaId: number;
  outputFormatId: number;
  renderTypeName: string;
  imageData: string | null;
  model: string;
  modelId: number;
  prompt: string;
  imageURL: string | null;
  maxTokens: number | null;
  budgetTokens: number | null;
}

export type FormProps = {
  updateMessage: (chat: Chat) => void;
  updateShowSpinner: (showSpinner: boolean) => void;
  responseHistory: ChatResponse[];
  resetChat: () => void;
  currentChat: Chat | undefined;
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

export interface UserSettings {
  id: number;
  user_id: number;
  appearance_mode: string;
  summary_model_preference_id: number;
  summary_model_preference: string;
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
