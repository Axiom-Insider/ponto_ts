import { HttpStatus } from '@nestjs/common';
   
    type entradaSaida = { 
        entrada: boolean,
        saida: boolean
    }
 
    interface IHorariosOne {
        entradaSaida:entradaSaida[], 
        statusCode: HttpStatus,
 }