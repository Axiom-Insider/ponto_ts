import { Controller, Get, Param, Res } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('documento')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  @Get('/polouab/:id_funcionario/:mes/:ano')
  async polouab(
    @Param('id_funcionario') id_funcionario: string,
    @Param('mes') mes: string,
    @Param('ano') ano: string,
    @Res() res: Response,
  ) {
    try {
      const caminho = await this.documentoService.polouab(+id_funcionario, +mes, +ano);

      return res.download(caminho, (erro) => {
        if (erro) {
          console.log('Erro no download', erro);
        } else {
          fs.unlink(caminho, (erro) => {
            if (erro) console.error('Erro ao excluir:', erro);
            else console.log('Arquivo removido:', caminho);
          });
        }
      });
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error);
      return res.status(500).send('Erro ao enviar o documento');
    }
  }

  @Get('/confianca/:id_funcionario/:mes/:ano')
  async confianca(
    @Param('id_funcionario') id_funcionario: string,
    @Param('mes') mes: string,
    @Param('ano') ano: string,
    @Res() res: Response,
  ) {
    try {
      const caminho = await this.documentoService.confianca(+id_funcionario, +mes, +ano);

      return res.download(caminho, (erro) => {
        if (erro) {
          console.log('Erro no download', erro);
        } else {
          fs.unlink(caminho, (erro) => {
            if (erro) console.error('Erro ao excluir:', erro);
            else console.log('Arquivo removido:');
          });
        }
      });
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
