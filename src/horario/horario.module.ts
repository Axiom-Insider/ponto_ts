import { Module } from '@nestjs/common';
import { HorarioService } from './horario.service';
import { HorarioController } from './horario.controller';
import { AusenciaService } from 'src/ausencia/ausencia.service';
import { FeriadosService } from 'src/feriados/feriados.service';

@Module({
  controllers: [HorarioController],
  providers: [HorarioService, AusenciaService, FeriadosService],
})
export class HorarioModule {}
