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

  async registrarEntrada(createHorarioDto: CreateHorarioDto): Promise<IMessage> {
    try {
      const { id_funcionario } = createHorarioDto;
      const date = new Date();
      const dataCriada = new Date().toISOString().split('T')[0];
      const entrada = `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;

      const horarios = await this.prisma.horarios.findFirst({
        where: { dataCriada, id_funcionario },
      });

      if (horarios) {
        throw `Entrada já foi registrada no sistema`;
      }

      await this.prisma.horarios.create({
        data: { dataCriada, entrada, id_funcionario },
      });
      return {
        message: 'Entrada registrada com sucesso',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      throw new HttpException(`Erro ao registrar entrada: ${error}`, HttpStatus.CONFLICT);
    }
  }

  async registrarSaida(createHorarioDto: CreateHorarioDto): Promise<IMessage> {
    try {
      const { id_funcionario } = createHorarioDto;
      const date = new Date();
      const dataCriada = new Date().toISOString().split('T')[0];
      const saida = `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
      const horarios = await this.prisma.horarios.findFirst({
        where: { dataCriada, id_funcionario },
      });

      if (!horarios) {
        throw `Entrada não foi registrada ainda`;
      }

      if (horarios.saida) {
        throw `Saida já foi registrada no sistema`;
      }

      await this.prisma.horarios.updateMany({
        where: { id_funcionario, dataCriada },
        data: { saida },
      });
      return {
        message: 'Saída registrada com sucesso',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      throw new HttpException(`Erro ao registrar entrada: ${error}`, HttpStatus.CONFLICT);
    }
  }
  async getHorarioDia(): Promise<HorarioDoDia> {
    try {
      const dataCriada = new Date().toISOString().split('T')[0];
      const horarios = await this.prisma.horarios.findMany({
        where: {
          dataCriada,
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
      throw new HttpException(`Erro ao encontrar dados de horarios: ${error}`, HttpStatus.CONFLICT);
    }
  }

  async editarHorarios(updateHorarioDto: UpdateHorarioDto) {
    try {
      const { id_funcionario, dataCriada, entrada, saida } = updateHorarioDto;
      const horarios = await this.prisma.horarios.findMany({
        where: { AND: [{ dataCriada, id_funcionario }] },
      });

      if (!horarios[0]) {
        if (!entrada) {
          throw 'Registre horario de entrada primeiro!';
        }

        await this.prisma.horarios.create({
          data: { dataCriada, entrada, id_funcionario },
        });
        return {
          message: 'Horario atualizado com sucesso',
          statusCode: HttpStatus.CREATED,
        };
      }

      if (!entrada) {
        await this.prisma.horarios.updateMany({
          where: { id: horarios[0].id },
          data: { saida },
        });
      }

      await this.prisma.horarios.updateMany({
        where: { id: horarios[0].id },
        data: { entrada },
      });

      return {
        message: 'Horario atualizado com sucesso',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(`Erro ao editar horarios: ${error}`, HttpStatus.NOT_FOUND);
    }
  }

  async verificarAllFuncionarios() {
    try {
      const date = new Date();

      const horarios = await this.prisma.horarios.findMany({ where: {} });
    } catch (error) {}
  }

  async verificarHorarioDoFuncionario(id: number): Promise<{
    entrada: string | null;
    saida: string | null;
    message: string;
    statusCode: number;
  }> {
    try {
      const date = new Date();
      const dataCriada = date.toISOString().split('T')[0];

      const horarios = await this.prisma.horarios.findMany({
        where: { dataCriada, id_funcionario: id },
        select: {
          entrada: true,
          saida: true,
        },
      });

      if (!horarios[0]) {
        return {
          entrada: null,
          saida: null,
          message: 'Nenhum horario registrado para hoje',
          statusCode: HttpStatus.OK,
        };
      }

      const { saida, entrada } = horarios[0];

      return {
        entrada: !entrada ? null : entrada,
        saida: !saida ? null : saida,
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
      const ausencias = await this.ausencias.findMesAno(id_funcionario, mes, ano);
      const feriados = await this.feriados.findMesAno(mes, ano);
      const horarios = await this.prisma.horarios.findMany({
        where: { id_funcionario },
      });
      const qntDia = new Date(ano, mes, 0).getDate();
      const historico = [];

      for (let index = 1; index <= qntDia; index++) {
        historico.push({
          d: index,
          dia:
            this.nomeDia(ano, mes, index) === 'Domingo' ||
            this.nomeDia(ano, mes, index) === 'Sábado'
              ? ''
              : this.nomeDia(ano, mes, index),
          do: this.nomeDia(ano, mes, index) === 'Domingo' ? 'D O M I N G O' : '',
          sa: this.nomeDia(ano, mes, index) === 'Sábado' ? 'Sábado' : '',
          entrada: ':',
          saida: ':',
          ausencias: '',
          feriados: '',
        });
      }

      if (horarios) {
        historico.forEach((dadosHisotrico) => {
          horarios.forEach((dadosHorarios) => {
            const { dataCriada, entrada, saida, id } = dadosHorarios;
            const anoH = dataCriada.split('-')[0];
            const mesH = dataCriada.split('-')[1];
            if (ano === +anoH) {
              if (mes === +mesH) {
                const dia = dataCriada.split('-')[2];
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
              historico[novoDataInicio].saida = '----------';
            }
          }
        });
      }

      if (feriados) {
        feriados.forEach((dadosFeriados) => {
          const { dataInicio, dataFim, nome, tipoFeriado } = dadosFeriados;
          const diaInicio = +dataInicio.split('-')[2];
          const diaFim = +dataFim.split('-')[2];
          var qnt = diaFim - diaInicio;
          if (qnt < 1) {
            historico.forEach((dadosHistorico) => {
              if (diaInicio === dadosHistorico.d) {
                dadosHistorico.feriados = `${tipoFeriado} = ${nome}`;
                dadosHistorico.entrada = '---------';
                dadosHistorico.saida = '---------';
              }
            });
          } else {
            for (let novoDataInicio = diaInicio - 1; novoDataInicio < diaFim; novoDataInicio++) {
              historico[novoDataInicio].feriados = `${tipoFeriado} = ${nome}`;
              historico[novoDataInicio].entrada = '---------';
              historico[novoDataInicio].saida = '---------';
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

  //A ROTDA TA AQUI KRL
  async getHistoricoFuncionarioConfianca(
    id_funcionario: number,
    mes: number,
    ano: number,
  ): Promise<{ historico: {}; statusCode: number }> {
    try {
      const ausencias = await this.ausencias.findMesAno(id_funcionario, mes, ano);
      const feriados = await this.feriados.findMesAno(mes, ano);
      const horarios = await this.prisma.horarios.findMany({
        where: { id_funcionario },
      });
      const funcionario = await this.prisma.funcionarios.findUnique({
        where: { id: id_funcionario },
        select: { turno: true },
      });

      const qntDia = new Date(ano, mes, 0).getDate();
      const historico = [];

      for (let index = 1; index <= qntDia; index++) {
        historico.push({
          d: index,
          di:
            this.nomeDia(ano, mes, index) === 'Domingo' ||
            this.nomeDia(ano, mes, index) === 'Sábado'
              ? ''
              : this.nomeDia(ano, mes, index),
          do: this.nomeDia(ano, mes, index) === 'Domingo' ? 'Domingo' : '',
          sa: this.nomeDia(ano, mes, index) === 'Sábado' ? 'Sábado' : '',
          p_e: '--------',
          s_e: '--------',
          p_s: '--------',
          s_s: '--------',
          ausencias: '',
          feriados: '',
        });
      }

      if (horarios) {
        historico.forEach((dadosHisotrico) => {
          horarios.forEach((dadosHorarios) => {
            const { dataCriada, entrada, saida, id } = dadosHorarios;
            const anoH = dataCriada.split('-')[0];
            const mesH = dataCriada.split('-')[1];
            if (ano === +anoH) {
              if (mes === +mesH) {
                const dia = dataCriada.split('-')[2];
                if (dadosHisotrico.d === +dia) {
                  if (dadosHisotrico.nomeDia) dadosHisotrico.id = id;
                  if (dadosHisotrico.di != '') {
                    if (entrada != null) {
                      dadosHisotrico.p_e = entrada === null ? ':' : entrada;
                      dadosHisotrico.p_s = saida === null ? ':' : saida;
                      if (funcionario.turno == 'Matutino') {
                        var hora_entrada = 14;
                        var rando = Math.floor(Math.random() * 5) + 1;
                        dadosHisotrico.s_e = `${hora_entrada}:0${rando}`;
                        var hora_saida = 18;
                        dadosHisotrico.s_s = `${hora_saida}:0${rando + (Math.floor(Math.random() * 3) + 1)}`;
                      } else {
                        var hora_entrada = 8;
                        var rando = Math.floor(Math.random() * 6) + 1;
                        dadosHisotrico.s_e = `0${hora_entrada}:0${rando}`;
                        var hora_saida = 12;
                        dadosHisotrico.s_s = `${hora_saida}:0${rando + (Math.floor(Math.random() * 3) + 1)}`;
                      }
                    }
                  }
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
              historico[novoDataInicio].entrada = '- - - - - - - - ';
              historico[novoDataInicio].saida = '- - - - - - - - ';
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
                dadosHistorico.feriados = 'FERIADO = ' + nome;
                dadosHistorico.entrada = '---------';
                dadosHistorico.saida = '---------';
              }
            });
          } else {
            for (let novoDataInicio = diaInicio - 1; novoDataInicio < diaFim; novoDataInicio++) {
              historico[novoDataInicio].feriados = nome;
              historico[novoDataInicio].entrada = '---------';
              historico[novoDataInicio].saida = '---------';
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
