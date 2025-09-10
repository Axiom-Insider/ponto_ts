import { Module } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { DocumentoController } from './documento.controller';
import { HorarioModule } from 'src/horario/horario.module';
import { FuncionarioModule } from 'src/funcionario/funcionario.module';

@Module({
  controllers: [DocumentoController],
  providers: [DocumentoService],
  imports:[HorarioModule, FuncionarioModule]
})
export class DocumentoModule {}
