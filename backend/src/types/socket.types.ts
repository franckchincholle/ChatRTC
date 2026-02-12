import { Server as SocketIOServer, Socket as SocketIOSocket } from 'socket.io';
import { ChannelResponse } from './channel.types';

export interface EmitEvents {
  "message:received": (message: any) => void;
  "server:member_joined": (data: { userId: string, serverId: string }) => void;
  "server:member_left": (data: { userId: string, serverId: string }) => void;
  "server:deleted": (data: { serverId: string }) => void;
  "channel:created": (channel: ChannelResponse) => void;
  "channel:updated": (channel: ChannelResponse) => void;
  "channel:deleted": (data: { channelId: string, serverId: string }) => void;
  "user:typing": (data: { userId: string, username?: string, channelId: string }) => void;
  "user:status_changed": (data: { userId: string, status: 'online' | 'offline' }) => void;
}

export interface ListenEvents {
  "message:send": (content: string, channelId: string) => void;
  "server:join_room": (serverId: string) => void;
  "user:typing": (data: { channelId: string, serverId: string }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
}

export type ServerIO = SocketIOServer<ListenEvents, EmitEvents, InterServerEvents, SocketData>;
export type AppSocket = SocketIOSocket<ListenEvents, EmitEvents, InterServerEvents, SocketData>;