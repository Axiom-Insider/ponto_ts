import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";


export class CreateAusenciaDto {
    
    @IsOptional()
    @IsNumber()
    id:number;

    @IsBoolean()
    ferias:boolean;

    @IsBoolean()
    atestado:boolean;

    @IsString()
    data_entrada:string;

    @IsString()
    @IsOptional()
    data_saida:string;

    @IsNumber()
    id_funcionario:number;
}
