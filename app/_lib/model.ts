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

export interface Model {
  id: number;
  api_name: string;
  name: string;
  is_vision: boolean;
  is_image_generation: boolean;
}

export interface RenderType {
  id: number;
  name: string;
}

export interface ChatResponse {
  role: string;
  content: string;
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
}

export type FormProps = {
  updateMessage: (chat: Chat) => void;
  updateShowSpinner: (showSpinner: boolean) => void;
  responseHistory: ChatResponse[];
  resetChat: () => void;
  currentChat: Chat | undefined;
};

export interface APIResonse {
  message: string;
}

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

export interface ChatUserSession extends Chat, UserSession {}

export interface History {
  id: number;
  title: string;
  conversation: string;
}
