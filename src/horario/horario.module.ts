import { Module } from '@nestjs/common';
import { HorarioService } from './horario.service';
import { HorarioController } from './horario.controller';
import { AusenciaModule } from 'src/ausencia/ausencia.module';
import { FeriadosModule } from 'src/feriados/feriados.module';

@Module({
  controllers: [HorarioController],
  providers: [HorarioService],
  exports:[HorarioService],
  imports:[AusenciaModule, FeriadosModule]
})
export class HorarioModule {}
