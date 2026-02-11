-- DropForeignKey
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_serverId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;
