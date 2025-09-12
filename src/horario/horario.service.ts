import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { historico, IHistorico } from 'src/interfaces/historico';
import { IMessage } from 'src/interfaces/message.type';
import { IHorariosOne } from 'src/interfaces/horarios/horariosOne';
import { IHorariosAll } from 'src/interfaces/horarios/horariosAll';
import { toZonedTime } from 'date-fns-tz';
import { HorarioDoDia } from 'src/interfaces/horarios/horarioDoDia';
import { stat } from 'fs';
import { AusenciaService } from 'src/ausencia/ausencia.service';
import { FeriadosService } from 'src/feriados/feriados.service';

@Injectable()
export class HorarioService {
  private readonly fusoHorario: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ausencias: AusenciaService,
    private readonly feriados: FeriadosService,
  ) {
    this.fusoHorario = 'America/Bahia';
  }

  horaHoje() {
    const data = new Date();
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  nomeMes(num: number) {
    const date = new Date();
    date.setMonth(num - 1);

    return date.toLocaleString('default', { month: 'long' });
  }

  nomeDia(ano: number, mes: number, dia: number) {
    const data = new Date(ano, mes - 1, dia);
    const nomeDia = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];

    return nomeDia[data.getDay()];
  }

  async registrarEntrada(
    createHorarioDto: CreateHorarioDto,
  ): Promise<IMessage> {
    try {
      const { id_funcionario } = createHorarioDto;
      const date = new Date();
      const dataCriado = new Date().toISOString().split('T')[0];
      const entrada = `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;

      const horarios = await this.prisma.horarios.findFirst({
        where: { dataCriado, id_funcionario },
      });

      if (horarios) {
        throw `Entrada já foi registrada no sistema`;
      }

      await this.prisma.horarios.create({
        data: { dataCriado, entrada, id_funcionario },
      });
      return {
        message: 'Entrada registrada com sucesso',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao registrar entrada: ${error}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async registrarSaida(createHorarioDto: CreateHorarioDto): Promise<IMessage> {
    try {
      const { id_funcionario } = createHorarioDto;
      const date = new Date();
      const dataCriado = new Date().toISOString().split('T')[0];
      const saida = `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
      const horarios = await this.prisma.horarios.findFirst({
        where: { dataCriado, id_funcionario },
      });

      if (!horarios) {
        throw `Entrada não foi registrada ainda`;
      }

      if (horarios.saida) {
        throw `Saida já foi registrada no sistema`;
      }

      await this.prisma.horarios.updateMany({
        where: { id_funcionario, dataCriado },
        data: { saida },
      });
      return {
        message: 'Saída registrada com sucesso',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao registrar entrada: ${error}`,
        HttpStatus.CONFLICT,
      );
    }
  }
  async getHorarioDia(): Promise<HorarioDoDia> {
    try {
      const dataCriado = new Date().toISOString().split('T')[0];
      const horarios = await this.prisma.horarios.findMany({
        where: {
          dataCriado,
        },
        select: {
          entrada: true,
          saida: true,
          funcionarios: {
            select: {
              id: true,
            },
          },
        },
      });

      const dados = await this.prisma.funcionarios.findMany({
        where: { adm: false },
      });

      if (!dados) {
        return {
          message: 'Nenhum registro na tabela funcionários',
          statusCode: HttpStatus.NOT_FOUND,
        };
      }
      var funcionarios = [];
      dados.forEach((element) => {
        const { cargo, matricula, nome, id } = element;
        funcionarios.push({
          nome,
          cargo,
          matricula,
          id,
          entrada: null,
          saida: null,
        });
      });

      if (!horarios) {
        return { funcionarios, statusCode: HttpStatus.OK };
      }

      horarios.forEach((horario) => {
        funcionarios.forEach((funcionario) => {
          if (funcionario.id === horario.funcionarios.id) {
            funcionario.entrada = horario.entrada;
            funcionario.saida = horario.saida;
          }
        });
      });
      return { funcionarios, statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(
        `Erro ao encontrar dados de horarios: ${error}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async editarHorarios(updateHorarioDto: UpdateHorarioDto) {
    try {
      const { id_funcionario } = updateHorarioDto;
      const date = new Date(updateHorarioDto.dataCriado);
      const dataCriado = date.toISOString().split('T')[0];

      const horarios = await this.prisma.horarios.findFirst({
        where: { dataCriado },
      });

      if (!horarios) {
        if (!updateHorarioDto.entrada) {
          throw 'Registre horario de entrada primeiro!';
        }
        const entradaTemp = new Date(updateHorarioDto.entrada);
        const entrada = `${entradaTemp.getHours() < 10 ? '0' + entradaTemp.getHours() : entradaTemp.getHours()}:${entradaTemp.getMinutes() < 10 ? '0' + entradaTemp.getMinutes() : entradaTemp.getMinutes()}`;
        await this.prisma.horarios.create({
          data: { dataCriado, entrada: entrada, id_funcionario },
        });
        return {
          message: 'Horario atualizado com suceso',
          statusCode: HttpStatus.CREATED,
        };
      }

      const entradaTemp = new Date(updateHorarioDto.entrada);
      const saidaTemp = new Date(updateHorarioDto.saida);
      const entrada = !updateHorarioDto.entrada
        ? horarios.entrada
        : `${entradaTemp.getHours() < 10 ? '0' + entradaTemp.getHours() : entradaTemp.getHours()}:${entradaTemp.getMinutes() < 10 ? '0' + entradaTemp.getMinutes() : entradaTemp.getMinutes()}`;
      const saida = !updateHorarioDto.saida
        ? horarios.saida
        : `${saidaTemp.getHours() < 10 ? '0' + saidaTemp.getHours() : saidaTemp.getHours()}:${saidaTemp.getMinutes() < 10 ? '0' + saidaTemp.getMinutes() : saidaTemp.getMinutes()}`;
      console.log(entrada, saida, dataCriado);

      await this.prisma.horarios.updateMany({
        where: { id: horarios.id },
        data: { entrada, saida },
      });
      return {
        message: 'Horario atualizado com sucesso',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao encontrar dados de horarios: ${error}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async verificarHorarioDoFuncionario(
    id: number,
  ): Promise<{
    entrada: boolean;
    saida: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const date = new Date();
      const dataCriado = date.toISOString().split('T')[0];

      const horarios = await this.prisma.horarios.findMany({
        where: { AND: [{ dataCriado, id: id }] },
        select: {
          entrada: true,
          saida: true,
        },
      });

      if (!horarios[0]) {
        return {
          entrada: false,
          saida: false,
          message: 'Nenhum horario encontrado para o funcionário',
          statusCode: HttpStatus.OK,
        };
      }
      const { saida } = horarios[0];

      return {
        entrada: true,
        saida: !saida ? false : true,
        message: 'Horario encontrado com sucesso',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao encontrar dados de horarios: ${error}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getHistoricoFuncionario(
    id_funcionario: number,
    mes: number,
    ano: number,
  ): Promise<{ historico: {}; statusCode: number }> {
    try {
      const ausencias = await this.ausencias.findMesAno(
        id_funcionario,
        mes,
        ano,
      );
      const feriados = await this.feriados.findMesAno(mes, ano);
      const horarios = await this.prisma.horarios.findMany({
        where: { id_funcionario },
      });
      const qntDia = new Date(ano, mes, 0).getDate();
      const historico = [];

      for (let index = 1; index <= qntDia; index++) {
        historico.push({
          d: index,
          nomeDia: this.nomeDia(ano, mes, index),
          domingo: this.nomeDia(ano, mes, index) == 'Domingo' ? true : false,
          entrada: ':',
          saida: ':',
          ausencias: '',
          feriados: '',
        });
      }

      if (horarios) {
        historico.forEach((dadosHisotrico) => {
          horarios.forEach((dadosHorarios) => {
            const { dataCriado, entrada, saida, id } = dadosHorarios;
            const anoH = dataCriado.split('-')[0];
            const mesH = dataCriado.split('-')[1];
            if (ano === +anoH) {
              if (mes === +mesH) {
                const dia = dataCriado.split('-')[2];
                if (dadosHisotrico.d === +dia) {
                  if (dadosHisotrico.nomeDia) dadosHisotrico.id = id;
                  dadosHisotrico.entrada = entrada === null ? ':' : entrada;
                  dadosHisotrico.saida = saida === null ? ':' : saida;
                }
              }
            }
          });
        });
      }
      if (ausencias) {
        ausencias.forEach((element) => {
          const { dataInicio, dataFim, tipoAusencia } = element;
          const diaInicio = +dataInicio.split('-')[2];
          const diaFim = +dataFim.split('-')[2];
          var qnt = diaFim - diaInicio;
          if (qnt < 1) {
            historico.forEach((dadosHistorico) => {
              if (diaInicio === dadosHistorico.d) {
                dadosHistorico.entrada = '---------';
                dadosHistorico.saida = '---------';
                dadosHistorico.ausencias = tipoAusencia;
              }
            });
          } else {
            let novoDataInicio = diaInicio - 1;
            for (novoDataInicio; novoDataInicio < diaFim; novoDataInicio++) {
              historico[novoDataInicio].ausencias = tipoAusencia;
              historico[novoDataInicio].entrada = '---------';
              historico[novoDataInicio].saida = '---------';
            }
          }
        });
      }

      if (feriados) {
        feriados.forEach((dadosFeriados) => {
          const { dataInicio, dataFim, nome } = dadosFeriados;
          const diaInicio = +dataInicio.split('-')[2];
          const diaFim = +dataFim.split('-')[2];
          var qnt = diaFim - diaInicio;
          if (qnt < 1) {
            historico.forEach((dadosHistorico) => {
              if (diaInicio === dadosHistorico.d) {
                dadosHistorico.feriados = nome;
              }
            });
          } else {
            for (
              let novoDataInicio = diaInicio - 1;
              novoDataInicio < diaFim;
              novoDataInicio++
            ) {
              historico[novoDataInicio].feriados = nome;
            }
          }
        });
      }

      return { historico, statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(
        `Erro ao encontrar dados de horarios: ${error}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
