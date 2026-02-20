-- CreateEnum
CREATE TYPE "TokenStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "tokenNumber" INTEGER,
ADD COLUMN     "tokenStatus" "TokenStatus";
