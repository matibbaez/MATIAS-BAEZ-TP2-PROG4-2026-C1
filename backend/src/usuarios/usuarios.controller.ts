import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Get()
  @UseGuards(AdminGuard) 
  async listarTodos() {
    return this.usuariosService.obtenerTodosLosUsuarios();
  }

  @Post()
  @UseGuards(AdminGuard)
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
  @UseGuards(AdminGuard) 
  async darDeBaja(@Param('id') id: string) {
    return this.usuariosService.deshabilitarUsuario(id);
  }

  @Post(':id/rehabilitar')
  @UseGuards(AdminGuard) 
  async darDeAlta(@Param('id') id: string) {
    return this.usuariosService.rehabilitarUsuario(id);
  }

  @Patch(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async cambiarAvatar(@Param('id') id: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se adjuntó ninguna imagen');

    const res = await this.cloudinaryService.subirImagen(file);
    const userActualizado = await this.usuariosService.actualizarFotoPerfil(id, res.secure_url);

    const userObj = userActualizado.toObject();
    delete (userObj as any).contrasena;
    return userObj;
  }
}