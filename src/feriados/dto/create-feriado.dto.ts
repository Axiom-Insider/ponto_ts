import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateFeriadoDto {

    @IsOptional()
    @IsNumber()
    id:number;

    @IsString()
    nome:string;

    @IsString()
    @IsDateString()
    dataInicio:string;

    @IsString()
    @IsOptional()
    @IsDateString()
    dataFim:string;

    @IsBoolean()
    nacional:boolean;
}
