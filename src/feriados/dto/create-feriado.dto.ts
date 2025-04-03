import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateFeriadoDto {

    @IsOptional()
    @IsNumber()
    id:number;

    @IsString()
    nome:string;

    @IsString()
    data:string;

    @IsString()
    @IsOptional()
    dataSec:string;

    @IsBoolean()
    nacional:boolean;
}
