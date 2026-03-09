export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';  

export interface Member {
  userId: string;      
  serverId: string;
  username: string;   
  role: MemberRole;
  isOnline: boolean;   
  joinedAt: string;
}

export interface UpdateMemberRoleDTO {
  role: MemberRole;
}