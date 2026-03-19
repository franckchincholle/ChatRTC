export interface MessageAuthor {
  id: string;
  username: string;
}

export interface Reaction {
  messageId: string;
  userId: string;
  emoji: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
  author: MessageAuthor;
  reactions: Reaction[];  
}

export interface SendMessageDTO {
  content: string;
}