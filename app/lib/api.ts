"use server"

import { unstable_noStore as noStore } from 'next/cache';
import { Chat, ChatResponse, PersonaPost } from './model';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const accessToken = process.env.GPTFLASK_API

export async function fetchGreeting() {
    noStore();

    try {
        const result = await fetch(`http://localhost:5001/api/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({greeting: "hi"}),
        });
        console.log("ALL GOOD!")
        const data = await result.json()
        console.log(data)
        return data

    } catch(error) {
        console.log("ERROR!!!")
        console.log(error)
    }
}

export async function fetchPersonas() {
    noStore();

    try {
        const result = await fetch(`http://localhost:5001/api/personas`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
        });
        const data = await result.json()
        return data
    } catch(error) {
        console.log("ERROR!!!")
        console.log(error)
    }
}

const FormSchema = z.object({
    name: z.string(),
    prompt: z.string()
});

export async function createPersona(formData: FormData) {
    noStore();

    const persona: PersonaPost = FormSchema.parse({
        name: formData.get("name"),
        prompt: formData.get("prompt")
    })

    try {
        const result = await fetch(`http://localhost:5001/api/personas`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(persona)
        });
        //const data = await result.json()
        //return data
        if (result.ok) {
            revalidatePath('/settings/personas');
            redirect('/settings/personas');
        }
    } catch(error) {
        console.log("ERROR!!!")
        console.log(error)
    }
}

export async function fetchModels() {
    noStore();

    try {
        const result = await fetch(`http://localhost:5001/api/models`);
        const data = await result.json()
        return data
    } catch(error) {
        console.log("ERROR!!!")
        console.log(error)
    }
}

export async function fetchOutputFormats() {
    noStore();

    try {
        const result = await fetch(`http://localhost:5001/api/output-formats`);
        const data = await result.json()
        return data
    } catch(error) {
        console.log("ERROR!!!")
        console.log(error)
    }
}

export async function sendChat(chat: Chat) {
    noStore();
    console.log ("Sending chat")
    try {
        const result = await fetch(`http://localhost:5001/api/chat`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chat),
        });
        if (!result.ok) {
            throw new Error('Unauthorized request: Please login again.');
        }
        const data = await result.json()
        console.log(data.choices[0].message)
        return data.choices[0].message as ChatResponse;
    } catch(error) {
        console.log("ERROR!!!")
        console.log(error)
        throw error
    }
}