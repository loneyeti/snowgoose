export interface Persona {
  id: number;
  name: string;
  prompt: string;
  owner_id: number;
}

export interface PersonaPost {
  name: string;
  prompt: string;
}

export interface OutputFormat {
  id: number;
  name: string;
  prompt: string;
  owner_id: number;
}

export interface Model {
  name: string;
  title: string;
}

export interface ChatResponse {
  role: string;
  content: string;
}

export interface Chat {
  responseHistory: ChatResponse[];
  persona: number;
  outputFormat: number;
  imageData: ArrayBuffer | null;
  model: string;
  prompt: string;
}

export type FormProps = {
  updateMessage: (chat: Chat) => void;
  updateShowSpinner: (showSpinner: boolean) => void;
  responseHistory: ChatResponse[];
  resetChat: () => void;
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
  chat: string;
}
