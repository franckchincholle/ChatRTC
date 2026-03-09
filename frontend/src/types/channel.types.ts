export interface Channel {
  id: string;
  name: string;
  serverId: string;
  createdAt: string;
}

export interface CreateChannelDTO {
  name: string;
}

export interface UpdateChannelDTO {
  name: string;
}