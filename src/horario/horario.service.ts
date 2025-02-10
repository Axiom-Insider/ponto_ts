import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { historico, IHistorico } from 'src/interfaces/historico';
import { IMessage } from 'src/interfaces/message.type';
import { IHorariosOne } from 'src/interfaces/horariosOne';
import { IHorariosAll } from 'src/interfaces/horariosAll';


@Injectable()
export class HorarioService {


  constructor(private readonly prisma: PrismaService) { }

  dataHoje() {
    const data = new Date()
    const ano = data.getFullYear()
    const mes = (data.getMonth() + 1).toString().padStart(2, '0')
    const dia = data.getDate().toString().padStart(2, '0')
    return `${ano}-${mes}-${dia}`
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

  async createEntrada(createHorarioDto: CreateHorarioDto): Promise<IMessage> {
    try {
      const dataAtual = this.dataHoje()
      const horarios = await this.prisma.horarios.findFirst({ where: { AND: [{ data: dataAtual }, { id_funcionario: createHorarioDto.id_funcionario }] } })

      if (horarios) {
        throw (`Entrada já foi registrada no sistema, data:${dataAtual}`)
      }

      createHorarioDto.hora_entrada = this.horaHoje()
      createHorarioDto.data = dataAtual
      await this.prisma.horarios.create({ data: createHorarioDto })
      return { message: 'Entrada registrada com sucesso', statusCode: HttpStatus.CREATED }
    } catch (error) {
      throw new HttpException(`Erro ao registrar entrada: ${error}`, HttpStatus.CONFLICT)
    }
  }

  async createSaida(updateHorarioDto: UpdateHorarioDto): Promise<IMessage> {
    try {
      const dataAtual = this.dataHoje()

      const horarios = await this.prisma.horarios.findFirst({ where: { AND: [{ data: dataAtual }, { id_funcionario: updateHorarioDto.id_funcionario }, { saida: false }] } })

      if (!horarios) {
        throw (`Saída já foi registrada no sistema, data:${dataAtual}`)
      }

      updateHorarioDto.hora_saida = this.horaHoje()
      updateHorarioDto.saida = true
      await this.prisma.horarios.updateMany({ where: { AND: [{ data: dataAtual }, { id_funcionario: updateHorarioDto.id_funcionario }] }, data: { hora_saida: updateHorarioDto.hora_saida, saida: updateHorarioDto.saida } })
      return { message: 'Saída registrada com sucesso', statusCode: HttpStatus.CREATED }

    } catch (error) {
      throw new HttpException(`Erro ao registrar saída: ${error}`, HttpStatus.CONFLICT)
    }
  }

  async verificarOne(id_funcionario: number): Promise<IHorariosOne> {
    try {
      const data = this.dataHoje()

      var entradaSaida = await this.prisma.horarios.findMany({ where: { AND: [{ id_funcionario }, { data }] }, select: { entrada: true, saida: true } })

      if (entradaSaida.length <= 0) {
        entradaSaida[0].entrada = false
        entradaSaida[0].saida = false
        return {entradaSaida, statusCode: HttpStatus.OK }
      }

      return { entradaSaida, statusCode: HttpStatus.FOUND }
    } catch (error) {
      throw new HttpException(`Erro ao verificar dados de entrada e saída: ${error}`, HttpStatus.NOT_FOUND)
    }
  }

    async verificarAll(): Promise<IHorariosAll>{
      try {
        const dataHoje = this.dataHoje()
    
        const horario = await this.prisma.horarios.findMany({include:{funcionarios:true}, where:{data:dataHoje, entrada:true}})
        
        return{ horario, statusCode:HttpStatus.FOUND}        
      } catch (error) {
        throw new HttpException(`Erro ao verificar dados de entrada e saída: ${error}`, HttpStatus.NOT_FOUND)
      }
    }

 

  async historico(id_funcionario: number, mes: string, ano: string): Promise<IHistorico> {
    try {

      const historico: historico[] = []
      const quantidadeDia = new Date(+ano, +mes, 0).getDate();
      const nomeMes = this.nomeMes(quantidadeDia)
      const horarios = await this.prisma.horarios.findMany({ where: { id_funcionario, data: { startsWith: `${ano}-${mes}` } }, orderBy: { dataCriado: 'asc' } })

      historico.push({
        quantidadeDia,
        nomeMes,
        ano
      })

      if (horarios.length <= 0) {
        throw (`Nenhum horário foi encontrado no sistema com essa data:${ano}-${mes}`)
      }
      for (let index = 1; index <= quantidadeDia; index++) {
        historico.push({
          id: null,
          dia: index,
          hora_entrada: null,
          hora_saida: null,
        })

      }
      for (const key in horarios) {
        const { hora_entrada, hora_saida, id, data } = horarios[key]
        var dia = +data.split('-')[2]
        historico[dia] = {
          id, dia, hora_entrada, hora_saida
        }

      }

      return { historico, statusCode: HttpStatus.FOUND }

    } catch (error) {
      throw new HttpException(`Erro ao ler horários: ${error}`, HttpStatus.NOT_FOUND)
    }
  }

  async updateEntrada(id_funcionario: number, mes: string, ano: string, dia: string, updateHorarioDto: UpdateHorarioDto): Promise<IMessage> {
    try {
      const data = `${ano}-${mes}-${dia}`
      const horario = await this.prisma.horarios.findMany({ where: { AND: [{ id_funcionario }, { data }] } })

      if (horario.length > 0) {
        const entrada = await this.prisma.horarios.updateMany({ where: { AND: [{ id_funcionario }, { data }] }, data: { hora_entrada: updateHorarioDto.hora_entrada, entrada: true } })

        if (entrada.count <= 0) {
          throw ('Erro ao alterar horario funcionário não existe')
        }
        return { message: 'Horário entrada alterado com sucesso', statusCode: HttpStatus.OK }
      }

      if (horario.length <= 0) {
        const createHorarioDto = {
          hora_entrada: updateHorarioDto.hora_entrada,
          data: data,
          id_funcionario: id_funcionario,
        }

        await this.prisma.horarios.create({ data: createHorarioDto })

        return { message: 'Horário alterado com sucesso', statusCode: HttpStatus.CREATED }
      }

      return { message: 'Horário alterado com sucesso', statusCode: HttpStatus.OK }
    } catch (error) {
      throw new HttpException(`Erro ao editar entrada: ${error}`, HttpStatus.NOT_FOUND)
    }
  }

  async updateSaida(id_funcionario: number, mes: string, ano: string, dia: string, updateHorarioDto: UpdateHorarioDto): Promise<IMessage> {
    try {
      const data = `${ano}-${mes}-${dia}`
      const horario = await this.prisma.horarios.findMany({ where: { AND: [{ id_funcionario }, { data }] } })

      if (horario.length > 0) {
        const saida = await this.prisma.horarios.updateMany({ where: { AND: [{ id_funcionario }, { data }] }, data: { hora_saida: updateHorarioDto.hora_saida, saida: true } })

        if (saida.count <= 0) {
          throw ('Erro ao alterar horario funcionário não existe')
        }
        return { message: 'Horário saída alterado com sucesso', statusCode: HttpStatus.OK }
      }
      if (horario.length <= 0) {
        throw 'Nenhum registro de entrada foi encontrada no sistema'
      }

      return { message: 'Sem registro de saída no sistema', statusCode: HttpStatus.NOT_FOUND }

    } catch (error) {
      throw new HttpException(`Erro ao editar saída: ${error}`, HttpStatus.NOT_FOUND)
    }
  }

  async removeEntrada(id: number): Promise<IMessage> {
    try {
      const found = await this.prisma.horarios.findUnique({ where: { id } })

      if (found) {
        const entrada = await this.prisma.horarios.delete({ where: { id } })
        if (entrada) {
          return { message: "Entrada removido com sucesso", statusCode: HttpStatus.OK }
        }
        if (!entrada) {
          throw ('Nenhum registro de entrada foi encontrado no sistema')
        }
      }

      throw ('Nenhuma entrada foi encontrada no sistema')
    } catch (error) {
      throw new HttpException(`Erro ao remover entrada: ${error}`, HttpStatus.NOT_FOUND)
    }
  }

async removeSaida(id: number): Promise<IMessage> {
  try {
    const found = await this.prisma.horarios.findUnique({ where: { id } })

    if (found) {
      const entrada = await this.prisma.horarios.update({ where: { id }, data:{hora_saida:null, saida:false}})
      if (entrada) {
        return { message: "Saída removido com sucesso", statusCode: HttpStatus.OK }
      }
      if (!entrada) {
        throw ('Nenhum registro de saída foi encontrado no sistema')
      }
    }

    throw ('Nenhuma saida foi encontrada no sistema')
  } catch (error) {
    throw new HttpException(`Erro ao remover saída: ${error}`, HttpStatus.NOT_FOUND)
  }
}


}
