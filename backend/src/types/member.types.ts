export interface MemberResponse {
  userId: string;
  serverId: string;
  username: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  isOnline: boolean;
}