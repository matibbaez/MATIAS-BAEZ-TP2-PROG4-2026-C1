import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>
  ) {}

  async crear(datosUsuario: any): Promise<UsuarioDocument> {
    const nuevoUsuario = new this.usuarioModel(datosUsuario);
    return nuevoUsuario.save();
  }

  async buscarPorCorreo(correo: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({ correo: correo.toLowerCase().trim() }).exec();
  }

  async buscarPorNombreUsuario(nombreUsuario: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({ nombreUsuario: nombreUsuario.trim() }).exec();
  }

  async buscarParaLogin(input: string): Promise<UsuarioDocument | null> {
    const cleanInput = input.trim();
    return this.usuarioModel.findOne({
      $or: [
        { correo: cleanInput.toLowerCase() },
        { nombreUsuario: cleanInput }
      ]
    }).exec();
  }

  async obtenerTodosLosUsuarios(): Promise<any[]> {
    return this.usuarioModel.find().select('-contrasena').sort({ createdAt: -1 }).exec();
  }

  async deshabilitarUsuario(id: string) {
    const user = await this.usuarioModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado en la base de datos');

    user.activo = false; 
    return user.save();
  }

  async rehabilitarUsuario(id: string) {
    const user = await this.usuarioModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado en la base de datos');

    user.activo = true; 
    return user.save();
  }

  async actualizarFotoPerfil(id: string, nuevaUrl: string) {
    const user = await this.usuarioModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado en la base de datos');

    user.imagenPerfil = nuevaUrl;
    return user.save();
  }
}