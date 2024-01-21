"use server"

import { ChatResponse, Chat} from "./model";
import { z } from 'zod';
import { sendChat } from "./api";
import { Trocchi } from "next/font/google";

const FormSchema = z.object({
    model: z.string(),
    persona: z.coerce.number(),
    outputFormat: z.coerce.number(),
    prompt: z.string(),
  });

export async function createChat(formData: FormData, responseHistory: ChatResponse[]) {
    const {model, persona, outputFormat, prompt} = FormSchema.parse({
        model: formData.get("model"),
        persona: formData.get("persona"),
        outputFormat: formData.get("outputFormat"),
        prompt: formData.get("prompt")
    })
    const userChatResponse: ChatResponse = {
        role: "user",
        content: prompt
    }

    responseHistory.push(userChatResponse)

    const chat: Chat = {
        responseHistory: responseHistory,
        model: model,
        persona: persona,
        outputFormat: outputFormat,
        prompt: prompt,
        imageData: null
    }
    console.log("createChat called. Sending Chat now...")
    try {
        const result = await sendChat(chat);
        responseHistory.push(result as ChatResponse)
    } catch(error) {
        console.error("Failed to sent Chat")
        throw error
    }
    return responseHistory
}

