import { Server as PrismaServer, ServerMember as PrismaServerMember } from '@prisma/client';

// Server types

// Types pour les params
export type Server = PrismaServer;
export type ServerMember = PrismaServerMember;

export interface ServerIdParams {
  id: string;
}

export interface ServerMemberParams {
  id: string;
  userId: string;
}

// export interface Server {
//   id: string;
//   name: string;
//   ownerId: string;
//   inviteCode?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface ServerMember {
//   serverId: string;
//   userId: string;
//   role: 'OWNER' | 'ADMIN' | 'MEMBER';
//   joinedAt: Date;
// }

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