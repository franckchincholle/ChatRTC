// Member types
export type MemberRole = 'owner' | 'admin' | 'member';

export interface Member {
  id: string;
  username: string;
  role: MemberRole;
  isConnected: boolean;
  joinedAt: string;
}

export interface UpdateMemberRoleDTO {
  role: MemberRole;
}