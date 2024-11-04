/*
  Warnings:

  - You are about to drop the column `firtLog` on the `funcionarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `funcionarios` DROP COLUMN `firtLog`,
    ADD COLUMN `primeiraEntrada` BOOLEAN NOT NULL DEFAULT false;
