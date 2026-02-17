export interface CreateChannelData {
  name: string;
  serverId: string;
}

export interface UpdateChannelData {
  name: string;
}

export interface UpdateChannelInput {
  name?: string;
}

export interface ChannelResponse {
  id: string;
  name: string;
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
}