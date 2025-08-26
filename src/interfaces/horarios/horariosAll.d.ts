import { HttpStatus } from "@nestjs/common";


    type funcionario = {
        id: number,
        adm: boolean,
        primeiraEntrada: boolean,
        matricula: number,
        nome: string,
        cargo: string,
        senha: string
    }

    interface IHorariosAll { 
        horario: {
            funcionarios: funcionario,
            id: number,
            dataCriado: Date,
            data: string,
            entrada: boolean,
            saida: boolean,
            hora_entrada: string,
            hora_saida: string,
            id_funcionario: number,

        }[],
        statusCode: HttpStatus
     }