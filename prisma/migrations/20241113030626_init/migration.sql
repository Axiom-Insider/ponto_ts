-- AlterTable
ALTER TABLE `horarios` MODIFY `data` VARCHAR(191) NOT NULL,
    MODIFY `hora_entrada` VARCHAR(191) NOT NULL,
    MODIFY `hora_saida` VARCHAR(191) NULL;
