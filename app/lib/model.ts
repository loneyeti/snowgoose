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
  updateMessage: (chats: ChatResponse[]) => void;
};

export interface APIResonse {
  message: string;
}
