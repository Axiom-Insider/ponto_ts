import { Controller, Get, Param, Res } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { Response} from 'express';

@Controller('documento')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {  
  }

    @Get("/:id_funcionario/:mes/:ano")
    async create(@Param("id_funcionario") id_funcionario: string, @Param("mes") mes: string, @Param("ano") ano: string, @Res() res: Response){
      const horario = await this.documentoService.criarDocumento(+id_funcionario, +mes, +ano)
      return 
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
