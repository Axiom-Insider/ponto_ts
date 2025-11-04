import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFeriadoDto } from './dto/create-feriado.dto';
import { UpdateFeriadoDto } from './dto/update-feriado.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { IMessage } from 'src/interfaces/message.type';
import { IGenerico } from 'src/interfaces/dados';
import { Feriados } from 'src/interfaces/feriados';
import { toZonedTime } from 'date-fns-tz';
import { TipoFeriado } from '@prisma/client';

@Injectable()
export class FeriadosService {
  private readonly fusoHorario: string;

  constructor(private readonly prisma: PrismaService) {
    this.fusoHorario = 'America/Bahia';
  }

  async create(createFeriadoDto: CreateFeriadoDto): Promise<IMessage> {
    try {
      const { nome, nacional, dataInicio, dataFim, tipoFeriado } = createFeriadoDto;

      await this.prisma.feriados.create({
        data: { dataInicio, dataFim, tipoFeriado, nome, nacional },
      });
      return { message: 'Feriado criado com sucesso', statusCode: HttpStatus.CREATED };
    } catch (error) {
      throw new HttpException(`Erro ao registrar feriado ${error.message}`, HttpStatus.CONFLICT);
    }
  }

  async findAll(): Promise<IGenerico<Feriados[]>> {
    try {
      const dados = await this.prisma.feriados.findMany();

      if (!dados || dados.length === 0) {
        throw new HttpException('Nenhum feriado encontrado', HttpStatus.NOT_FOUND);
      }
      dados.forEach((element) => {
        const { dataInicio, dataFim } = element;
        const tempI = dataInicio.split('-');
        const tempF = dataFim.split('-');
        element.dataInicio = `${tempI[2]}/${tempI[1]}/${tempI[0]}`;
        element.dataFim = `${tempF[2]}/${tempF[1]}/${tempF[0]}`;
      });
      return { dados, statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(
        `Erro ao consultar tabela feriados: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findAnoTipo(ano: string, tipoFeriado: TipoFeriado): Promise<IGenerico<Feriados[]>> {
    try {
      const dados = await this.prisma.feriados.findMany({
        where: {
          AND: [
            {
              dataInicio: {
                startsWith: ano,
              },
              tipoFeriado,
            },
          ],
        },
      });
      return { dados, statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(
        `Erro ao consultar tabela feriados: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findDadosAnos(): Promise<{ dados: {}; statusCode: HttpStatus }> {
    try {
      const dados = await this.prisma.$queryRaw`
      SELECT DISTINCT LEFT(dataInicio, 4) AS ano
      FROM Feriados
      ORDER BY ano DESC
      `;
      return { dados, statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(
        `Erro ao consultar tabela feriados: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findAno(ano: number): Promise<any> {
    try {
      const feriadosSem = [];
      const dadosFeriados = await this.prisma.feriados.findMany({ where: { nacional: false } });
      const dadosFeriadosPerm = await this.prisma.feriados.findMany({ where: { nacional: true } });
      dadosFeriados.forEach((element) => {
        const anoInicio = element.dataInicio.split('-')[0];
        if (ano === +anoInicio) {
          const { dataInicio, dataFim } = element;
          const tempI = dataInicio.split('-');
          const tempF = dataFim.split('-');
          element.dataInicio = `${tempI[2]}/${tempI[1]}/${tempI[0]}`;
          element.dataFim = `${tempF[2]}/${tempF[1]}/${tempF[0]}`;
          feriadosSem.push({
            id: element.id,
            dataInicio: `${tempI[2]}/${tempI[1]}/${tempI[0]}`,
            dataFim: `${tempF[2]}/${tempF[1]}/${tempF[0]}`,
            nacional: element.nacional,
            nome: element.nome,
          });
        }
      });

      return { feriadosSem, dadosFeriadosPerm, statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(
        `Erro ao consultar tabela feriados: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findOne(id: number): Promise<IGenerico<Feriados>> {
    try {
      const dados = await this.prisma.feriados.findUnique({ where: { id } });
      if (!dados) {
        throw new HttpException('Sem registro de dados', HttpStatus.NOT_FOUND);
      }
      return { dados, statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(
        `Erro ao consultar tabela feriados: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findMesAno(mes: number, ano: number) {
    try {
      const dadosFeriados = await this.prisma.feriados.findMany({ where: { nacional: false } });
      const dadosFeriadosPerm = await this.prisma.feriados.findMany({ where: { nacional: true } });
      const feriadosDoMes = [];
      for (let index = 0; index < dadosFeriados.length; index++) {
        const { nome, dataInicio, dataFim, tipoFeriado } = dadosFeriados[index];
        const tempAno = dataInicio.split('-')[0];
        const tempMes = dataInicio.split('-')[1];
        if (ano === +tempAno) {
          if (mes === +tempMes) {
            feriadosDoMes.push({
              tipoFeriado,
              nome,
              dataInicio,
              dataFim,
            });
            continue;
          }
        }
        const tempAnoFim = dataFim.split('-')[0];
        const tempMesFim = dataFim.split('-')[1];
        if (ano === +tempAnoFim) {
          if (mes === +tempMesFim) {
            feriadosDoMes.push({
              tipoFeriado,
              nome,
              dataInicio,
              dataFim,
            });
          }
        }
      }
      for (let index = 0; index < dadosFeriadosPerm.length; index++) {
        const { nome, dataInicio, dataFim, tipoFeriado } = dadosFeriadosPerm[index];
        const tempMes = dataInicio.split('-')[1];
        if (mes === +tempMes) {
          feriadosDoMes.push({
            tipoFeriado,
            nome,
            dataInicio,
            dataFim,
          });
          continue;
        }
        const temMesFim = dataInicio.split('-')[1];
        if (mes === +temMesFim) {
          feriadosDoMes.push({ tipoFeriado, nome, dataInicio, dataFim });
        }
      }

      return feriadosDoMes;
    } catch (error) {
      throw new HttpException(
        `Erro ao consultar a tabela ausência ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async update(id: number, updateFeriadoDto: UpdateFeriadoDto) {
    try {
      await this.prisma.feriados.update({
        where: { id },
        data: updateFeriadoDto,
      });
      return { message: 'Feriado atualizado com sucesso', statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(`Erro ao atualizar feriado: ${error.message}`, HttpStatus.CONFLICT);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.feriados.delete({ where: { id } });
      return { message: 'Feriado removido com sucesso', statusCode: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(`Erro ao deletar feriado: ${error.message}`, HttpStatus.NOT_FOUND);
    }
  }
}
