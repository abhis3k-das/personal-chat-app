export type MessageStatus = "sent" | "delivered" | "seen";

export type MessageType = "text" | "miss_you" | "compliment";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  participants: string[];
  status: MessageStatus;
  type: MessageType;
  reactions?: Record<string, string>;
  isFavoriteBy?: string[];
  createdAt: any;
  seenAt?: any;
}