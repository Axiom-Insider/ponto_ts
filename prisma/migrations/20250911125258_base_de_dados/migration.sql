/*
  Warnings:

  - Added the required column `turno` to the `Funcionarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Funcionarios` ADD COLUMN `turno` VARCHAR(191) NOT NULL,
    MODIFY `matricula` VARCHAR(191) NOT NULL;
