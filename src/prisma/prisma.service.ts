// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

  // Inicializa a conexão com o banco de dados quando o módulo é carregado
  async onModuleInit() {
    await this.$connect();
  }

  // Fecha a conexão com o banco de dados quando o módulo é destruído
  async onModuleDestroy() {
    await this.$disconnect();
  }
}