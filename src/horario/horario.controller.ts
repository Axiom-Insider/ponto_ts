import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { Response } from 'express';
import { HorarioService } from './horario.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';



@Controller('horario')
export class HorarioController {
  constructor(private readonly horarioService: HorarioService) { }

  @Post('entrada')
  async createEntrada(@Body() createHorarioDto: CreateHorarioDto, @Res() res: Response) {
    const horario = await this.horarioService.createEntrada(createHorarioDto)
    return res.status(horario.statusCode).json(horario)
  }

  @Post('saida')
  async CreateSaida(@Body() updateHorarioDto: UpdateHorarioDto, @Res() res: Response) {
    const horario = await this.horarioService.createSaida(updateHorarioDto)
    return res.status(horario.statusCode).json(horario)
  }

  @Get('verificar/:id')
  async verificar(@Param('id') id: string, @Res() res: Response) {
    const horario = await this.horarioService.verificar(+id)
    return res.status(horario.statusCode).json(horario)
  }

  //example de rota http://localhost:3000/horario/1/11/2024
  @Get(':id/:ano/:mes')
  async historico(@Param('id') id: string, @Param('mes') mes: string, @Param('ano') ano: string, @Res() res: Response) {
    const horario = await this.horarioService.historico(+id, mes, ano);
    return res.status(horario.statusCode).json(horario)
  }

  @Patch('/entrada/:id/:ano/:mes/:dia')
  async updateEntrada(@Res() res: Response, @Param('id') id: string, @Param('mes') mes: string, @Param('ano') ano: string, @Param('dia') dia: string, @Body() updateHorarioDto: UpdateHorarioDto) {
    const horario =  await this.horarioService.updateEntrada(+id, mes, ano, dia, updateHorarioDto);
    return res.status(horario.statusCode).json(horario)
  }

  @Patch('/saida/:id/:ano/:mes/:dia')
  async updateSaida(@Res() res: Response, @Param('id') id: string, @Param('mes') mes: string, @Param('ano') ano: string, @Param('dia') dia: string, @Body() updateHorarioDto: UpdateHorarioDto) {
    const horario =  await this.horarioService.updateSaida(+id, mes, ano, dia, updateHorarioDto);
    return res.status(horario.statusCode).json(horario)
   }

  @Delete('/entrada/:id')
  async remove(@Res() res: Response, @Param('id') id: string) {
    const horario = await this.horarioService.removeEntrada(+id);
    return res.status(horario.statusCode).json(horario)
  }
}
