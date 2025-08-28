import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAusenciaDto } from './dto/create-ausencia.dto';
import { UpdateAusenciaDto } from './dto/update-ausencia.dto';
import { Ausencia } from "src/interfaces/ausencia";
import { PrismaService } from 'src/prisma/prisma.service';
import { IGenerico } from 'src/interfaces/dados';
import { IMessage } from 'src/interfaces/message.type';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class AusenciaService {
  private readonly fusoHorario: string

  constructor(private readonly prisma: PrismaService) {
    this.fusoHorario = "America/Bahia"
  }
/*
  async create(createAusenciaDto: CreateAusenciaDto): Promise<IMessage | HttpException>  {
      try {
        await this.prisma.ausencia.create({ data: createAusenciaDto })
        return { message: 'Ausência criada com sucesso', statusCode: HttpStatus.CREATED}
      } catch (error) {
        throw new HttpException(`Erro ao registrar ausência ${error.message}`, HttpStatus.CONFLICT)
      }
  }

  async findAll(): Promise<IGenerico<Ausencia[]> | HttpException> {
      try {
        const dados = await this.prisma.ausencia.findMany()
        return {dados, statusCode: HttpStatus.CREATED}
      } catch (error) {
        throw new HttpException(`Erro ao registrar ausência ${error.message}`, HttpStatus.CONFLICT)
      }
  }

  async findOne(id_funcionario: number):Promise<IGenerico<Ausencia[]> | HttpException> {
    try {
      const dados = await this.prisma.ausencia.findMany({ where: { id_funcionario } })
      return {dados, statusCode: HttpStatus.FOUND}
    } catch (error) {
      throw new HttpException(`Erro ao registrar ausência ${error.message}`, HttpStatus.CONFLICT)
    }
  }

  async findAusenciaMesAno(id_funcionario:number, mes:number, ano:number){
    try {
       const date = new Date()
            date.setDate(1)
            date.setMonth(mes - 1)
            date.setFullYear(ano)
            const dataLocal = toZonedTime(date, this.fusoHorario)
            const inicioDoMes = dataLocal;
            inicioDoMes.setHours(0, 0, 0, 0);
            const fimDoMes = new Date(dataLocal);
            fimDoMes.setHours(23, 59, 59, 999);
            fimDoMes.setDate(31)
            fimDoMes.setMonth(fimDoMes.getMonth() + 1)
            fimDoMes.setFullYear(fimDoMes.getFullYear())
            const dadosAusencia = await this.prisma.ausencia.findMany({
              where:{
                  id_funcionario,
                  dataInicio:{gte:inicioDoMes, lt:fimDoMes},
                  dataFim:{gte:inicioDoMes, lt:fimDoMes}
              }})

            return dadosAusencia
    } catch (error) {
      throw new HttpException(`Erro ao consultar a tabela ausência ${error.message}`, HttpStatus.CONFLICT)
    }
  }

  async update(id: number, updateAusenciaDto: UpdateAusenciaDto): Promise<IMessage | HttpException> {
    try {
      await this.prisma.ausencia.update({where: { id }, data: updateAusenciaDto})
      return { message: 'Ausência atualizada com sucesso', statusCode: HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao atualizar ausência ${error.message}`, HttpStatus.CONFLICT)
    }
  }

  async remove(id: number): Promise<IMessage | HttpException> {
      try {
        await this.prisma.ausencia.delete({where: { id }})
        return { message: 'Ausência deletada com sucesso', statusCode: HttpStatus.OK}
      } catch (error) {
        throw new HttpException(`Erro ao deletar ausência ${error.message}`, HttpStatus.CONFLICT)
      }
  }
*/
  }
