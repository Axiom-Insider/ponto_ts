import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateHorarioDto {

    @IsOptional()
    @IsNumber()
    id:number;

    @IsString()
    @IsOptional()
    data:string;

    @IsOptional()
    @IsBoolean()
    entrada:boolean;

    @IsOptional()
    @IsBoolean()
    saida:boolean;

    @IsString()
    @IsOptional()
    hora_entrada:string;

    @IsOptional()
    @IsString()
    hora_saida:string;

    @IsNumber()
    id_funcionario:number;

}
