import { Message } from './message.types';
import { Member } from './member.types';
import { Channel } from './channel.types';

export interface TypingUser {
  userId: string;
  username: string;
}

export interface SocketMessage {
  event: string;
  data: unknown;
}

export interface NewMessageEvent {
  message: Message;
}

export interface MessageDeletedEvent {
  messageId: string;
  channelId: string;
}

export interface UserJoinedEvent {
  serverId: string;
  user: Member;
}

export interface UserLeftEvent {
  serverId: string;
  userId: string;
}

export interface UserTypingEvent {
  serverId: string;
  channelId: string;
  user: TypingUser;
}

export interface UserStopTypingEvent {
  serverId: string;
  channelId: string;
  userId: string;
}

export interface ChannelCreatedEvent {
  serverId: string;
  channel: Channel;
}

export interface ChannelUpdatedEvent {
  channelId: string;
  channel: Channel;
}

export interface ChannelDeletedEvent {
  channelId: string;
  serverId: string;
}

export interface MemberRoleUpdatedEvent {
  serverId: string;
  userId: string;
  role: string;
}