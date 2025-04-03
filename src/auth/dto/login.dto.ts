import { IsBoolean, IsEmail, IsNotEmpty,  IsNumber, IsString, IsOptional } from "class-validator";

export class LoginDto {

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsNumber({}, {message:'Argumento matricula precisa ser um number'})
    matricula: number;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    senha:string;

    @IsNotEmpty({message:'Campo vazio Invalido'})
    @IsString({message:'Argumento passado não é uma string'})
    @IsOptional()
    novaSenha?:string;

}
