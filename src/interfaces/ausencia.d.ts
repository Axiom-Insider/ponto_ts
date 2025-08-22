import { TipoAusencia } from "@prisma/client";

 export type Ausencia = { 
    id: number;
    id_funcionario:number;
    dataInicio: date;
    dataFim:Date;
    tipoAusencia:TipoAusencia;
}