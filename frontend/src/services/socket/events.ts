export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Client → Serveur
  JOIN_CHANNEL: 'join_channel',
  LEAVE_CHANNEL: 'leave_channel',
  TYPING: 'user:typing',
  STOP_TYPING: 'user:stop_typing',

  // Serveur → Client — Messages
  NEW_MESSAGE: 'message:received',
  MESSAGE_DELETED: 'message:deleted',

  // Serveur → Client — Channels
  CHANNEL_CREATED: 'channel:created',
  CHANNEL_UPDATED: 'channel:updated',
  CHANNEL_DELETED: 'channel:deleted',
  CHANNEL_USER_JOINED: 'channel:user_joined',
  CHANNEL_USER_LEFT: 'channel:user_left',

  // Serveur → Client — Servers
  JOIN_SERVER: 'join_server',
  LEAVE_SERVER: 'leave_server',
  SERVER_UPDATED: 'server:updated',
  SERVER_DELETED: 'server:deleted',
  SERVER_MEMBER_JOINED: 'server:member_joined',
  SERVER_MEMBER_LEFT: 'server:member_left',

  // Serveur → Client — Users
  USER_TYPING: 'user:typing',
  USER_STOP_TYPING: 'user:stop_typing',
  USER_STATUS_CHANGED: 'user:status_changed',

  // Serveur → Client — Members
  MEMBER_ROLE_UPDATED: 'member:role_updated',
  MEMBER_KICKED: 'member:kicked',
  MEMBER_BANNED: 'member:banned',
  MEMBER_UNBANNED: 'member:unbanned',

} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];