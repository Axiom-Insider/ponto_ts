import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FuncionarioService } from 'src/funcionario/funcionario.service';
import { AuthDto } from './dto/auth.dto';
import { compareSync as bcryptCompareSync } from 'bcrypt';
import { hashSync as bcryptHashSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UpdateFuncionarioDto } from 'src/funcionario/dto/update-funcionario.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    private jwtEpiration: number
    constructor(private readonly funcionarioService: FuncionarioService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {
        this.jwtEpiration = +this.configService.get<number>('JWT_EXPIRATION_TIME')
    }

    async signIn(loginDto:LoginDto) {
        try {
            const {matricula, senha, novaSenha} = loginDto
            const found = await this.funcionarioService.findMatricula(matricula)
    
            if (!found.dados) {
                throw ('Nenhum funcionário com essas credencias foi encontrado')
            }
            if (found.dados.primeiraEntrada && bcryptCompareSync(senha, found.dados.senha)) {
                const payload = { sub: found.dados.id, username: found.dados.matricula }
                const token = this.jwtService.sign(payload)
                return { token, expiresIn: this.jwtEpiration, statusCode: HttpStatus.OK }
            }

            if(!bcryptCompareSync(senha, found.dados.senha))throw ("Senha incorreta")

            if(senha != found.dados.senha){
                throw ("Senha incorreta. A senha para a primeira sessão é '123'")
            }
            const updateFuncionarioDto: UpdateFuncionarioDto = {
                matricula,
                senha:bcryptHashSync(novaSenha, 10),
                primeiraEntrada:true
            }

            return await this.funcionarioService.update(matricula, updateFuncionarioDto)

        } catch (error) {
            throw new HttpException(`${error}`, HttpStatus.NOT_FOUND)
        }
    }


}
