import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('file'))
  async registrar(
    @Body() registroDto: RegistroDto,
    @UploadedFile() file: any
  ) {
    let urlFoto = '';
    if (file) {
      urlFoto = `https://avatar.iran.liara.run/username?username=${registroDto.nombre}+${registroDto.apellido}`;
    }
    return this.authService.registrar(registroDto, urlFoto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}