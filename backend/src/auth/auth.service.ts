import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async registrar(registroDto: RegistroDto, urlImagenPerfil: string) {
    const existeCorreo = await this.usuariosService.buscarPorCorreo(registroDto.correo);
    if (existeCorreo) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    const existeUsername = await this.usuariosService.buscarPorNombreUsuario(registroDto.nombreUsuario);
    if (existeUsername) {
      throw new BadRequestException('El nombre de usuario ya está en uso.');
    }

    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(registroDto.contrasena, salt);

    const nuevoUsuario = await this.usuariosService.crear({
      ...registroDto,
      contrasena: contrasenaEncriptada,
      imagenPerfil: urlImagenPerfil || undefined, 
    });

    const usuarioLimpio = nuevoUsuario.toObject();
    delete (usuarioLimpio as any).contrasena;
    return usuarioLimpio;
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.buscarParaLogin(loginDto.loginInput);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas (usuario no encontrado).');
    }

    const contrasenaValida = await bcrypt.compare(loginDto.contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales inválidas (contraseña incorrecta).');
    }

    const usuarioLimpio = usuario.toObject();
    delete (usuarioLimpio as any).contrasena;
    return usuarioLimpio;
  }
}