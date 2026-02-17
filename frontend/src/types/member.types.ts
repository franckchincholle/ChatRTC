// Member types

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';  // ← MAJUSCULES comme Prisma

export interface Member {
  userId: string;      // ← userId (clé étrangère)
  serverId: string;
  username: string;    // ← vient de user.username
  role: MemberRole;
  isOnline: boolean;   // ← renommé isConnected → isOnline (plus clair)
  joinedAt: string;
}

export interface UpdateMemberRoleDTO {
  role: MemberRole;
}