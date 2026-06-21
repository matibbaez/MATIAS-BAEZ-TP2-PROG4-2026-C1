import { Injectable, BadRequestException } from '@nestjs/common';
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
}