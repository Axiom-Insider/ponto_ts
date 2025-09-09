import { Module } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { DocumentoController } from './documento.controller';
import { HorarioModule } from 'src/horario/horario.module';

@Module({
  controllers: [DocumentoController],
  providers: [DocumentoService],
  imports:[HorarioModule]
})
export class DocumentoModule {}
