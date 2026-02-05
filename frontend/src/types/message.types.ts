// Message types
export interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  channelId: string;
  createdAt: string;
}

export interface SendMessageDTO {
  content: string;
}