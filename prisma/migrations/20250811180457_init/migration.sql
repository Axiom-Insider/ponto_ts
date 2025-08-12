-- CreateTable
CREATE TABLE `Funcionarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adm` BOOLEAN NOT NULL DEFAULT false,
    `primeiraEntrada` BOOLEAN NOT NULL DEFAULT false,
    `matricula` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Funcionarios_matricula_key`(`matricula`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Horarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dataCriado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data` VARCHAR(191) NOT NULL,
    `entrada` BOOLEAN NOT NULL DEFAULT true,
    `saida` BOOLEAN NOT NULL DEFAULT false,
    `hora_entrada` VARCHAR(191) NOT NULL,
    `hora_saida` VARCHAR(191) NULL,
    `id_funcionario` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feriados` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `data` VARCHAR(191) NOT NULL,
    `dataSec` VARCHAR(191) NOT NULL,
    `nacional` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ausencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ferias` BOOLEAN NOT NULL,
    `atestado` BOOLEAN NOT NULL,
    `data_entrada` VARCHAR(191) NOT NULL,
    `data_saida` VARCHAR(191) NOT NULL,
    `id_funcionario` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Horarios` ADD CONSTRAINT `Horarios_id_funcionario_fkey` FOREIGN KEY (`id_funcionario`) REFERENCES `Funcionarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ausencia` ADD CONSTRAINT `Ausencia_id_funcionario_fkey` FOREIGN KEY (`id_funcionario`) REFERENCES `Funcionarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
