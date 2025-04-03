import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import * as path from 'path';


@Injectable()
export class DocumentoService {

    async criar(){
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
      
        await page.setContent(`
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Folha de Frequência</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        h1 {
            text-align: center;
            font-size: 18px;
            margin-bottom: 20px;
        }
        .header-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        .header-info div {
            width: 48%;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            margin-top: 30px;
        }
        .underline {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 150px;
        }
    </style>
</head>
<body>
    <h1>FOLHA DE FREQUÊNCIA</h1>
    
    <div class="header-info">
        <div>
            MÊS: <span class="underline"></span><br>
            NOME: <span class="underline"></span><br>
            CADASTRO: <span class="underline"></span><br>
        </div>
        <div>
            CARGO / FUNÇÃO: <span class="underline"></span><br>
            CARGA HORÁRIA: 40 hs
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>PRESENÇAS</th>
                <th>FALTAS</th>
                <th>DIAS TRABALHADOS</th>
                <th>OBSERVAÇÃO</th>
                <th>ASSINATURA E CARIMBO DA COORDENADORA</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="5" style="text-align: center; font-weight: bold;">BRASIL</td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </tbody>
    </table>
    
    <div class="footer">
        Polo UAB Juraziro-BA. | Rua Agostinho Muniz, nº. 1010 - A. Bairro São Geraldo. Juraziro / Bahia – Brasil.<br>
        CEP: 48905-740. Tel.: (74) 3613-2144<br>
        E-mail: polooubjuraziroba@gmail.com<br>
        BLOG: polooubjuraziroba.blogspot.com.br<br>
        FAMPAGE: Polo UAB Juraziro – BA
    </div>
</body>
</html>
        `);
      
        await page.pdf({ path: "./src/documento/pdfs/output_puppeteer.pdf", format: "A4" });
      
        await browser.close();
        console.log("PDF gerado com sucesso!");
    return 'ola mundo'
}

    baixar(){
        const filePath = path.join("/home/polo/Documentos/projeto-ponto-ts/ponto/src/documento/pdfs/output_puppeteer.pdf")
        
        return filePath
    }
}
