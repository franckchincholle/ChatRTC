import { Server as PrismaServer, ServerMember as PrismaServerMember } from '@prisma/client';

export type Server = PrismaServer;
export type ServerMember = PrismaServerMember;

export interface ServerIdParams {
  id: string;
}

export interface ServerMemberParams {
  id: string;
  userId: string;
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