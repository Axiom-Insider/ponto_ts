import { TipoAusencia } from "@prisma/client";
import { IsDateString, IsEnum, IsNumber, IsOptional } from "class-validator";


export class CreateAusenciaDto {
    
    @IsOptional()
    @IsNumber()
    id:number;

    @IsEnum(TipoAusencia)
    tipoAusencia:TipoAusencia;

    @IsDateString()
    dataInicio: string;

    @IsOptional()
    @IsDateString()
    dataFim?: string;

    @IsNumber()
    id_funcionario: number;
}
