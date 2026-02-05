// Server types
export interface Server {
  id: string;
  name: string;
  ownerId: string;
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServerMember {
  serverId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface CreateServerDTO {
  name: string;
}

export interface JoinServerDTO {
  inviteCode: string;
}

export interface UpdateMemberRoleDTO {
  role: 'admin' | 'member';
}