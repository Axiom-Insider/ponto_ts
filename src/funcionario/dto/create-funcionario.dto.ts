import { IsBoolean, IsEmail, IsNotEmpty,  IsNumber, IsString, IsOptional } from "class-validator";

export class CreateFuncionarioDto {
    @IsNumber()
    @IsOptional()
    id?:number;

    @IsOptional()
    adm?:boolean;

    @IsOptional()
    primeiraEntrada?:boolean;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsNumber({}, {message:'Argumento matricula precisa ser um number'})
    matricula: number;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    nome:string;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    cargo:string;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    @IsOptional()
    senha:string;

}
