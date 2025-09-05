import { Controller, Get, Res } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { Response} from 'express';

@Controller('documento')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {  
  }

    @Get()
    async create(){
      return this.documentoService.criar()
    }

    @Get('baixar')
    async baixar(@Res() res: Response){
      const file = this.documentoService.baixar()
      res.download(file, "baixado", (erro)=>{
        if (erro) {
          console.error("Erro ao enviar o arquivo:", erro);
          res.status(500).send("Erro ao enviar o PDF");
        }
      })
    }

}
