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

  @Get('')
  async getAll(@Res() res: Response){
    const horario = await this.horarioService.getHorario()
    return res.status(horario.statusCode).json(horario)    
  }

}
