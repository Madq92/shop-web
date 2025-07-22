import { Button } from "@/components/ui/button";

export interface MessageDTO {
  content: string;
  author?: string;
  time?: string;
  messageId?: string;
  rootMessageId?: string;
  parentMessageId?: string;
  children?: MessageDTO[];
}

export default function Message({ message }: { message: MessageDTO }) {
  return (
    <div key={message.messageId}>
      <div>{message.content}</div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div>{message.time}</div>
        <div>{message.author}</div>
        <Button
          variant="link"
          size={"sm"}
          className={"text-sm text-gray-500"}
          onClick={() => {
            console.log("message", message);
          }}
        >
          评论
        </Button>
      </div>
      <div className="ml-2 border-l-2 pl-1">
        {message.children &&
          message.children.length > 0 &&
          message.children.map((child) => (
            <Message key={child.messageId} message={child} />
          ))}
      </div>
    </div>
  );
}
