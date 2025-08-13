/*
  Warnings:

  - Added the required column `empresa` to the `Funcionarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Funcionarios` ADD COLUMN `empresa` VARCHAR(191) NOT NULL;
