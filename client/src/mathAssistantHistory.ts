import type { Message as ChatMessage } from "@/components/AIChatBox";

export type SavedAssistantMessage = {
  role: "user" | "assistant";
  content: string;
  imageKey: string | null;
  imageUrl?: string;
};

export function mapSavedAssistantMessages(messages: SavedAssistantMessage[]): ChatMessage[] {
  return messages.map(message => ({
    role: message.role,
    content: message.content,
    imageUrl: message.imageUrl,
  }));
}
