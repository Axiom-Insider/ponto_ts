import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashSync as bcryptHashSync } from 'bcrypt'

@Injectable()
export class FuncionarioService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createFuncionarioDto: CreateFuncionarioDto) {
    try {
      const found = await this.prisma.funcionarios.findMany({
        where: { OR: [{ matricula: createFuncionarioDto.matricula }, { email: createFuncionarioDto.email }] }
      })

      if (found.length > 0) {
        throw ('Já registrado')
      }

      await this.prisma.funcionarios.create({ data: createFuncionarioDto })
      return { message: 'Funcionário criado com sucesso', codeStatus: HttpStatus.CREATED }
    } catch (error) {
      throw new HttpException(`Erro ao criar Funcionário: ${error}`, HttpStatus.NOT_IMPLEMENTED)
    }
  }

  async findAll(): Promise<CreateFuncionarioDto[]> {
    try {
      const funcionario = await this.prisma.funcionarios.findMany({ where: { adm: false }, select:{matricula:true, nome:true, email:true, cargo:true, senha:true} })
      if (!funcionario || funcionario.length === 0) {
        throw ('Nenhum funcionário foi encontrado')
      }
      return funcionario
    } catch (error) {
      throw new HttpException(`Erro ao consultar tabela funcionário: ${error}`, HttpStatus.NOT_FOUND)
    }
  }

  findOne(id: number) {
    return 'vou mudar ainda'
  }

  async update(id: number, updateFuncionarioDto: UpdateFuncionarioDto) {
    try {
      const found = await this.prisma.funcionarios.findUnique({
        where: { id }
      })
      if (!found) {
        throw ('Funcionario não existe')
      }

      await this.prisma.funcionarios.update({ where: { id }, data: updateFuncionarioDto })
      return { message: 'Funcionário atualizado com sucesso', codeStatus: HttpStatus.ACCEPTED}
    } catch (error) {
      throw new HttpException(`Erro ao atualizar dados: ${error}`, HttpStatus.NOT_MODIFIED)
    }
  }

  remove(id: number) {
    return `This action removes a #${id} funcionario`;
  }
}
