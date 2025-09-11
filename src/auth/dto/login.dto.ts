import { IsBoolean, IsEmail, IsNotEmpty,  IsNumber, IsString, IsOptional, Length, Matches } from "class-validator";

export class LoginDto {

    @IsString()
    @Length(11, 11, { message: 'CPF deve ter 11 dígitos' })
    @Matches(/^[0-9]+$/, { message: 'CPF deve conter apenas números' })
    cpf:string;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    senha:string;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    @IsOptional()
    novaSenha?:string;

}
