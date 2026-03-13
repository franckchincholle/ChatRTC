export interface MemberResponse {
  userId: string;
  serverId: string;
  username: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  isOnline: boolean;
  isBanned: boolean;
}

export type BanDuration = '1w' | '2w' | '1m' | 'perm';