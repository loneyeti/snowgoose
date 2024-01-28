"use client";

import ChatForm from "./chat-form";
import Conversation from "./conversation";
import React, { useState } from "react";
import { Chat, ChatResponse } from "../lib/model";
import Sidebar from "./sidebar";
import Detail from "./detail";
import UtilityIconRow from "./utility-icon-row";

export default function ChatWrapper() {
  const [response, setResponse] = useState<ChatResponse[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | undefined>();
  const [showConversationSpinner, setShowConversationSpinner] =
    useState<boolean>(false);

  const updateMessage = (chat: Chat | undefined) => {
    if (chat) {
      setResponse(chat.responseHistory);
      setCurrentChat(chat);
    } else {
      setResponse([]);
    }
  };

  const resetChat = () => {
    setResponse([]);
  };

  const updateShowSpinner = (showSpinner: boolean) => {
    setShowConversationSpinner(showSpinner);
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar>
        <div className="flex flex-col h-full justify-between">
          <ChatForm
            updateMessage={updateMessage}
            updateShowSpinner={updateShowSpinner}
            responseHistory={response}
            resetChat={resetChat}
          />
          <UtilityIconRow resetChat={resetChat} chat={currentChat} />
        </div>
      </Sidebar>
      <Detail>
        <Conversation chats={response} showSpinner={showConversationSpinner} />
      </Detail>
    </div>
  );
}
