// Server types

// Types pour les params
export interface ServerIdParams {
  id: string;
}

export interface ServerMemberParams {
  id: string;
  userId: string;
}

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
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
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

export interface UpdateServerDTO {
  name?: string;
}