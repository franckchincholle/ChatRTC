import { Server as SocketIOServer, Socket as SocketIOSocket } from 'socket.io';

export interface EmitEvents {
  "message:received": (message: any) => void;
  "server:member_joined": (data: { userId: string, serverId: string }) => void;
}

export interface ListenEvents {
  "message:send": (content: string, channelId: string) => void;
  "server:join_room": (serverId: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
}

export type ServerIO = SocketIOServer<ListenEvents, EmitEvents, InterServerEvents, SocketData>;
export type AppSocket = SocketIOSocket<ListenEvents, EmitEvents, InterServerEvents, SocketData>;