import { HttpStatus } from "@nestjs/common";

interface HorarioDoDia {
  funcionarios:{
    id:number,
    matricula:number,
    nome:string,
    cargo:string
  };
  entrada: string | null;
  saida: string | null;
  statusCode: HttpStatus;
}