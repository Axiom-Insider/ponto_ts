import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { FeriadosService } from './feriados.service';
import { CreateFeriadoDto } from './dto/create-feriado.dto';
import { UpdateFeriadoDto } from './dto/update-feriado.dto';
import { Response } from 'express';

@Controller('feriados')
export class FeriadosController {
  constructor(private readonly feriadosService: FeriadosService) {}

  @Post()
  async create(@Body() createFeriadoDto: CreateFeriadoDto, @Res() res: Response) {
    const dados = await  this.feriadosService.create(createFeriadoDto)
    return res.status(dados.statusCode).json(dados)
  }

  @Get()
  async findAll(@Res() res: Response) {
    const dados = await this.feriadosService.findAll()
    return res.status(dados.statusCode).json(dados.dados)
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
      const dados = await this.feriadosService.findOne(+id)
      return res.status(dados.statusCode).json(dados.dados)
    }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeriadoDto: UpdateFeriadoDto) {
    return this.feriadosService.update(+id, updateFeriadoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    const dados = await this.feriadosService.remove(+id);
    return res.status(dados.statusCode).json(dados)
  }
}
