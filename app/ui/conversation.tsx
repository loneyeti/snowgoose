import { ChatResponse } from "../lib/model";
import parse from "html-react-parser";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";
import { SpinnerSize, Spinner } from "./spinner";

interface ConversationProps {
  chats: ChatResponse[];
}

export default function Conversation({ chats }: ConversationProps) {
  return (
    <div>
      <div className="prose">
        {chats && chats.length > 0 ? (
          chats.map((chat: ChatResponse, index) => (
            <div key={index}>
              <Markdown rehypePlugins={[rehypeRaw]}>
                {DOMPurify.sanitize(chat.content)}
              </Markdown>
            </div>
            //<div className="prose prose-slate">{parse(chat.content)}</div>
          ))
        ) : (
          <p>&nbsp;</p>
        )}
      </div>
      <Spinner spinnerSize={SpinnerSize.sm} />
    </div>
  );
}
