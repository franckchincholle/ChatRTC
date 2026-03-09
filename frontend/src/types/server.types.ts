export interface Server {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerMember {
  id: string;
  userId: string;
  serverId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface CreateServerDTO {
  name: string;
}

export interface UpdateServerDTO {
  name?: string;
}

export interface JoinServerDTO {
  inviteCode: string;
}

export interface InviteCodeResponse {
  code: string;
}