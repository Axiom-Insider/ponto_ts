import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHorarioDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  data?: string;

  @IsString()
  @IsOptional()
  dataCriada?: string;

  @IsOptional()
  @IsString()
  entrada?: string;

  @IsOptional()
  @IsString()
  saida?: string;

  @IsNumber()
  id_funcionario: number;
}
