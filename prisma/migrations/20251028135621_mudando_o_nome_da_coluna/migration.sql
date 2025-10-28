/*
  Warnings:

  - You are about to drop the column `dataCriado` on the `Horarios` table. All the data in the column will be lost.
  - Added the required column `dataCriada` to the `Horarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Horarios` DROP COLUMN `dataCriado`,
    ADD COLUMN `dataCriada` VARCHAR(191) NOT NULL;
