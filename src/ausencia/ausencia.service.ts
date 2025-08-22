import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAusenciaDto } from './dto/create-ausencia.dto';
import { UpdateAusenciaDto } from './dto/update-ausencia.dto';
import { Ausencia } from "src/interfaces/ausencia";
import { PrismaService } from 'src/prisma/prisma.service';
import { IGenerico } from 'src/interfaces/dados';
import { IMessage } from 'src/interfaces/message.type';

@Injectable()
export class AusenciaService {

  constructor(private readonly prisma: PrismaService) {}

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
      return {dados,  message: 'Ausência criada com sucesso', statusCode: HttpStatus.CREATED}
    } catch (error) {
      throw new HttpException(`Erro ao registrar ausência ${error.message}`, HttpStatus.CONFLICT)
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
