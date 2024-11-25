/*
  Warnings:

  - You are about to alter the column `hora_entrada` on the `horarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `hora_saida` on the `horarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `horarios` MODIFY `hora_entrada` DATETIME(3) NOT NULL,
    MODIFY `hora_saida` DATETIME(3) NULL;
