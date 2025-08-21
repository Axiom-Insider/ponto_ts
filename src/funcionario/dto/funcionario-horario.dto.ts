import {  IsNumber, IsString, IsOptional } from "class-validator";

export class FuncionarioHorarioDto {
    @IsNumber()
    id?:number;

    @IsNumber()
    matricula:number;

    @IsString()
    nome:string;

    @IsString()
    cargo:string;

    @IsString()
    hora_entrada:string;

    @IsOptional()
    hora_saida:string;
}
