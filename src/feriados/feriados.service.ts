import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFeriadoDto } from './dto/create-feriado.dto';
import { UpdateFeriadoDto } from './dto/update-feriado.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { IMessage } from 'src/interfaces/message.type';
import { IGenerico } from 'src/interfaces/dados';
import { Feriados } from 'src/interfaces/feriados';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class FeriadosService {

  private readonly fusoHorario: string;

  constructor(private readonly prisma: PrismaService) { 
    this.fusoHorario = "America/Bahia"
   }

  async create(createFeriadoDto: CreateFeriadoDto): Promise<IMessage> {
    try {
      const { nome, nacional } = createFeriadoDto
      const dataInicio = new Date(createFeriadoDto.dataInicio).toISOString().split("T")[0]
      const dataFim = new Date(createFeriadoDto.dataFim).toISOString().split("T")[0]

      await this.prisma.feriados.create({ data:{dataInicio, dataFim, nome, nacional}})
      return { message: 'Feriado criado com sucesso', statusCode: HttpStatus.CREATED}
    } catch (error) {
            throw new HttpException(`Erro ao registrar feriado ${error.message}`, HttpStatus.CONFLICT)
    }
  }

 async findAll(): Promise<IGenerico<Feriados[]>> {
    try {
      const dados = await this.prisma.feriados.findMany()

      if(!dados || dados.length === 0){
        throw new HttpException('Nenhum feriado encontrado', HttpStatus.NOT_FOUND)
       }
      dados.forEach(element => {
        const {dataInicio, dataFim} = element
        const tempI = dataInicio.split("-")
        const tempF = dataFim.split("-")
        element.dataInicio = `${tempI[2]}/${tempI[1]}/${tempI[0]}`
        element.dataFim = `${tempF[2]}/${tempF[1]}/${tempF[0]}`
      });
      return {dados, statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao consultar tabela feriados: ${error.message}`, HttpStatus.NOT_FOUND)
    }
  }
  async findAno(ano:number):Promise<any>{
    try {
      const feriadosSem = []
      const dadosFeriados = await this.prisma.feriados.findMany({where:{nacional:false}})
      const dadosFeriadosPerm = await this.prisma.feriados.findMany({where:{nacional:true}})
      dadosFeriados.forEach(element => {
        const anoInicio = element.dataInicio.split("-")[0]
        if(ano === +anoInicio){
        const {dataInicio, dataFim} = element
        const tempI = dataInicio.split("-")
        const tempF = dataFim.split("-")
        element.dataInicio = `${tempI[2]}/${tempI[1]}/${tempI[0]}`
        element.dataFim = `${tempF[2]}/${tempF[1]}/${tempF[0]}`
        feriadosSem.push({
              id:element.id,
              dataInicio:`${tempI[2]}/${tempI[1]}/${tempI[0]}`,
              dataFim:`${tempF[2]}/${tempF[1]}/${tempF[0]}`,
              nacional:element.nacional,
              nome:element.nome
          })
        }
      })

      return{feriadosSem, dadosFeriadosPerm, statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao consultar tabela feriados: ${error.message}`, HttpStatus.NOT_FOUND)
    }
  }

  async findOne(id: number): Promise<IGenerico<Feriados>> {
    try {
      const dados = await this.prisma.feriados.findUnique({where:{id}})
      if(!dados){
        throw new HttpException('Sem registro de dados', HttpStatus.NOT_FOUND)
      }
      return {dados, statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao consultar tabela feriados: ${error.message}`, HttpStatus.NOT_FOUND)
    }
  }
/*
  async findFeriadosMesAno(id_funcionario:number, mes:number, ano:number){
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
              
              const dadosFeriados = await this.prisma.feriados.findMany({where: { nacional:false,
                    dataInicio:{gte:inicioDoMes, lt:fimDoMes},
                    dataFim:{gte:inicioDoMes, lt:fimDoMes} 
                  }})
              inicioDoMes.setFullYear(0)
              const dadosFeriadosNacional = await this.prisma.feriados.findMany({where:{
                nacional:true,
                dataInicio:{gte:inicioDoMes, lt:fimDoMes}, 
                dataFim:{gte:inicioDoMes, lt:fimDoMes}
              }})
              
              return {dadosFeriados, dadosFeriadosNacional}
      } catch (error) {
        throw new HttpException(`Erro ao consultar a tabela ausência ${error.message}`, HttpStatus.CONFLICT)
      }
    }
*/
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
      await this.prisma.feriados.delete({where:{id}})
      return {message:'Feriado removido com sucesso', statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao deletar feriado: ${error.message}`, HttpStatus.NOT_FOUND)
    }
  }

  }
