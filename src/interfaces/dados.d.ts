import { HttpStatus } from '@nestjs/common';

interface IGenerico<T> {
  dados: T;
  statusCode: HttpStatus;
}