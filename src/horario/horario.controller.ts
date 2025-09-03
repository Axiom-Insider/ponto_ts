import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { HorarioService } from './horario.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('horarios')
export class HorarioController {
  constructor(private readonly horarioService: HorarioService) { }

  @Post('entrada')
  async createEntrada(@Body() createHorarioDto: CreateHorarioDto, @Res() res: Response) {
    const horario = await this.horarioService.registrarEntrada(createHorarioDto)
    return res.status(horario.statusCode).json(horario)
  }
  @Post('saida')
  async createSaida(@Body() createHorarioDto: CreateHorarioDto, @Res() res: Response) {
    const horario = await this.horarioService.registrarSaida(createHorarioDto)
    return res.status(horario.statusCode).json(horario)
    }
    
    @Get('dia')
    async getAll(@Res() res: Response){
      const horario = await this.horarioService.getHorarioDia()
      return res.status(horario.statusCode).json(horario)    
    }
   
    @Patch("editar")
    async editar(@Body() updateHorarioDto: UpdateHorarioDto, @Res() res: Response) {
      const horario = await this.horarioService.editarHorarios(updateHorarioDto)
      return res.status(horario.statusCode).json(horario)
      }
      
      @Get("/verificar/:id_funcionario")
      async verificarRegistroHoje(@Param("id_funcionario") id_funcionario: string, @Res() res: Response){
        const horario = await this.horarioService.verificarHorarioDoFuncionario(parseInt(id_funcionario))
        return res.status(horario.statusCode).json(horario)    
        }

   @Get("/historico/:id_funcionario/:mes/:ano")
  async getHistoricoFuncionario(@Param("id_funcionario") id_funcionario: string, @Param("mes") mes: string, @Param("ano") ano: string, @Res() res: Response){
    const horario = await this.horarioService.getHistoricoFuncionario(+id_funcionario, +mes, +ano)
    return res.status(horario.statusCode).json(horario)    
  }

}
