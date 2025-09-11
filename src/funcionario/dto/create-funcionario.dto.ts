import { IsBoolean, IsEmail, IsNotEmpty,  IsNumber, IsString, IsOptional, Length, Matches } from "class-validator";

export class CreateFuncionarioDto {
    @IsNumber()
    @IsOptional()
    id?:number;

    @IsOptional()
    adm?:boolean;

    @IsOptional()
    primeiraEntrada?:boolean;

    @IsString()
    @Length(11, 11, { message: 'CPF deve ter 11 dígitos' })
    @Matches(/^[0-9]+$/, { message: 'CPF deve conter apenas números' })
    cpf:string;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento matricula precisa ser um number'})
    matricula: string;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    nome:string;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    cargo:string;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    empresa:string;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    turno:string;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    @IsOptional()
    senha:string;

}
