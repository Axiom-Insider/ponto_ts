import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { historico, IHistorico } from 'src/interfaces/historico';
import { IMessage } from 'src/interfaces/message.type';
import { IHorariosOne } from 'src/interfaces/horarios/horariosOne';
import { IHorariosAll } from 'src/interfaces/horarios/horariosAll';
import { toZonedTime } from "date-fns-tz"
import { HorarioDoDia } from 'src/interfaces/horarios/horarioDoDia';

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
      console.log(horarios);
      
      if (!horarios) {
        throw (`Entrada não foi registrada ainda`)
      }

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

  async getHorarioDia(): Promise<HorarioDoDia>{
    try {
      const date = new Date()
      const dataLocal = toZonedTime(date, this.fusoHorario)
      const inicioDoDia = new Date(dataLocal);
      inicioDoDia.setHours(0, 0, 0, 0);
      const fimDoDia = new Date(dataLocal);
      fimDoDia.setHours(23, 59, 59, 999);
      const horarios = await this.prisma.horarios.findMany({
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
              id:true
            }
          }
        }
      })
      
      const dados = await this.prisma.funcionarios.findMany({where:{adm:false}})
      
      if(!dados){
        return {message:"Sem nenhum registro na tabela funcionários", statusCode:HttpStatus.NOT_FOUND}
      }
      var funcionarios = []
      dados.forEach(element => {
        const {cargo, matricula, nome, id} = element
        funcionarios.push({
          nome, cargo, matricula, id, entrada:null, saida:null
        })
      });
      if(!horarios){
        return {funcionarios, statusCode:HttpStatus.FOUND}
      }

      horarios.forEach(horario => {
        const {id} = horario.funcionarios
        const entrada = `${horario.entrada.getHours()}:${horario.entrada.getMinutes() < 10? "0" + horario.entrada.getMinutes() : horario.entrada.getMinutes()}`
        const saida = horario.saida ? `${horario.saida.getHours()}:${horario.saida.getMinutes() < 10? "0" + horario.saida.getMinutes() : horario.saida.getMinutes()}` : null      
        funcionarios.forEach(funcionario => {
          if(funcionario.id === id){
            funcionario.entrada = entrada
            funcionario.saida = saida
          }
        });
      });

      return {funcionarios, statusCode: HttpStatus.FOUND}
    
    } catch (error) {
      throw new HttpException(`Erro ao encontrar dados de horarios: ${error}`, HttpStatus.CONFLICT)
    }
  }

  async editarHorarios(UpdateHorarioDto: UpdateHorarioDto){
    try {
    const dataCriada = new Date(UpdateHorarioDto.dataCriada)
    console.log(dataCriada.getDate, dataCriada.getMonth(), dataCriada.getFullYear());
    console.log(dataCriada, UpdateHorarioDto.dataCriada);
    const id_funcionario = UpdateHorarioDto.id_funcionario
    const dataLocal = toZonedTime(dataCriada, this.fusoHorario)
    const inicioDoDia = new Date(dataLocal.getMonth() + 1 + "/" + dataLocal.getDate() + "/" + dataLocal.getFullYear() + " 00:00:00");
    const fimDoDia = new Date(dataLocal.getMonth() + 1 + "/" + dataLocal.getDate() + "/" + dataLocal.getFullYear() + " 23:59:59");
    console.log(fimDoDia, inicioDoDia, id_funcionario);
    
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
    console.log(horarios);
    
    if(!horarios){
      return {message:"Sem registro de horario", statusCode:HttpStatus.NOT_FOUND}
    }
    
    const entrada = !UpdateHorarioDto.entrada ? horarios.entrada : new Date(UpdateHorarioDto.entrada)
    const saida = !UpdateHorarioDto.saida ? horarios.saida : new Date(UpdateHorarioDto.saida)

    await this.prisma.horarios.updateMany({where: {AND: [ { dataCriado: { gte: inicioDoDia, lt: fimDoDia, }, }, {id_funcionario: id_funcionario,},],}, data:{entrada, saida}})
      
    } catch (error) {
      throw new HttpException(`Erro ao encontrar dados de horarios: ${error}`, HttpStatus.CONFLICT)
    }
  }

}
