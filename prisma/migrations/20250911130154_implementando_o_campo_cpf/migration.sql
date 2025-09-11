/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `Funcionarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `Funcionarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Funcionarios_matricula_key` ON `Funcionarios`;

-- AlterTable
ALTER TABLE `Funcionarios` ADD COLUMN `cpf` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Funcionarios_cpf_key` ON `Funcionarios`(`cpf`);
