import { Module } from '@nestjs/common';
import { AusenciaService } from './ausencia.service';
import { AusenciaController } from './ausencia.controller';

@Module({
  controllers: [AusenciaController],
  providers: [AusenciaService],
  exports:[AusenciaService]
})
export class AusenciaModule {}
