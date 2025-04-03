import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashSync as bcryptHashSync } from 'bcrypt'
import { FuncionarioAll } from 'src/interfaces/funcionarioAll.type';
import { FuncionarioOne } from 'src/interfaces/funcionarioOne.type';
import { IGenerico } from 'src/interfaces/dados';
import { IMessage } from 'src/interfaces/message.type';

@Injectable()
export class FuncionarioService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createFuncionarioDto: CreateFuncionarioDto) {
    try {
      const found = await this.prisma.funcionarios.findMany({
        where: { OR: [{ matricula: createFuncionarioDto.matricula }] }
      })

      if (found.length > 0) {
        throw ('Funcionário já foi registrado')
      }
      createFuncionarioDto.senha = '123'
      await this.prisma.funcionarios.create({ data: createFuncionarioDto })
      return { message: 'Funcionário criado com sucesso', statusCode: HttpStatus.CREATED }
    } catch (error) {
      throw new HttpException(`Erro ao criar Funcionário: ${error}`, HttpStatus.NOT_IMPLEMENTED)
    }
  }

  async findAll(): Promise<IGenerico<FuncionarioAll[]>> {
    try {
      const dados: FuncionarioAll[] =  await this.prisma.funcionarios.findMany({ where: { adm: false }, select:{matricula:true, nome:true, cargo:true, senha:true} })
      if (!dados || dados.length === 0) {
        throw ('Nenhum funcionário foi encontrado')
      }
      return {dados, statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao consultar tabela funcionário: ${error}`, HttpStatus.NOT_FOUND)
    }
  }

  async findMatricula(matricula: number):  Promise<IGenerico<FuncionarioOne>> {
    try {
       const dados: FuncionarioOne = await this.prisma.funcionarios.findFirst({where:{matricula}})
        if(dados === null){
          throw ('Sem registros para a matrícula informada')
        }
        return {dados, statusCode:HttpStatus.OK}
    } catch (error) {
      throw new HttpException(`Erro ao consultar tabela funcionário: ${error}`, HttpStatus.NOT_FOUND)
    }
  }

  async update(matricula: number, updateFuncionarioDto: UpdateFuncionarioDto): Promise<IMessage> {
    try {
      const found = await this.prisma.funcionarios.findUnique({
        where: { matricula }
      })
      if (!found) {
        throw ('Funcionario não existe')
      }

      const funcionario = await this.prisma.funcionarios.updateMany({ where: { matricula }, data: updateFuncionarioDto })
      if(funcionario.count > 0){  
        return {  message:'Dados atualizados com sucesso', statusCode: HttpStatus.OK}
      }
      throw ('Nenhuma coluna foi alterada no sistema')
    } catch (error) {
      throw new HttpException(`Erro ao atualizar dados: ${error}`, HttpStatus.NOT_MODIFIED)
    }
  }

  remove(id: number) {
    return `This action removes a #${id} funcionario`;
  }
}
