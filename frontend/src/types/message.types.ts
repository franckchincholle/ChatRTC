export interface MessageAuthor {
  id: string;
  username: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
  author: MessageAuthor;  
}

export interface SendMessageDTO {
  content: string;
}