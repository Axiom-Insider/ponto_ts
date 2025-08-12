import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FuncionarioModule } from './funcionario/funcionario.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HorarioModule } from './horario/horario.module';
import { ConfigModule } from '@nestjs/config';
import { FeriadosService } from './feriados/feriados.service';
import { FeriadosController } from './feriados/feriados.controller';
import { FeriadosModule } from './feriados/feriados.module';
import { AusenciaModule } from './ausencia/ausencia.module';
import { DocumentoModule } from './documento/documento.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}), FuncionarioModule, PrismaModule, AuthModule, HorarioModule, FeriadosModule, AusenciaModule, DocumentoModule],
  controllers: [AppController, FeriadosController],
  providers: [AppService, FeriadosService],
})
export class AppModule {}
