import { HttpStatus } from "@nestjs/common";

interface HorarioDoDia {
  entrada: string | null;
  saida: string | null;
  statusCode: HttpStatus;
}