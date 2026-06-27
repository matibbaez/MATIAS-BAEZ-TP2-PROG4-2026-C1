import { Controller, Post, Body, UseInterceptors, UploadedFile, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; 

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService, 
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('file'))
  async registrar(
    @Body() registroDto: RegistroDto,
    @UploadedFile() file: Express.Multer.File, 
  ) {
    let urlFoto = `https://api.dicebear.com/7.x/initials/svg?seed=${registroDto.nombre}+${registroDto.apellido}&backgroundColor=2563eb&textColor=ffffff`;

    if (file) {
      console.log('☁️ [CLOUDINARY] Subiendo archivo adjunto a la nube...');
      const resultado = await this.cloudinaryService.subirImagen(file);
      urlFoto = resultado.secure_url;
      console.log('✅ [CLOUDINARY] Enlace público obtenido:', urlFoto);
    }

    return this.authService.registrar(registroDto, urlFoto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  async autorizar(@Body() body: { token: string }) {
    return await this.authService.autorizar(body);
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  async refrescar(@Body() body: { token: string }) {
    return await this.authService.refrescar(body);
  }
}