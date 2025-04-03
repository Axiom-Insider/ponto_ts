import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFeriadoDto } from './dto/create-feriado.dto';
import { UpdateFeriadoDto } from './dto/update-feriado.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { IMessage } from 'src/interfaces/message.type';
import { IGenerico } from 'src/interfaces/dados';
import { Feriados } from 'src/interfaces/feriados';

@Injectable()
export class FeriadosService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createFeriadoDto: CreateFeriadoDto): Promise<IMessage> {
    try {
      await this.prisma.feriados.create({ data: createFeriadoDto })
      return { message: 'Feriado criado com sucesso', statusCode: HttpStatus.CREATED}
    } catch (error) {
            throw new HttpException(`Erro ao registrar feriado ${error.message}`, HttpStatus.CONFLICT)
    }
  }

 async findAll(): Promise<IGenerico<Feriados[]>> {
    try {
      const dados = await this.prisma.feriados.findMany()

      if(!dados || dados.length === 0){
        throw new HttpException('Nenhum feriado encontrado', HttpStatus.NOT_FOUND)
       }
      return {dados, statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao consultar tabela feriados: ${error.message}`, HttpStatus.NOT_FOUND)
    }
  }

  async findOne(id: number): Promise<IGenerico<Feriados>> {
    try {
      const dados = await this.prisma.feriados.findUnique({where:{id}})
      if(!dados){
        throw new HttpException('Sem registro de dados', HttpStatus.NOT_FOUND)
      }
      return {dados, statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao consultar tabela feriados: ${error.message}`, HttpStatus.NOT_FOUND)
    }
  }

  async update(id: number, updateFeriadoDto: UpdateFeriadoDto) {
    try {
      await this.prisma.feriados.update({
        where: { id },
        data: updateFeriadoDto,
      });
      return { message: 'Feriado atualizado com sucesso', statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(`Erro ao atualizar feriado: ${error.message}`, HttpStatus.CONFLICT);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.feriados.delete({where:{id}})
      return {message:'Feriado removido com sucesso', statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao deletar feriado: ${error.message}`, HttpStatus.NOT_FOUND)
    }
  }
}
