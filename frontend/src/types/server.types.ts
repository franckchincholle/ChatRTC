// Server types
export interface Server {
  id: string;
  name: string;
  ownerId: string;
  inviteCode?: string;
  createdAt: string;
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
  inviteCode: string;
}