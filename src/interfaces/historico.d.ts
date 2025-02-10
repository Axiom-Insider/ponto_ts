import { HttpStatus } from '@nestjs/common';


    type historico = {
        quantidadeDia?: number,
        nomeMes?: string,
        ano?: string,
        id?: number,
        dia?: number,
        hora_entrada?: string,
        hora_saida?: string
    }

    interface IHistorico  {
        historico: historico[],
        statusCode: HttpStatus
    }