// Socket.IO Event Names

export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Client → Server events
  JOIN_SERVER: 'server:member_joined',
  LEAVE_SERVER: 'server:member_left',
  JOIN_CHANNEL: 'join_channel',
  LEAVE_CHANNEL: 'leave_channel',
  TYPING: 'user:typing',
  STOP_TYPING: 'user:stop_typing',

  // Server → Client events
  NEW_MESSAGE: 'message:received',
  MESSAGE_UPDATED: 'message:updated',
  MESSAGE_DELETED: 'message:deleted',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  USER_TYPING: 'user_typing',
  USER_STOP_TYPING: 'user_stop_typing',
  CHANNEL_CREATED: 'channel:created',
  CHANNEL_UPDATED: 'channel:updated',
  CHANNEL_DELETED: 'channel:deleted',
  MEMBER_ROLE_UPDATED: 'member_role_updated',
  SERVER_UPDATED: 'server:updated',
  SERVER_DELETED: 'server:deleted',
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];