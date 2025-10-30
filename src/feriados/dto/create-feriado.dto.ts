import { TipoFeriado } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFeriadoDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsString()
  nome: string;

  @IsEnum(TipoFeriado)
  tipoFeriado: TipoFeriado;

  @IsString()
  @IsDateString()
  dataInicio: string;

  @IsString()
  @IsOptional()
  @IsDateString()
  dataFim: string;

  @IsBoolean()
  nacional: boolean;
}
