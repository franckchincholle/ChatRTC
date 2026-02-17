import { Server as SocketIOServer, Socket as SocketIOSocket } from 'socket.io';
import { ChannelResponse } from './channel.types';

// ============================================
// EVENTS : Client → Serveur
// ============================================
export interface ListenEvents {
  'join_server': (data: { serverId: string }) => void;   // ← Ajoute
  'leave_server': (data: { serverId: string }) => void;
  // Channels
  'join_channel': (data: { serverId: string; channelId: string }) => void;
  'leave_channel': (data: { serverId: string; channelId: string }) => void;
  // Typing
  'user:typing': (data: { channelId: string; serverId: string }) => void;
  'user:stop_typing': (data: { channelId: string; serverId: string }) => void;
}

// ============================================
// EVENTS : Serveur → Client
// ============================================
export interface EmitEvents {
  // Messages
  'message:received': (message: any) => void;
  'message:deleted': (data: { messageId: string; channelId: string }) => void;

  // Channels
  'channel:created': (channel: ChannelResponse) => void;
  'channel:updated': (channel: ChannelResponse) => void;
  'channel:deleted': (data: { channelId: string; serverId: string }) => void;
  'channel:user_joined': (data: { userId: string; username: string; channelId: string }) => void;
  'channel:user_left': (data: { userId: string; username: string; channelId: string }) => void;

  // Servers
  'server:updated': (server: any) => void;
  'server:deleted': (data: { serverId: string }) => void;
  'server:member_joined': (data: { userId: string; serverId: string }) => void;
  'server:member_left': (data: { userId: string; serverId: string }) => void;

  // Users
  'user:typing': (data: {
    serverId: string;
    channelId: string;
    user: { userId: string; username: string };
  }) => void;
  'user:stop_typing': (data: {
    serverId: string;
    channelId: string;
    user: { userId: string; username: string };
  }) => void;
  'user:status_changed': (data: { userId: string; status: 'online' | 'offline' }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  username: string;
}

export type ServerIO = SocketIOServer<ListenEvents, EmitEvents, InterServerEvents, SocketData>;
export type AppSocket = SocketIOSocket<ListenEvents, EmitEvents, InterServerEvents, SocketData>;