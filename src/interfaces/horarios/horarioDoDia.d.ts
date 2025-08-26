import { HttpStatus } from "@nestjs/common";


  type response = {
    entrada: string;
    saida: string | null;
    nome: string;
    matricula: number;
    cargo: string;
    id: number;
  }

interface HorarioDoDia {
  message?:string;
  funcionarios?:response[];
  statusCode: HttpStatus;
}