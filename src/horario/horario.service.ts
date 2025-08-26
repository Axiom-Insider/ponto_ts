import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { historico, IHistorico } from 'src/interfaces/historico';
import { IMessage } from 'src/interfaces/message.type';
import { IHorariosOne } from 'src/interfaces/horariosOne';
import { IHorariosAll } from 'src/interfaces/horariosAll';
import { toZonedTime } from "date-fns-tz"
import { HorarioDoDia } from 'src/interfaces/horarioDoDia';

@Injectable()
export class HorarioService {
  private readonly fusoHorario: string;

  constructor(private readonly prisma: PrismaService) {
    this.fusoHorario = "America/Bahia"
  }

  horaHoje() {
    const data = new Date()
    const horas = data.getHours().toString().padStart(2, '0')
    const minutos = data.getMinutes().toString().padStart(2, '0')
    return `${horas}:${minutos}`
  }

  nomeMes(num: number) {
    const date = new Date()
    date.setMonth(num - 1)

    return date.toLocaleString('default', { month: 'long' })
  }

  nomeDia(ano: number, mes: number, dia: number) {
    const data = new Date(ano, mes - 1, dia)
    const nomeDia = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

    return nomeDia[data.getDay()]
  }

  async registrarEntrada(createHorarioDto: CreateHorarioDto): Promise<IMessage> {
    try {
      const data = new Date()
      const dataLocal = toZonedTime(data, this.fusoHorario)
      const { id_funcionario } = createHorarioDto
      const inicioDoDia = new Date(dataLocal);
      inicioDoDia.setHours(0, 0, 0, 0);
      const fimDoDia = new Date(dataLocal);
      fimDoDia.setHours(23, 59, 59, 999);
      const horarios = await this.prisma.horarios.findFirst({
        where: {
          AND: [
            {
              dataCriado: {
                gte: inicioDoDia,
                lt: fimDoDia,
              },
            },
            {
              id_funcionario: id_funcionario,
            },
          ],
        },
      });

      if (horarios) {
        throw (`Entrada já foi registrada no sistema`)
      }

      await this.prisma.horarios.create({ data: { dataCriado: dataLocal, entrada: dataLocal, id_funcionario } })
      return { message: 'Entrada registrada com sucesso', statusCode: HttpStatus.CREATED }
    } catch (error) {
      throw new HttpException(`Erro ao registrar entrada: ${error}`, HttpStatus.CONFLICT)
    }
  }

  async registrarSaida(createHorarioDto:CreateHorarioDto):Promise<IMessage>{
    try {
      const data = new Date()
      const dataLocal = toZonedTime(data, this.fusoHorario)
      const { id_funcionario } = createHorarioDto
      const inicioDoDia = new Date(dataLocal);
      inicioDoDia.setHours(0, 0, 0, 0);
      const fimDoDia = new Date(dataLocal);
      fimDoDia.setHours(23, 59, 59, 999);
      const horarios = await this.prisma.horarios.findFirst({
        where: {
          AND: [
            {
              dataCriado: {
                gte: inicioDoDia,
                lt: fimDoDia,
              },
            },
            {
              id_funcionario: id_funcionario,
            },
          ],
        },
      });

      if (horarios.saida) {
        throw (`Saida já foi registrada no sistema`)
      }

      await this.prisma.horarios.updateMany({where:{ AND:[
            {
              dataCriado: {
                gte: inicioDoDia,
                lt: fimDoDia,
              },
            },
            {
              id_funcionario: id_funcionario,
            },
          ],}, data: { saida:dataLocal} })
      return { message: 'Saída registrada com sucesso', statusCode: HttpStatus.CREATED }
    } catch (error) {
      throw new HttpException(`Erro ao registrar entrada: ${error}`, HttpStatus.CONFLICT)
    }
  }

  async getHorarioDia(): Promise<HorarioDoDia> {
    try {
      const date = new Date()
      const dataLocal = toZonedTime(date, this.fusoHorario)
      const inicioDoDia = new Date(dataLocal);
      inicioDoDia.setHours(0, 0, 0, 0);
      const fimDoDia = new Date(dataLocal);
      fimDoDia.setHours(23, 59, 59, 999);
      const dados = await this.prisma.horarios.findFirst({
        where: {
          dataCriado: {
            gte: inicioDoDia,
            lt: fimDoDia,
          },
        },
        select:{
          entrada:true, saida:true,
          funcionarios:{
            select:{
              nome:true, matricula:true, cargo:true, id:true
            }
          }
        }
      })
      if(!dados){
        return {funcionarios:null, entrada:null, saida:null, statusCode:HttpStatus.FOUND}
      }
      
      const funcionarios = dados.funcionarios
      console.log(dados);
      
      const entrada = `${dados.entrada.getHours()}:${dados.entrada.getMinutes() < 10? "0" + dados.entrada.getMinutes() : dados.entrada.getMinutes()}`
     
      const saida = dados.saida ? `${dados.saida.getHours()}:${dados.saida.getMinutes() < 10? "0" + dados.saida.getMinutes() : dados.saida.getMinutes()}` : null      
      
      return {funcionarios,  saida, entrada, statusCode: HttpStatus.FOUND}
    } catch (error) {
      throw new HttpException(`Erro ao encontrar dados de horarios: ${error}`, HttpStatus.CONFLICT)
    }
  }

}
