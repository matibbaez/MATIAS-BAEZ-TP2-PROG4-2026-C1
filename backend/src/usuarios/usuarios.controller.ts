import { Controller, Get, Post, Delete, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import * as bcrypt from 'bcrypt';

@Controller('usuarios')
@UseGuards(AdminGuard) 
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  async listarTodos() {
    return this.usuariosService.obtenerTodosLosUsuarios();
  }

  @Post()
  async crearUsuarioAdmin(@Body() body: any) {
    if (!body.correo || !body.nombreUsuario || !body.contrasena || !body.perfil) {
      throw new BadRequestException('Faltan campos obligatorios para crear el usuario.');
    }

    const existeCorreo = await this.usuariosService.buscarPorCorreo(body.correo);
    if (existeCorreo) throw new BadRequestException('El correo ya está registrado.');

    const existeUsername = await this.usuariosService.buscarPorNombreUsuario(body.nombreUsuario);
    if (existeUsername) throw new BadRequestException('El nombre de usuario ya existe.');

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(body.contrasena, salt);

    const nuevoUser = await this.usuariosService.crear({
      ...body,
      contrasena: passHash,
      activo: true
    });

    const userObj = nuevoUser.toObject();
    delete (userObj as any).contrasena;
    return userObj;
  }

  @Delete(':id')
  async darDeBaja(@Param('id') id: string) {
    return this.usuariosService.deshabilitarUsuario(id);
  }

  @Post(':id/rehabilitar')
  async darDeAlta(@Param('id') id: string) {
    return this.usuariosService.rehabilitarUsuario(id);
  }
}