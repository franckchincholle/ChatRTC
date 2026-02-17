// Message types

export interface MessageAuthor {
  id: string;
  username: string;
}

// ✅ Aligné avec ce que retourne le backend (MessageWithAuthor)
export interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  createdAt: string;
  author: MessageAuthor;  // le backend retourne { author: { id, username } }
}

export interface SendMessageDTO {
  content: string;
}