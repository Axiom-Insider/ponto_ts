/*
  Warnings:

  - You are about to alter the column `turno` on the `Funcionarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Funcionarios` MODIFY `turno` ENUM('Matutino', 'Vespertino') NOT NULL;
