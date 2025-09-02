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

  async create(createAusenciaDto: CreateAusenciaDto): Promise<{}>  {
      try {
        const { id_funcionario, tipoAusencia } = createAusenciaDto
        const dataInicio = new Date(createAusenciaDto.dataInicio).toISOString().split("T")[0]
        const dataFim = new Date(createAusenciaDto.dataFim).toISOString().split("T")[0]

        await this.prisma.ausencia.create({ data:{dataInicio, dataFim, id_funcionario, tipoAusencia} })
        return { message: 'Ausência criada com sucesso', statusCode: HttpStatus.CREATED}
      } catch (error) {
        throw new HttpException(`Erro ao registrar ausência ${error.message}`, HttpStatus.CONFLICT)
      }
  }

  async findAll(): Promise<{}> {
      try {
        const dados = await this.prisma.ausencia.findMany()
        return {dados, statusCode: HttpStatus.CREATED}
      } catch (error) {
        throw new HttpException(`Erro ao registrar ausência ${error.message}`, HttpStatus.CONFLICT)
      }
  }

  async findOne(id_funcionario: number):Promise<{}> {
    try {
      const dadosAusencia = await this.prisma.ausencia.findMany({ where: { id_funcionario } })
      const ausencia = []
      for (let index = 0; index < dadosAusencia.length; index++) {
        const {dataInicio, dataFim, tipoAusencia} = dadosAusencia[index]
        const tempInicio = dataInicio.split("-")
        const tempFim = dataFim.split("-")
        ausencia.push({
          dataInicio:`${tempInicio[2]}/${tempInicio[1]}${tempInicio[0]}`,
          dataFIm:`${tempFim[2]}/${tempFim[1]}${tempFim[0]}`,
          tipoAusencia
        })
      }
      return {ausencia, statusCode: HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao registrar ausência ${error.message}`, HttpStatus.CONFLICT)
    }
  }

  async findAusenciaMesAno(id_funcionario:number, mes:number, ano:number){
    try {
       
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

  }
