import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AusenciaService } from './ausencia.service';
import { CreateAusenciaDto } from './dto/create-ausencia.dto';
import { UpdateAusenciaDto } from './dto/update-ausencia.dto';

@Controller('ausencia')
export class AusenciaController {
  constructor(private readonly ausenciaService: AusenciaService) {}
  
  @Post()
  create(@Body() createAusenciaDto: CreateAusenciaDto) {
    return this.ausenciaService.create(createAusenciaDto);
  }

  @Get()
  findAll() {
    return this.ausenciaService.findAll();
  }

  @Get(':id_funcionario/:mes/:ano')
  findMesAno(
    @Param('id_funcionario') id_funcionario: string,
    @Param('mes') mes: string,
    @Param('ano') ano: string,
  ) {
    return this.ausenciaService.findMesAno(+id_funcionario, +mes, +ano);
  }

  @Get('ano/:id_funcionario')
  findAno(
    @Param('id_funcionario') id_funcionario: string,
  ) {
    return this.ausenciaService.findDadosAnos(+id_funcionario);
  } 

  @Get(':id_funcionario')
  findOne(@Param('id_funcionario') id_funcionario: string) {
    return this.ausenciaService.findOne(+id_funcionario);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAusenciaDto: UpdateAusenciaDto) {
    return this.ausenciaService.update(+id, updateAusenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ausenciaService.remove(+id);
  }
    
}
