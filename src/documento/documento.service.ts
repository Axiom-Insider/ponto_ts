import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { HorarioService } from 'src/horario/horario.service';


@Injectable()
export class DocumentoService {

    constructor(private readonly horariosService:HorarioService) { }

    async criarDocumento(id_funcionario:number, ano:number, mes:number){
        try {
        
        const historico = this.horariosService.getHistoricoFuncionario(id_funcionario, mes, ano)
        console.log(historico);    
        const filePath = path.join(__dirname, '..','documento', 'pdfs', 'folhaDePontoPoloUAB.docx')
        const content = fs.readFileSync(filePath, "binary");

    // 2. Carregar no PizZip
    const zip = new PizZip(content);

    // 3. Criar instância do Docxtemplater
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    // 4. Definir os dados que vão substituir os placeholders
    doc.render({
        matricula:"934.829.843",
        nome: "Francisco Martins Gonçalves Gomes",
        cargo: "Servente (Auxiliar de Serviços Gerais)",
        data: "05/09/2025",
    });

    // 5. Gerar o documento final
    const buffer = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
    });

    // 6. Salvar o arquivo
    fs.writeFileSync("documentos/saida.docx", buffer);

    console.log("Documento gerado com sucesso!");   
        } catch (error) {
            throw new HttpException(`Erro ao consultar tabela funcionário: ${error}`, HttpStatus.NOT_FOUND)
        }
}

    baixar(){
        const filePath = path.join("/home/polo/Documentos/projeto-ponto-ts/ponto/src/documento/pdfs/output_puppeteer.pdf")
        
        return filePath
    }
}
