"use client";

import ChatForm from "./chat-form";
import Conversation from "./conversation";
import React, { useState, useEffect, Fragment } from "react";
import { Chat, ChatResponse, ChatUserSession } from "../_lib/model";
import Sidebar from "./sidebar";
import Detail from "./detail";
import UtilityIconRow from "./utility-icon-row";
import { Transition } from "@headlessui/react";
import { getHistory } from "../_lib/server_actions/history.actions";
import { ConversationHistory } from "@prisma/client";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import { getUserID } from "@/app/_lib/auth";

export default function ChatWrapper() {
  const [response, setResponse] = useState<ChatResponse[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | undefined>();
  const [isHistoryShowing, setIsHistoryShowing] = useState(false);
  const [showConversationSpinner, setShowConversationSpinner] =
    useState<boolean>(false);
  const [history, setHistroy] = useState<ConversationHistory[]>([]);
  const [imageURL, setImageURL] = useState("");
  const [renderTypeName, setRenderTypeName] = useState("");

  function populateHistory(history: ConversationHistory) {
    //console.log(history.conversation);
    const chat: ChatUserSession = JSON.parse(history.conversation);
    updateMessage(chat);
    setCurrentChat(chat);
    toggleHistory();
  }

  function toggleHistory() {
    setIsHistoryShowing((isHistroyShowing) => !isHistoryShowing);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching history");
        const userId = await getUserID();
        console.log(`UserID: ${userId}`);
        const historyData = await getHistory(userId ?? 0);
        if (historyData) {
          setHistroy(historyData);
        }
      } catch (error) {
        console.log("Error fetching history");
      }
    };
    fetchData();
  }, [isHistoryShowing]);

  const updateMessage = (chat: Chat | undefined) => {
    if (chat) {
      if (!chat.imageURL) {
        setResponse(chat.responseHistory);
      } else {
        setImageURL(chat.imageURL);
      }
      setCurrentChat(chat);
      setRenderTypeName(`${chat.renderTypeName}`);
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
            currentChat={currentChat}
          />
          <UtilityIconRow
            resetChat={resetChat}
            toggleHistory={toggleHistory}
            chat={currentChat}
          />
        </div>
      </Sidebar>
      <Detail>
        <Conversation
          chats={response}
          showSpinner={showConversationSpinner}
          imageURL={imageURL}
          renderTypeName={renderTypeName}
        />
      </Detail>
      <Transition
        as={Fragment}
        show={isHistoryShowing}
        enter="transform transition ease-in-out duration-500"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-500"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        <div className="sticky focus:scroll-auto right-0 top-0 w-1/2 border-l-2 bg-slate-100 p-6">
          <div className="p-2 border-b-2">
            <button onClick={toggleHistory}>
              <MaterialSymbol
                icon="arrow_right_alt"
                size={24}
                className="text-slate-500"
              />
            </button>
            <h1 className="text-xl">History</h1>
          </div>
          {history.map((h: ConversationHistory) => {
            return (
              <div
                key={h.id}
                className="w-full p-3 text-sm bg-slate-50 mt-3 rounded-md"
              >
                <button
                  className="text-left"
                  onClick={(e) => {
                    e.preventDefault;
                    populateHistory(h);
                  }}
                >
                  {h.title}
                </button>
              </div>
            );
          })}
        </div>
      </Transition>
    </div>
  );
}
