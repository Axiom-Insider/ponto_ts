import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { HorarioService } from 'src/horario/horario.service';
import { FuncionarioService } from 'src/funcionario/funcionario.service';


@Injectable()
export class DocumentoService {

    constructor(private readonly horariosService:HorarioService, private readonly funcionarioService:FuncionarioService) { }

     nomeMes(num: number) {
        const date = new Date()
        date.setMonth(num - 1)

        return date.toLocaleString('default', { month: 'long' })
     }

    async criarDocumento(id_funcionario:number, mes:number, ano:number){
        try {
        const nomeMes = this.nomeMes(mes)
        const funcionario = await this.funcionarioService.findId(id_funcionario)
        const {nome, cargo, matricula} = funcionario.dados
        const historico = await this.horariosService.getHistoricoFuncionario(id_funcionario, mes, ano)
        var user = historico.historico
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
        a:user,
        matricula,
        nome,
        cargo,
        nomeMes
    });

    // 5. Gerar o documento final
    const buffer = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
    });

    // 6. Salvar o arquivo
    fs.writeFileSync("documentos/saida.docx", buffer);

        return console.log("Documento gerado com sucesso!");   
        } catch (error) {
            throw new HttpException(`Erro ao consultar tabela funcionário: ${error}`, HttpStatus.NOT_FOUND)
        }
}

    baixar(){
        const filePath = path.join("/home/polo/Documentos/projeto-ponto-ts/ponto/src/documento/pdfs/output_puppeteer.pdf")
        
        return filePath
    }
}
