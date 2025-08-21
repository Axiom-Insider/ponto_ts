/*
  Warnings:

  - You are about to drop the column `atestado` on the `Ausencia` table. All the data in the column will be lost.
  - You are about to drop the column `data_entrada` on the `Ausencia` table. All the data in the column will be lost.
  - You are about to drop the column `data_saida` on the `Ausencia` table. All the data in the column will be lost.
  - You are about to drop the column `ferias` on the `Ausencia` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Feriados` table. All the data in the column will be lost.
  - You are about to drop the column `dataSec` on the `Feriados` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Horarios` table. All the data in the column will be lost.
  - You are about to drop the column `hora_entrada` on the `Horarios` table. All the data in the column will be lost.
  - You are about to drop the column `hora_saida` on the `Horarios` table. All the data in the column will be lost.
  - The `saida` column on the `Horarios` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `dataInicio` to the `Ausencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoAusencia` to the `Ausencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataFim` to the `Feriados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataInicio` to the `Feriados` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `entrada` on the `Horarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `Ausencia` DROP COLUMN `atestado`,
    DROP COLUMN `data_entrada`,
    DROP COLUMN `data_saida`,
    DROP COLUMN `ferias`,
    ADD COLUMN `dataFim` DATETIME(3) NULL,
    ADD COLUMN `dataInicio` DATETIME(3) NOT NULL,
    ADD COLUMN `tipoAusencia` ENUM('FERIAS', 'ATESTADO', 'LICENCA', 'OUTRO') NOT NULL;

-- AlterTable
ALTER TABLE `Feriados` DROP COLUMN `data`,
    DROP COLUMN `dataSec`,
    ADD COLUMN `dataFim` DATETIME(3) NOT NULL,
    ADD COLUMN `dataInicio` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Horarios` DROP COLUMN `data`,
    DROP COLUMN `hora_entrada`,
    DROP COLUMN `hora_saida`,
    DROP COLUMN `entrada`,
    ADD COLUMN `entrada` DATETIME(3) NOT NULL,
    DROP COLUMN `saida`,
    ADD COLUMN `saida` DATETIME(3) NULL;
