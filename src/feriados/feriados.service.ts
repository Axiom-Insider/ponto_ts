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
      const dados = await this.prisma.feriados.create({ data: createFeriadoDto })

      return { message: 'Feriado criado com sucesso', statusCode: HttpStatus.CREATED}
    } catch (error) {
            throw new HttpException(`Erro ao registrar feriado ${error}`, HttpStatus.CONFLICT)
    }
  }

 async findAll(): Promise<IGenerico<Feriados[]>> {
    try {
      const dados = await this.prisma.feriados.findMany()

      if(!dados || dados.length === 0){
        throw ('Nenhum feriado encontrado')
       }
      return {dados, statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao consultar tabela feriados: ${error}`, HttpStatus.NOT_FOUND)
    }
  }

  async findOne(id: number): Promise<IGenerico<Feriados>> {
    try {
      const dados = await this.prisma.feriados.findUnique({where:{id}})
      if(!dados){
        throw ('Sem registro de dados')
      }
      return {dados, statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao consultar tabela feriados: ${error}`, HttpStatus.NOT_FOUND)
    }
  }

  update(id: number, updateFeriadoDto: UpdateFeriadoDto) {
    return `This action updates a #${id} feriado`;
  }

  async remove(id: number) {
    try {
      const dados = await this.prisma.feriados.delete({where:{id}})
      if(!dados){
        throw ('Sem registro de dados')
      }
      return {message:'Feriado removido com sucesso', statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao deletar feriado: ${error}`, HttpStatus.NOT_FOUND)
    }
  }
}
