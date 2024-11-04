import { PartialType } from '@nestjs/mapped-types';
import { CreateFuncionarioDto } from './create-funcionario.dto';
import { IsOptional } from 'class-validator';

export class UpdateFuncionarioDto extends PartialType(CreateFuncionarioDto) {

    @IsOptional()
    primeiraEntrada?:boolean;
}
