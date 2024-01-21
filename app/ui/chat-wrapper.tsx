"use client";

import ChatForm from "./chat-form";
import Conversation from "./conversation";
import React, { useState } from "react";
import { ChatResponse } from "../lib/model";
import Sidebar from "./sidebar";
import Detail from "./detail";

export default function ChatWrapper() {
  const [response, setResponse] = useState<ChatResponse[]>([]);

  const updateMessage = (chats: ChatResponse[]) => {
    console.log("Setting message");
    setResponse(chats);
    console.log("message set");
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar>
        <ChatForm updateMessage={updateMessage} />
      </Sidebar>
      <Detail>
        <Conversation chats={response} />
      </Detail>
    </div>
  );
}
