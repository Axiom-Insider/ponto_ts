import { Controller, Get, Param, Res } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { Response } from 'express';

@Controller('documento')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  @Get('/:id_funcionario/:mes/:ano')
  async create(
    @Param('id_funcionario') id_funcionario: string,
    @Param('mes') mes: string,
    @Param('ano') ano: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.documentoService.criarDocumento(
        +id_funcionario,
        +mes,
        +ano,
      );

      return res.download(buffer, 'saida.docx');
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error);
      return res.status(500).send('Erro ao enviar o documento');
    }
  }

  @Get('baixar')
  async baixar(@Res() res: Response) {
    const file = this.documentoService.baixar();
    res.download(file, 'baixado', (erro) => {
      if (erro) {
        console.error('Erro ao enviar o arquivo:', erro);
        res.status(500).send('Erro ao enviar o PDF');
      }
    });
  }
}
