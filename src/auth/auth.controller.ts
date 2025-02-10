import { Body, Post , Controller, Res } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Response } from 'express'
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService:AuthService){}

    @Post('login')
    async singIn(@Res() res:Response, @Body() loginDto: LoginDto){
        const auth =  await this.authService.signIn(loginDto)
        return res.status(auth.statusCode).json(auth)
    }

}
