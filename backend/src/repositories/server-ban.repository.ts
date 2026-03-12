import { prisma } from '../config/database';
import { ServerBan } from '@prisma/client';

export type BanDuration = '1w' | '2w' | '1m' | 'perm';

function resolveBannedUntil(duration: BanDuration): Date | null {
  const now = new Date();
  switch (duration) {
    case '1w':  { const d = new Date(now); d.setDate(d.getDate() + 7);   return d; }
    case '2w':  { const d = new Date(now); d.setDate(d.getDate() + 14);  return d; }
    case '1m':  { const d = new Date(now); d.setMonth(d.getMonth() + 1); return d; }
    case 'perm': return null;
  }
}

export class ServerBanRepository {

  async ban(
    userId: string,
    serverId: string,
    bannedById: string,
    duration: BanDuration
  ): Promise<ServerBan> {
    const bannedUntil = resolveBannedUntil(duration);
    return prisma.serverBan.upsert({
      where:  { userId_serverId: { userId, serverId } },
      update: { bannedById, bannedAt: new Date(), bannedUntil },
      create: { userId, serverId, bannedById, bannedUntil },
    });
  }

  async unban(userId: string, serverId: string): Promise<void> {
    await prisma.serverBan.delete({
      where: { userId_serverId: { userId, serverId } },
    }).catch(() => {
      // Ignore if record doesn't exist
    });
  }

  async findActiveBan(userId: string, serverId: string): Promise<ServerBan | null> {
    const ban = await prisma.serverBan.findUnique({
      where: { userId_serverId: { userId, serverId } },
    });
    if (!ban) return null;
    // Si le ban a expiré, on le supprime automatiquement
    if (ban.bannedUntil && ban.bannedUntil < new Date()) {
      await this.unban(userId, serverId);
      return null;
    }
    return ban;
  }

  async isBanned(userId: string, serverId: string): Promise<boolean> {
    return (await this.findActiveBan(userId, serverId)) !== null;
  }

  async findBannedUserIdsByServer(serverId: string): Promise<Set<string>> {
    const bans = await prisma.serverBan.findMany({
      where: { serverId },
      select: { userId: true, bannedUntil: true },
    });
    const now = new Date();
    const active = bans.filter((b) => !b.bannedUntil || b.bannedUntil > now);
    return new Set(active.map((b) => b.userId));
  }
}

export const serverBanRepository = new ServerBanRepository();