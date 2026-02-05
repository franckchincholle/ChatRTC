// Socket.IO Event Names

export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Client → Server events
  JOIN_SERVER: 'join_server',
  LEAVE_SERVER: 'leave_server',
  JOIN_CHANNEL: 'join_channel',
  LEAVE_CHANNEL: 'leave_channel',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',

  // Server → Client events
  NEW_MESSAGE: 'new_message',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED: 'message_deleted',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  USER_TYPING: 'user_typing',
  USER_STOP_TYPING: 'user_stop_typing',
  CHANNEL_CREATED: 'channel_created',
  CHANNEL_UPDATED: 'channel_updated',
  CHANNEL_DELETED: 'channel_deleted',
  MEMBER_ROLE_UPDATED: 'member_role_updated',
  SERVER_UPDATED: 'server_updated',
  SERVER_DELETED: 'server_deleted',
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];