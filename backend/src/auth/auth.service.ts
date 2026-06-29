import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService
  ) {}

  private async generarPaqueteSesion(usuario: any) {
    const payload = {
      sub: usuario._id,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.perfil || 'usuario'
    };

    return {
      usuario,
      token: await this.jwtService.signAsync(payload)
    };
  }

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
    
    return await this.generarPaqueteSesion(usuarioLimpio);
  }

  async login(loginDto: LoginDto) {
    const usuario: any = await this.usuariosService.buscarParaLogin(loginDto.loginInput);
    
    const errorGenerico = 'Credenciales inválidas (usuario o contraseña incorrectos).';

    if (!usuario) {
      throw new UnauthorizedException(errorGenerico);
    }

    const contrasenaValida = await bcrypt.compare(loginDto.contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      throw new UnauthorizedException(errorGenerico);
    }

    if (usuario.activo === false) {
      throw new UnauthorizedException('Acceso denegado: Tu cuenta fue deshabilitada por un administrador.');
    }

    const usuarioLimpio = usuario.toObject();
    delete (usuarioLimpio as any).contrasena;
    
    return await this.generarPaqueteSesion(usuarioLimpio);
  }

  async autorizar(body: { token?: string }) {
    if (!body?.token) {
      throw new UnauthorizedException('No se proporcionó ningún token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(body.token);

      const usuario: any = await this.usuariosService.buscarPorCorreo(payload.correo);
      const estaActivo = usuario?.activo !== false; 

      if (!usuario || !estaActivo) {
        throw new UnauthorizedException('Usuario deshabilitado o inexistente');
      }

      const usuarioLimpio = typeof usuario.toObject === 'function' ? usuario.toObject() : { ...usuario };
      delete usuarioLimpio.contrasena;
      
      return usuarioLimpio;

    } catch (error: any) {
      console.log('❌ [AUTH] Falló la autorización en NestJS:', error?.message || 'Error desconocido'); 
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async refrescar(body: { token?: string }) {
    if (!body?.token) {
      throw new UnauthorizedException('Token inexistente');
    }

    try {
      const payload = await this.jwtService.verifyAsync(body.token);

      const nuevoPayload = {
        sub: payload.sub,
        correo: payload.correo,
        nombreUsuario: payload.nombreUsuario,
        rol: payload.rol
      };

      return {
        token: await this.jwtService.signAsync(nuevoPayload)
      };
    } catch (error: any) {
      console.log('❌ [AUTH] Falló el refresh en NestJS:', error?.message);
      throw new UnauthorizedException('No se puede refrescar: la sesión ya expiró');
    }
  }
}