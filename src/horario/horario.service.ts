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
import { stat } from 'fs';

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
      const entrada = new Date()
      const data = new Date()
      data.setHours(0, 0, 0, 0);
      const { id_funcionario } = createHorarioDto
      const inicioDoDia = new Date();
      inicioDoDia.setHours(0, 0, 0, 0);
      const fimDoDia = new Date();
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

      await this.prisma.horarios.create({ data: { dataCriado: data, entrada: entrada, id_funcionario } })
      return { message: 'Entrada registrada com sucesso', statusCode: HttpStatus.CREATED }
    } catch (error) {
      throw new HttpException(`Erro ao registrar entrada: ${error}`, HttpStatus.CONFLICT)
    }
  }

  async registrarSaida(createHorarioDto: CreateHorarioDto): Promise<IMessage> {
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

      await this.prisma.horarios.updateMany({
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
        }, data: { saida: dataLocal }
      })
      return { message: 'Saída registrada com sucesso', statusCode: HttpStatus.CREATED }
    } catch (error) {
      throw new HttpException(`Erro ao registrar entrada: ${error}`, HttpStatus.CONFLICT)
    }
  }

  async getHorarioDia(): Promise<HorarioDoDia> {
    try {
      const date = new Date()
      const dataLocal = toZonedTime(date, this.fusoHorario)
      const inicioDoDia = new Date();
      inicioDoDia.setHours(0, 0, 0, 0);
      const fimDoDia = new Date();
      fimDoDia.setHours(23, 59, 59, 999);
      console.log(inicioDoDia, fimDoDia);
      const horarios = await this.prisma.horarios.findMany({
        where: {
          dataCriado: {
            gte: inicioDoDia,
            lt: fimDoDia,
          },
        },
        select: {
          entrada: true, saida: true,
          funcionarios: {
            select: {
              id: true
            }
          }
        }
      })

      const dados = await this.prisma.funcionarios.findMany({ where: { adm: false } })

      if (!dados) {
        return { message: "Nenhum registro na tabela funcionários", statusCode: HttpStatus.NOT_FOUND }
      }
      var funcionarios = []
      dados.forEach(element => {
        const { cargo, matricula, nome, id } = element
        funcionarios.push({
          nome, cargo, matricula, id, entrada: null, saida: null
        })
      });
      if (!horarios) {
        return { funcionarios, statusCode: HttpStatus.FOUND }
      }

      horarios.forEach(horario => {
        const { id } = horario.funcionarios
        const entrada = `${horario.entrada.getHours() < 10 ? "0" + horario.entrada.getHours() : horario.entrada.getHours()}:${horario.entrada.getMinutes() < 10 ? "0" + horario.entrada.getMinutes() : horario.entrada.getMinutes()}`
        const saida = horario.saida ? `${horario.saida.getHours() < 10 ? "0" + horario.saida.getHours() : horario.saida.getHours()}:${horario.saida.getMinutes() < 10 ? "0" + horario.saida.getMinutes() : horario.saida.getMinutes()}` : null
        funcionarios.forEach(funcionario => {
          if (funcionario.id === id) {
            funcionario.entrada = entrada
            funcionario.saida = saida
          }
        });
      });

      return { funcionarios, statusCode: HttpStatus.FOUND }

    } catch (error) {
      throw new HttpException(`Erro ao encontrar dados de horarios: ${error}`, HttpStatus.CONFLICT)
    }
  }

  async editarHorarios(UpdateHorarioDto: UpdateHorarioDto) {
    try {
      const dataCriada = toZonedTime(new Date(UpdateHorarioDto.dataCriada), this.fusoHorario)
      dataCriada.setHours(1, 0, 0, 0);
      dataCriada.setDate(dataCriada.getDate() + 1)
      const data = new Date()
      const id_funcionario = UpdateHorarioDto.id_funcionario
      const dataLocal = toZonedTime(data, this.fusoHorario)
      const inicioDoDia = dataLocal;
      inicioDoDia.setHours(0, 0, 0, 0);
      const fimDoDia = dataLocal;
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

      if (!horarios) {
        if (!UpdateHorarioDto.entrada) {  throw ('Registre horario de entrada primeiro!') }
        await this.prisma.horarios.create({ data: { dataCriado: dataCriada, entrada: UpdateHorarioDto.entrada, id_funcionario } })
        return { message: "Horario atualizado com suceso", statusCode: HttpStatus.CREATED }
      }

      const entrada = !UpdateHorarioDto.entrada ? horarios.entrada : new Date(UpdateHorarioDto.entrada)
      const saida = !UpdateHorarioDto.saida ? horarios.saida : new Date(UpdateHorarioDto.saida)

      await this.prisma.horarios.updateMany({ where: { id: horarios.id }, data: { entrada, saida } })
      return { message: "Horario atualizado com sucesso", statusCode: HttpStatus.OK }
    } catch (error) {
      throw new HttpException(`Erro ao encontrar dados de horarios: ${error}`, HttpStatus.NOT_FOUND)
    }
  }


  async verificarHorarioDoFuncionario(id_funcionario: number): Promise<{ entrada: boolean, saida: boolean, message: string, statusCode: number }> {
    try {
      const date = new Date()
      const dataLocal = toZonedTime(date, this.fusoHorario)
      const inicioDoDia = new Date(dataLocal);
      inicioDoDia.setHours(0, 0, 0, 0);
      const fimDoDia = new Date(dataLocal);
      fimDoDia.setHours(23, 59, 59, 999);


      const horarios = await this.prisma.horarios.findMany({
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
        select: {
          entrada: true, saida: true,
        }
      })

      if (!horarios[0]) {
        return { entrada: false, saida: false, message: "Nenhum horario encontrado para o funcionário", statusCode: HttpStatus.NOT_FOUND }
      }
      const { saida } = horarios[0]


      return { entrada: true, saida: !saida ? false : true, message: "Horario encontrado com sucesso", statusCode: HttpStatus.FOUND }
    } catch (error) {
      throw new HttpException(`Erro ao encontrar dados de horarios: ${error}`, HttpStatus.NOT_FOUND)
    }
  }

  async getHistoricoFuncionario(id_funcionario: number, mes: number, ano: number): Promise<{historico:[] ,message:string, statusCode: number }> {
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
      console.log(inicioDoMes, fimDoMes, dataLocal);
      
      const dadosFuncionario = await this.prisma.funcionarios.findUnique({
        where: { id: id_funcionario }, include: {
          horarios: {
            where: {
              dataCriado: {
                gte: inicioDoMes,
                lt: fimDoMes,
              },
            },
          }
        }
      })
      
      if(!dadosFuncionario){
         throw ('Nenhum funcionário encontrado com o ID informado')
      }
      const { horarios } = dadosFuncionario
      if(!horarios[0]){
         throw ('Nenhum registro de horário encontrado para o funcionário no mês e ano informados')
      }

      

      return {historico:[] , message:"", statusCode: HttpStatus.FOUND }
    } catch (error) {
      throw new HttpException(`Erro ao encontrar dados de horarios: ${error}`, HttpStatus.NOT_FOUND)

    }


  }

}
