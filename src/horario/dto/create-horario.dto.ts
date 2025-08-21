import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateHorarioDto {

    @IsOptional()
    @IsNumber()
    id:number;

    @IsString()
    @IsOptional()
    data:string;

    @IsOptional()
    @IsDate()
    entrada:Date;

    @IsOptional()
    @IsDate()
    saida:Date;

    @IsNumber()
    id_funcionario:number;

}
