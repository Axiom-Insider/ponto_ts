import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { historico, IHistorico } from 'src/interfaces/historico';
import { IMessage } from 'src/interfaces/message.type';
import { IHorariosOne } from 'src/interfaces/horariosOne';
import { IHorariosAll } from 'src/interfaces/horariosAll';
import { toZonedTime } from "date-fns-tz"

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
      const dataHoje = new Date()
      const {id_funcionario} = createHorarioDto
      const horarios = await this.prisma.horarios.findFirst({ where: { AND: [{dataCriado:dataHoje}, { id_funcionario}] } })
      
      if (horarios) {
        throw (`Entrada já foi registrada no sistema`)
      }

      const apenasHora = new Date()
      await this.prisma.horarios.create({data:{dataCriado:dataHoje, entrada:apenasHora, id_funcionario}})
      return { message: 'Entrada registrada com sucesso', statusCode: HttpStatus.CREATED }
    } catch (error) {
      throw new HttpException(`Erro ao registrar entrada: ${error}`, HttpStatus.CONFLICT)
    }
  }

  async getHorario():Promise<any>{
    try {
      const data = new Date()
      const apenasData = new Date(data.getFullYear(), data.getMonth(), data.getDate());
      const dados = await this.prisma.horarios.findFirst({where:{dataCriado:{ 
        gte:apenasData,
        lt: new Date(data.getTime() + 24 * 60 * 60 * 1000)
    }}})
      console.log(dados);
      console.log(`${dados.entrada.getHours()}:${dados.entrada.getMinutes()}`);
      console.log( dados.dataCriado.getDate(), dados.dataCriado.getMonth(), dados.dataCriado.getFullYear());
      
      return { message: 'Entrada registrada com sucesso', statusCode: HttpStatus.CREATED }
    } catch (error) {
      throw new HttpException(`Erro ao registrar entrada: ${error}`, HttpStatus.CONFLICT)
    }
  }

}
