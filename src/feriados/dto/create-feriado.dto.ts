import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateFeriadoDto {

    @IsOptional()
    @IsNumber()
    id:number;

    @IsString()
    nome:string;

    @IsString()
    @IsDate()
    dataInicio:Date;

    @IsString()
    @IsOptional()
    @IsDate()
    dataFim:Date;

    @IsBoolean()
    nacional:boolean;
}
